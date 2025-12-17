import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageUploader } from "@/components/ImageUploader";
import { GeneratedImage } from "@/components/GeneratedImage";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import CountdownTimer from "@/components/CountdownTimer";
import { copyStyleFromImages } from "@/lib/api";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import { Palette, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StylePage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, refundCredit, saveToHistory, clearRateLimit } = useCredits({ pageType: 'style' });
  
  const [originalImage, setOriginalImage] = useState("");
  const [styleImage, setStyleImage] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("ig-feed");
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [rateLimitEndTime, setRateLimitEndTime] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!originalImage) {
      toast.error("Upload gambar asli terlebih dahulu!");
      return;
    }
    if (!styleImage) {
      toast.error("Upload gambar style terlebih dahulu!");
      return;
    }

    // Check and deduct credit first
    const creditResult = await checkAndDeductCredit();
    if (!creditResult.success) {
      if (creditResult.retryAt) {
        setRateLimitEndTime(creditResult.retryAt);
      }
      toast.error(creditResult.error || "Gagal memproses kredit");
      return;
    }

    // Update local credits
    if (profile) {
      updateCredits(profile.credits - 1);
    }

    setIsLoading(true);
    setError(undefined);
    setImageUrl(undefined);

    try {
      const aspectRatio = aspectRatios.find(r => r.id === selectedAspectRatio);
      const ratioPrompt = aspectRatio ? ` Format output: ${aspectRatio.ratio}` : "";
      const fullPrompt = additionalPrompt ? additionalPrompt + ratioPrompt : ratioPrompt;
      
      const response = await copyStyleFromImages(originalImage, styleImage, fullPrompt);
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Style berhasil di-copy!");
        
        // Save to history
        await saveToHistory(imageData, "style", "Style Copy", selectedAspectRatio);
        
        // Clear rate limit after successful generation
        clearRateLimit();
      } else {
        throw new Error("Tidak ada gambar dalam response");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat gambar";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Refund credit on failure
      const refundResult = await refundCredit();
      if (refundResult.success && profile) {
        updateCredits(profile.credits); // Restore credit
        toast.info("Kredit dikembalikan karena gagal generate");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-accent p-2 border-[3px] border-foreground">
              <Palette className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Copy Style
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload gambar asli dan referensi style untuk digabungkan.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 items-end">
            <div>
              <ImageUploader
                label="1. Gambar Asli"
                onImageSelect={setOriginalImage}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Gambar produk atau konten yang ingin diubah
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="bg-foreground text-background p-3 border-[3px] border-foreground">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            <div>
              <ImageUploader
                label="2. Gambar Style"
                onImageSelect={setStyleImage}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Style yang ingin dicopy (warna, mood, estetika)
              </p>
            </div>
          </div>

          {/* Additional Options */}
          <div className="brutal-card mb-6">
            <label className="block font-bold uppercase text-sm tracking-wider mb-2">
              Instruksi Tambahan (Opsional)
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="Contoh: Pertahankan produk asli tapi ubah background dan pencahayaan sesuai style..."
              className="brutal-textarea"
            />
          </div>

          {/* Aspect Ratio */}
          <div className="brutal-card mb-6">
            <label className="block font-bold uppercase text-sm tracking-wider mb-2">
              Rasio Gambar
            </label>
            <AspectRatioSelector
              selectedId={selectedAspectRatio}
              onSelect={setSelectedAspectRatio}
            />
          </div>

          {/* Rate Limit Warning */}
          {rateLimitEndTime && (
            <div className="brutal-card bg-yellow-100 border-yellow-500 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Rate Limit</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Tunggu sebelum generate lagi:
              </p>
              <CountdownTimer 
                targetTime={rateLimitEndTime} 
                onComplete={() => setRateLimitEndTime(null)} 
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !originalImage || !styleImage || !!rateLimitEndTime}
            className="brutal-btn w-full text-lg disabled:opacity-50 mb-8"
          >
            {isLoading ? (
              <>Sedang Memproses...</>
            ) : (
              <>
                <Palette className="w-5 h-5 mr-2" />
                Copy Style Sekarang
              </>
            )}
          </button>

          {/* Result */}
          <div>
            <span className="block font-bold uppercase text-sm tracking-wider mb-2">
              Hasil
            </span>
            <GeneratedImage 
              imageUrl={imageUrl} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
