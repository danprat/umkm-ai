export interface AspectRatio {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
}

export const aspectRatios: AspectRatio[] = [
  { id: "ig-feed", name: "IG Feed", ratio: "1:1", width: 1080, height: 1080 },
  { id: "story", name: "Story/Reels", ratio: "9:16", width: 1080, height: 1920 },
  { id: "landscape", name: "Landscape", ratio: "16:9", width: 1920, height: 1080 },
  { id: "portrait", name: "Portrait", ratio: "4:5", width: 1080, height: 1350 },
];

interface AspectRatioSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AspectRatioSelector({ selectedId, onSelect }: AspectRatioSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {aspectRatios.map((ratio) => (
        <button
          key={ratio.id}
          onClick={() => onSelect(ratio.id)}
          className={`flex flex-col items-center gap-1 p-2 sm:p-3 border-[3px] border-foreground transition-all ${
            selectedId === ratio.id
              ? "bg-foreground text-background"
              : "bg-background hover:bg-muted active:bg-muted"
          }`}
        >
          {/* Aspect ratio preview */}
          <div 
            className={`border-2 ${selectedId === ratio.id ? "border-background" : "border-foreground"}`}
            style={{
              width: ratio.width > ratio.height ? 20 : (20 * ratio.width / ratio.height),
              height: ratio.height > ratio.width ? 20 : (20 * ratio.height / ratio.width),
            }}
          />
          <div className="text-center">
            <div className="font-bold text-[10px] sm:text-xs uppercase leading-tight">{ratio.name}</div>
            <div className={`text-[9px] sm:text-[10px] ${selectedId === ratio.id ? "text-background/70" : "text-muted-foreground"}`}>
              {ratio.ratio}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
