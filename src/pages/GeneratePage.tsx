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
import CreditDisplay from "@/components/CreditDisplay";
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
    refundCredit, 
    saveToHistory,
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
      toast.error("Masukkan deskripsi gambar terlebih dahulu!");
      return;
    }

    if (mode === "edit" && !referenceImage) {
      toast.error("Upload foto yang ingin diedit!");
      return;
    }

    // Check and deduct credit first
    const creditCheck = await checkAndDeductCredit();
    if (!creditCheck.success) {
      if (creditCheck.code === 'RATE_LIMITED') {
        toast.error(`Tunggu ${creditCheck.waitSeconds} detik sebelum generate lagi`);
      } else if (creditCheck.code === 'INSUFFICIENT_CREDITS') {
        toast.error("Kredit tidak cukup. Silakan beli kredit terlebih dahulu.");
      } else if (creditCheck.code === 'EMAIL_NOT_VERIFIED') {
        toast.error("Verifikasi email Anda terlebih dahulu untuk mendapatkan kredit gratis.");
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
      const ratioPrompt = aspectRatio ? ` Format: ${aspectRatio.ratio} (${aspectRatio.name})` : "";
      
      let response;
      if (mode === "edit" && referenceImage) {
        response = await generateImageWithReference(prompt + ratioPrompt, referenceImage);
      } else {
        response = await generateImage(prompt + ratioPrompt);
      }
      
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        
        // Save to history
        try {
          await saveToHistory(imageData, "generate", prompt, aspectRatio?.name);
        } catch (e) {
          console.error('Failed to save to history:', e);
        }
        
        toast.success(mode === "edit" ? "Gambar berhasil diedit!" : "Gambar berhasil dibuat!");
      } else {
        throw new Error("Tidak ada gambar dalam response");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat gambar";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Refund credit on failure
      await refundCredit();
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
              <Wand2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Generate Image
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Buat gambar baru atau edit gambar yang sudah ada.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("create")}
                  className={`p-4 border-[3px] border-foreground text-center transition-all ${
                    mode === "create"
                      ? "bg-accent"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Image className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold uppercase">Buat Baru</div>
                  <div className="text-xs text-muted-foreground">Buat gambar dari teks</div>
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className={`p-4 border-[3px] border-foreground text-center transition-all ${
                    mode === "edit"
                      ? "bg-accent"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Edit className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold uppercase">Edit Foto</div>
                  <div className="text-xs text-muted-foreground">Edit gambar yang ada</div>
                </button>
              </div>
            </div>

            {/* Image Upload for Edit Mode */}
            {mode === "edit" && (
              <ImageUploader
                label="Upload Foto yang Ingin Diedit"
                onImageSelect={setReferenceImage}
              />
            )}

            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                {mode === "edit" ? "Instruksi Edit" : "Deskripsi Gambar"}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === "edit" 
                  ? "Contoh: Ubah background menjadi pantai sunset, tambahkan efek vintage..."
                  : "Contoh: Logo toko kue dengan nuansa pink dan coklat, gaya modern minimalis..."
                }
                className="brutal-textarea h-32"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                Rasio Gambar
              </label>
              <AspectRatioSelector
                selectedId={selectedAspectRatio}
                onSelect={setSelectedAspectRatio}
              />
            </div>

            {/* Example Prompts - only show in create mode */}
            {mode === "create" && (
              <div>
                <span className="block font-bold uppercase text-sm tracking-wider mb-3">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Contoh Prompt
                </span>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example}
                      onClick={() => setPrompt(example)}
                      className="brutal-tag hover:bg-foreground hover:text-background transition-colors cursor-pointer text-left"
                    >
                      {example.slice(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Credit Warning */}
            {credits <= 3 && credits > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Kredit Anda tinggal {credits}. <a href="/pricing" className="underline font-medium">Beli kredit</a> untuk lanjut generate.
                </AlertDescription>
              </Alert>
            )}

            {credits === 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Kredit Anda habis. <a href="/pricing" className="underline font-medium">Beli kredit</a> untuk lanjut generate.
                </AlertDescription>
              </Alert>
            )}

            {/* Rate Limit Timer */}
            {rateLimitedUntil && (
              <CountdownTimer 
                targetTime={rateLimitedUntil} 
                onComplete={clearRateLimit}
              />
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || isChecking || credits === 0 || !!rateLimitedUntil}
              className="brutal-btn w-full text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>Sedang Memproses...</>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  {mode === "edit" ? "Edit Gambar" : "Buat Gambar"}
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
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
