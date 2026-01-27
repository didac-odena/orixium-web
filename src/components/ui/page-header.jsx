export default function PageHeader({
  title,
  subtitle,
  className = "space-y-1",
  titleClassName = "text-2xl font-semibold",
  subtitleClassName = "text-muted text-xs",
  
}) {
  if (!title) return null;

  return (
    <header className={className}>
      <h1 className={titleClassName}>{title}</h1>
      {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
    </header>
  );
}
