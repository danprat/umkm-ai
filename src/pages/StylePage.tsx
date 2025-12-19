import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageUploader } from "@/components/ImageUploader";
import { GeneratedImage } from "@/components/GeneratedImage";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import CountdownTimer from "@/components/CountdownTimer";
import { copyStyleFromImages } from "@/lib/api";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import { Palette, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StylePage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, clearRateLimit } = useCredits({ pageType: 'style' });
  
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
      const ratioPrompt = aspectRatio ? ` ${aspectRatio.ratio}` : "";
      const fullPrompt = additionalPrompt ? additionalPrompt + ratioPrompt : ratioPrompt;
      
      const response = await copyStyleFromImages(originalImage, styleImage, fullPrompt, aspectRatio?.ratio);
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Style berhasil di-copy!");
        // No need to save to history - backend handles it automatically
        clearRateLimit();
      } else {
        throw new Error("Tidak ada gambar dalam response");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat gambar";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Credit refund handled automatically by server
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-black pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-genz-cyan p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <Palette className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Tiru Gaya
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Punya foto inspirasi? Upload disini, kita copas style-nya ke fotomu!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Upload Section */}
            <div className="bg-white border-4 border-black p-6 rounded-xl shadow-brutal">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <label className="block font-display uppercase text-base mb-2 flex items-center gap-2">
                    <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                    Gambar Asli
                  </label>
                  <ImageUploader
                    label="Upload Foto Produkmu"
                    onImageSelect={setOriginalImage}
                  />
                  <p className="text-xs font-mono font-bold mt-2 text-gray-500">
                    Foto yang mau diubah style-nya
                  </p>
                </div>

                <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <label className="block font-display uppercase text-base mb-2 flex items-center gap-2">
                    <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                    Gambar Referensi
                  </label>
                  <ImageUploader
                    label="Upload Foto Contoh Style"
                    onImageSelect={setStyleImage}
                  />
                  <p className="text-xs font-mono font-bold mt-2 text-gray-500">
                    Foto yang style-nya mau ditiru
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                Instruksi Tambahan (Opsional)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="Contoh: Pertahankan produk asli tapi ubah background dan pencahayaan sesuai style..."
                className="w-full p-4 border-4 border-black font-mono text-sm min-h-[100px] focus:outline-none focus:ring-4 focus:ring-genz-cyan/50 rounded-lg"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">4</span>
                Ukuran Gambar
              </label>
              <AspectRatioSelector
                selectedId={selectedAspectRatio}
                onSelect={setSelectedAspectRatio}
              />
            </div>

            {/* Rate Limit Warning */}
            {rateLimitEndTime && (
              <div className="border-4 border-black bg-yellow-100 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-800" />
                <div>
                  <span className="font-bold font-mono text-sm text-yellow-800">
                    Sabar ya! Tunggu bentar sebelum generate lagi.
                  </span>
                  <CountdownTimer 
                    targetTime={rateLimitEndTime} 
                    onComplete={() => setRateLimitEndTime(null)} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Result Section - Sticky Sidebar */}
          <div className="lg:w-[380px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <span className="block font-display uppercase text-lg mb-4 tracking-wider flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Hasil
                </span>
                <GeneratedImage 
                  imageUrl={imageUrl} 
                  isLoading={isLoading} 
                  error={error} 
                />

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !originalImage || !styleImage || !!rateLimitEndTime}
                  className="w-full mt-5 py-4 bg-black text-white font-display text-lg uppercase border-4 border-transparent hover:bg-genz-cyan hover:text-black hover:border-black transition-all shadow-brutal hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lagi Mikir...
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Tiru Style
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
