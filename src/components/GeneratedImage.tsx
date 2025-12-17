import { Download, Share2, Loader2 } from "lucide-react";

interface GeneratedImageProps {
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
}

export function GeneratedImage({ imageUrl, isLoading, error }: GeneratedImageProps) {
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `umkm-ai-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      alert("Link gambar berhasil disalin!");
    } catch {
      alert("Gagal menyalin link");
    }
  };

  if (isLoading) {
    return (
      <div className="brutal-card flex flex-col items-center justify-center h-80">
        <div className="bg-accent p-4 border-[3px] border-foreground mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <span className="font-bold uppercase tracking-wider">
          Sedang membuat gambar<span className="loading-dots"></span>
        </span>
        <span className="text-muted-foreground text-sm mt-2">
          Ini mungkin memakan waktu beberapa detik
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brutal-card bg-destructive/10 border-destructive flex flex-col items-center justify-center h-80">
        <span className="font-bold uppercase text-destructive">Error!</span>
        <span className="text-sm mt-2">{error}</span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="brutal-card flex flex-col items-center justify-center h-80 bg-muted/50">
        <span className="font-bold uppercase text-muted-foreground">
          Hasil gambar akan muncul disini
        </span>
      </div>
    );
  }

  return (
    <div className="brutal-card space-y-4">
      <div className="relative">
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full border-[3px] border-foreground"
        />
        <div className="absolute top-2 left-2">
          <span className="brutal-tag">AI Generated</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button onClick={handleDownload} className="brutal-btn flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </button>
        <button onClick={handleShare} className="brutal-btn-outline flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}
