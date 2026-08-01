interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}