interface NotePreviewProps {
  content: string;
  maxLength?: number;
  className?: string;
}

const headingStyles = {
  1: 'font-bold text-[15px]',
  2: 'font-semibold text-[14px]',
  3: 'font-semibold',
} as const;

export function NotePreview({ content, maxLength, className }: NotePreviewProps) {
  const text = maxLength ? content.slice(0, maxLength) : content;
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  const rendered = lines.map((line, i) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match && match[1] && match[2]) {
      const level = match[1].length as 1 | 2 | 3;
      return (
        <span key={i} className={headingStyles[level]}>
          {match[2]}
        </span>
      );
    }
    return <span key={i}>{line}</span>;
  });

  return (
    <p className={className}>
      {rendered.map((el, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {el}
        </span>
      ))}
    </p>
  );
}
