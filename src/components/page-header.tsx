type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
        {title}
      </h1>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  );
}
