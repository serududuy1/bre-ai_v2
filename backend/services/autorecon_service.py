import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from models.activity import ActivityLog
from models.autorecon import AutoReconJob
from models.user import User
from utils.config import settings

COMMON_KEY_COLUMNS = ["id", "transaction_id", "reference", "ref_no", "invoice_no", "account_no"]


async def run_reconciliation(
    db: Session,
    files: list[UploadFile],
    current_user: User,
    key_column: str | None = None,
    job_name: str | None = None,
) -> dict[str, Any]:
    if len(files) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auto Recon membutuhkan minimal 2 file.",
        )

    datasets = []
    for file in files:
        rows = await _read_file(file)
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} kosong atau formatnya tidak terbaca.",
            )
        datasets.append({"filename": file.filename, "rows": rows, "columns": set(rows[0].keys())})

    selected_key = key_column or _detect_key_column(datasets)
    for dataset in datasets:
        if selected_key not in dataset["columns"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kolom kunci '{selected_key}' tidak ada di file {dataset['filename']}.",
            )

    result = _compare_datasets(datasets, selected_key)
    output_path = _write_result(result)

    job = AutoReconJob(
        job_name=job_name or f"autorecon-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
        key_column=selected_key,
        input_files=[dataset["filename"] for dataset in datasets],
        summary=result["summary"],
        output_path=str(output_path),
        created_by=current_user.id,
    )
    db.add(job)
    db.flush()
    db.add(
        ActivityLog(
            action="autorecon_completed",
            description=f"Auto Recon selesai untuk {len(files)} file.",
            user_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(job)

    result["job_id"] = job.id
    result["output_path"] = str(output_path)
    return result


def list_reconciliation_jobs(db: Session) -> list[AutoReconJob]:
    return db.query(AutoReconJob).order_by(AutoReconJob.created_at.desc()).limit(50).all()


async def _read_file(file: UploadFile) -> list[dict[str, str]]:
    raw = await file.read()
    text = raw.decode("utf-8-sig")
    suffix = Path(file.filename or "").suffix.lower()

    if suffix == ".json":
        return _parse_json(text)
    if suffix in [".tsv", ".tab"]:
        return _parse_delimited(text, delimiter="\t")
    if suffix in [".csv", ".txt", ""]:
        return _parse_delimited(text)

    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail=f"Format file {file.filename} belum didukung. Gunakan CSV, TSV, atau JSON.",
    )


def _parse_delimited(text: str, delimiter: str | None = None) -> list[dict[str, str]]:
    sample = text[:2048]
    if delimiter is None:
        try:
            delimiter = csv.Sniffer().sniff(sample).delimiter
        except csv.Error:
            delimiter = ","

    reader = csv.DictReader(StringIO(text), delimiter=delimiter)
    if not reader.fieldnames:
        return []
    return [{key: (value or "").strip() for key, value in row.items()} for row in reader]


def _parse_json(text: str) -> list[dict[str, str]]:
    data = json.loads(text)
    if isinstance(data, dict):
        data = data.get("rows") or data.get("data") or []
    if not isinstance(data, list):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON harus berupa array object.")
    return [{str(key): str(value).strip() for key, value in row.items()} for row in data if isinstance(row, dict)]


def _detect_key_column(datasets: list[dict[str, Any]]) -> str:
    common_columns = set.intersection(*(dataset["columns"] for dataset in datasets))
    for candidate in COMMON_KEY_COLUMNS:
        if candidate in common_columns:
            return candidate
    if common_columns:
        return sorted(common_columns)[0]
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Tidak ada kolom yang sama di semua file. Isi key column secara manual.",
    )


def _compare_datasets(datasets: list[dict[str, Any]], key_column: str) -> dict[str, Any]:
    indexes = []
    duplicate_keys = {}
    for dataset in datasets:
        grouped = defaultdict(list)
        for row in dataset["rows"]:
            grouped[row.get(key_column, "")].append(row)
        indexes.append(grouped)
        duplicate_keys[dataset["filename"]] = [
            key for key, count in Counter(row.get(key_column, "") for row in dataset["rows"]).items() if count > 1
        ]

    all_keys = set().union(*(set(index.keys()) for index in indexes))
    matched_keys = []
    missing_by_file = {dataset["filename"]: [] for dataset in datasets}
    mismatches = []

    for key in sorted(all_keys):
        present = [key in index for index in indexes]
        if all(present):
            matched_keys.append(key)
            mismatches.extend(_find_value_mismatches(key, datasets, indexes, key_column))
        else:
            for dataset, exists in zip(datasets, present):
                if not exists:
                    missing_by_file[dataset["filename"]].append(key)

    return {
        "key_column": key_column,
        "files": [dataset["filename"] for dataset in datasets],
        "summary": {
            "total_unique_keys": len(all_keys),
            "matched_keys": len(matched_keys),
            "missing_total": sum(len(keys) for keys in missing_by_file.values()),
            "mismatch_total": len(mismatches),
            "duplicate_total": sum(len(keys) for keys in duplicate_keys.values()),
        },
        "missing_by_file": missing_by_file,
        "duplicate_keys": duplicate_keys,
        "mismatches": mismatches[:200],
    }


def _find_value_mismatches(key: str, datasets: list[dict[str, Any]], indexes: list[dict], key_column: str) -> list[dict]:
    common_columns = set.intersection(*(dataset["columns"] for dataset in datasets)) - {key_column}
    mismatches = []
    for column in sorted(common_columns):
        values = {
            dataset["filename"]: indexes[index][key][0].get(column, "")
            for index, dataset in enumerate(datasets)
        }
        if len(set(values.values())) > 1:
            mismatches.append({"key": key, "column": column, "values": values})
    return mismatches


def _write_result(result: dict[str, Any]) -> Path:
    output_dir = Path(settings.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"autorecon-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.json"
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return output_path
