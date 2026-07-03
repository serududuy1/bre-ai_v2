export default function PanelTitle({ children, icon: Icon }) {
  return (
    <div className="panel-title">
      {Icon && <Icon size={18} />}
      {children}
    </div>
  );
}
