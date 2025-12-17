interface Option {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
}

interface OptionGridProps {
  options: Option[];
  selectedId: string;
  onSelect: (id: string) => void;
  showEmoji?: boolean;
  columns?: 2 | 3;
}

export function OptionGrid({
  options,
  selectedId,
  onSelect,
  showEmoji = false,
  columns = 2,
}: OptionGridProps) {
  return (
    <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`p-3 border-[3px] border-foreground text-left transition-all ${
            selectedId === option.id
              ? "bg-accent"
              : "bg-background hover:bg-muted active:bg-muted"
          }`}
        >
          <div className="flex items-start gap-2">
            {showEmoji && option.emoji && (
              <span className="text-lg flex-shrink-0">{option.emoji}</span>
            )}
            <div className="min-w-0">
              <div className="font-bold text-xs uppercase leading-tight">{option.name}</div>
              {option.description && (
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                  {option.description}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
