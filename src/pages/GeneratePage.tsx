import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GeneratedImage } from "@/components/GeneratedImage";
import { ImageUploader } from "@/components/ImageUploader";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import { generateImage, generateImageWithReference } from "@/lib/api";
import { Sparkles, Wand2, Image, Edit, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import CountdownTimer from "@/components/CountdownTimer";
import { Alert, AlertDescription } from "@/components/ui/alert";

const examplePrompts = [
  "Logo minimalis untuk kedai kopi dengan gaya modern",
  "Banner promosi diskon 50% untuk toko baju online",
  "Ilustrasi makanan nasi goreng yang menggugah selera",
  "Poster event bazaar UMKM dengan nuansa tradisional",
];

export default function GeneratePage() {
  const { profile } = useAuth();
  const { 
    credits, 
    isChecking, 
    rateLimitedUntil, 
    checkAndDeductCredit, 
    clearRateLimit 
  } = useCredits({ pageType: 'generate' });
  
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [referenceImage, setReferenceImage] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("ig-feed");
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Waduh, tulis dulu mau gambar apa!");
      return;
    }

    if (mode === "edit" && !referenceImage) {
      toast.error("Upload dulu foto yang mau diedit bro!");
      return;
    }

    // Check and deduct credit first
    const creditCheck = await checkAndDeductCredit();
    if (!creditCheck.success) {
      if (creditCheck.code === 'RATE_LIMITED') {
        toast.error(`Sabar ya! Tunggu ${creditCheck.waitSeconds} detik lagi`);
      } else if (creditCheck.code === 'INSUFFICIENT_CREDITS') {
        toast.error("Yah, kredit abis! Top up dulu yuk");
      } else if (creditCheck.code === 'EMAIL_NOT_VERIFIED') {
        toast.error("Verifikasi email dulu biar dapet kredit gratis!");
      } else {
        toast.error(creditCheck.error || "Gagal memproses kredit");
      }
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setImageUrl(undefined);

    try {
      const aspectRatio = aspectRatios.find(r => r.id === selectedAspectRatio);
      const ratioPrompt = aspectRatio ? ` ${aspectRatio.ratio}` : "";
      
      let response;
      if (mode === "edit" && referenceImage) {
        response = await generateImageWithReference(prompt + ratioPrompt, referenceImage, 'generate', aspectRatio?.ratio);
      } else {
        response = await generateImage(prompt + ratioPrompt, 'generate', aspectRatio?.ratio);
      }
      
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        // No need to save to history here - backend handles it automatically
        toast.success(mode === "edit" ? "Foto berhasil dirombak!" : "Gambar jadi nih! Kece parah");
      } else {
        throw new Error("Gak ada gambar yang balik nih");
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
            <div className="bg-genz-lime p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <Wand2 className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Bikin Gambar AI
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Tulis aja maunya apa, biar AI yang kerjain sisanya!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mode Toggle */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">1</span>
                Pilih Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("create")}
                  className={`p-4 border-4 border-black text-center transition-all rounded-lg ${
                    mode === "create"
                      ? "bg-genz-cyan shadow-brutal -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Image className="w-8 h-8 mx-auto mb-2 stroke-[2px]" />
                  <div className="font-display uppercase text-base">Buat Baru</div>
                  <div className="text-xs font-bold font-mono text-gray-600">Bikin dari nol</div>
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className={`p-4 border-4 border-black text-center transition-all rounded-lg ${
                    mode === "edit"
                      ? "bg-genz-pink shadow-brutal -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Edit className="w-8 h-8 mx-auto mb-2 stroke-[2px]" />
                  <div className="font-display uppercase text-base">Edit Foto</div>
                  <div className="text-xs font-bold font-mono text-gray-600">Ubah foto yang ada</div>
                </button>
              </div>
            </div>

            {/* Image Upload for Edit Mode */}
            {mode === "edit" && (
              <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
                <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">2</span>
                  Upload Foto
                </label>
                <ImageUploader
                  label="Upload Foto yang Ingin Diedit"
                  onImageSelect={setReferenceImage}
                />
              </div>
            )}

            {/* Prompt Input */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">{mode === "edit" ? "3" : "2"}</span>
                {mode === "edit" ? "Instruksi Edit" : "Deskripsi Gambar"}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === "edit" 
                  ? "Contoh: Ubah background menjadi pantai sunset, tambahkan efek vintage..."
                  : "Contoh: Logo toko kue dengan nuansa pink dan coklat, gaya modern minimalis..."
                }
                className="w-full p-4 border-4 border-black font-mono text-sm min-h-[120px] focus:outline-none focus:ring-4 focus:ring-genz-lime/50 rounded-lg"
              />
              
              {/* Example Prompts - inline under textarea */}
              {mode === "create" && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                  <span className="text-xs font-bold font-mono uppercase text-gray-500 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3" /> Contoh ide:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example) => (
                      <button
                        key={example}
                        onClick={() => setPrompt(example)}
                        className="px-3 py-1.5 bg-gray-100 border-2 border-black rounded-full text-xs font-bold font-mono hover:bg-genz-lime transition-colors"
                      >
                        {example.slice(0, 35)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">{mode === "edit" ? "4" : "3"}</span>
                Ukuran Gambar
              </label>
              <AspectRatioSelector
                selectedId={selectedAspectRatio}
                onSelect={setSelectedAspectRatio}
              />
            </div>

            {/* Credit Warning */}
            {credits <= 3 && credits > 0 && (
              <div className="border-4 border-black bg-yellow-100 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span className="font-bold font-mono text-sm">
                  Kredit sisa {credits}. <a href="/pricing" className="underline decoration-2">Isi ulang yuk!</a>
                </span>
              </div>
            )}

            {credits === 0 && (
              <div className="border-4 border-black bg-red-100 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-bold font-mono text-sm text-red-600">
                  Yah, kredit habis! <a href="/pricing" className="underline decoration-2">Beli lagi dong!</a>
                </span>
              </div>
            )}

            {/* Rate Limit Timer */}
            {rateLimitedUntil && (
              <CountdownTimer 
                targetTime={rateLimitedUntil} 
                onComplete={clearRateLimit}
              />
            )}
          </div>

          {/* Result Section - Sticky Sidebar */}
          <div className="lg:w-[380px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <span className="block font-display uppercase text-lg mb-4 tracking-wider flex items-center gap-2">
                  <Image className="w-5 h-5" />
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
                  disabled={isLoading || isChecking || credits === 0 || !!rateLimitedUntil}
                  className="w-full mt-5 py-4 bg-black text-white font-display text-lg uppercase border-4 border-transparent hover:bg-genz-lime hover:text-black hover:border-black transition-all shadow-brutal hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lagi Bikin...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      {mode === "edit" ? "Edit Sekarang" : "Gas Bikin!"}
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
