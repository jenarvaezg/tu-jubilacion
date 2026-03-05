interface SourceLinkProps {
  readonly authors: string;
  readonly year: number;
  readonly title: string;
  readonly publication: string;
  readonly url?: string;
}

export function SourceLink({ authors, year, title, publication, url }: SourceLinkProps) {
  const citation = `${authors} (${year}). "${title}". ${publication}.`;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-xs text-primary hover:underline leading-relaxed"
      >
        {citation}
      </a>
    );
  }

  return <p className="text-xs text-gray-600 leading-relaxed">{citation}</p>;
}
