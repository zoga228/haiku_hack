type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-sans text-2xl font-semibold leading-tight text-content sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-content-secondary">{description}</p>
      ) : null}
    </div>
  );
}
