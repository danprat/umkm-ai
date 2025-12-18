import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageUploader } from "@/components/ImageUploader";
import { GeneratedImage } from "@/components/GeneratedImage";
import { OptionGrid } from "@/components/OptionGrid";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import CountdownTimer from "@/components/CountdownTimer";
import { enhanceFoodPhoto } from "@/lib/api";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Sparkles, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Simplified presets for beginners - one click solutions
const easyPresets = [
  { 
    id: "instagram-ready", 
    name: "Instagram Ready",
    description: "Paling populer! Siap posting langsung",
    style: "clean-cafe",
    angle: "45-dining",
    ornaments: ["garnish", "tableware"],
  },
  { 
    id: "street-food-vibes", 
    name: "Street Food Vibes",
    description: "Untuk makanan tradisional & jajanan",
    style: "street-food",
    angle: "eye-level",
    ornaments: ["natural"],
  },
  { 
    id: "premium-look", 
    name: "Premium & Elegan", 
    description: "Kesan mewah dan profesional",
    style: "luxury-dining",
    angle: "45-dining",
    ornaments: ["tableware", "garnish"],
  },
  { 
    id: "fresh-healthy", 
    name: "Fresh & Sehat", 
    description: "Untuk salad, jus, makanan sehat",
    style: "healthy-fresh",
    angle: "flatlay",
    ornaments: ["natural", "drinks"],
  },
  { 
    id: "cozy-homemade", 
    name: "Homemade Cozy", 
    description: "Kesan hangat buatan rumah",
    style: "comfort-food",
    angle: "eye-level",
    ornaments: ["side-dish"],
  },
  { 
    id: "korean-aesthetic", 
    name: "Korean Aesthetic", 
    description: "Pastel, cantik ala Korea",
    style: "korean-pastel",
    angle: "flatlay",
    ornaments: ["tableware", "natural"],
  },
];

const foodStyles = [
  { id: "clean-cafe", name: "Clean Cafe", description: "Minimalis, modern" },
  { id: "street-food", name: "Street Food", description: "Hangat, meriah" },
  { id: "japanese-bento", name: "Japanese Bento", description: "Rapi, minimalis" },
  { id: "korean-pastel", name: "Korean Pastel", description: "Cerah, playful" },
  { id: "comfort-food", name: "Comfort Food", description: "Cozy, homely" },
  { id: "luxury-dining", name: "Luxury Dining", description: "Gelap, elegan" },
  { id: "healthy-fresh", name: "Healthy Fresh", description: "Segar, natural" },
];

const angles = [
  { id: "45-dining", name: "45° Dining View" },
  { id: "eye-level", name: "Eye-level" },
  { id: "flatlay", name: "Flatlay (Top)" },
  { id: "texture-focus", name: "Close-up" },
  { id: "side-view", name: "Side View" },
];

const ornaments = [
  { id: "drinks", name: "Minuman" },
  { id: "natural", name: "Daun/Bunga" },
  { id: "side-dish", name: "Side Dish" },
  { id: "tableware", name: "Piring/Sendok" },
  { id: "garnish", name: "Garnish" },
  { id: "steam", name: "Steam/Uap" },
];

export default function FoodPage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, refundCredit, clearRateLimit } = useCredits({ pageType: 'food' });
  
  const [foodImage, setFoodImage] = useState("");
  const [mode, setMode] = useState<"easy" | "advanced">("easy");
  const [selectedPreset, setSelectedPreset] = useState(easyPresets[0]);
  const [selectedStyle, setSelectedStyle] = useState("clean-cafe");
  const [selectedAngle, setSelectedAngle] = useState("45-dining");
  const [selectedOrnaments, setSelectedOrnaments] = useState<string[]>([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("ig-feed");
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [rateLimitEndTime, setRateLimitEndTime] = useState<string | null>(null);

  const toggleOrnament = (ornamentId: string) => {
    setSelectedOrnaments((prev) =>
      prev.includes(ornamentId)
        ? prev.filter((id) => id !== ornamentId)
        : [...prev, ornamentId]
    );
  };

  const handleGenerate = async () => {
    if (!foodImage) {
      toast.error("Upload dulu foto makanannya!");
      return;
    }

    // Check and deduct credit first
    const creditResult = await checkAndDeductCredit();
    if (!creditResult.success) {
      if (creditResult.retryAt) {
        setRateLimitEndTime(creditResult.retryAt);
      }
      toast.error(creditResult.error || "Gagal memproses kredit, coba lagi ya!");
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
      let style, angle, ornamentNames;

      if (mode === "easy") {
        style = foodStyles.find((s) => s.id === selectedPreset.style)?.name || selectedPreset.style;
        angle = angles.find((a) => a.id === selectedPreset.angle)?.name || selectedPreset.angle;
        ornamentNames = selectedPreset.ornaments.map(
          (id) => ornaments.find((o) => o.id === id)?.name || id
        );
      } else {
        style = foodStyles.find((s) => s.id === selectedStyle)?.name || selectedStyle;
        angle = angles.find((a) => a.id === selectedAngle)?.name || selectedAngle;
        ornamentNames = selectedOrnaments.map(
          (id) => ornaments.find((o) => o.id === id)?.name || id
        );
      }

      const aspectRatio = aspectRatios.find(r => r.id === selectedAspectRatio);

      const response = await enhanceFoodPhoto(foodImage, style, angle, ornamentNames, aspectRatio?.ratio);
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Foto makanan jadi lebih ngiler! 🤤");
        // No need to save to history - backend handles it automatically
        clearRateLimit();
      } else {
        throw new Error("Yah, fotonya gagal dimasak");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat gambar";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Refund credit on failure
      const refundResult = await refundCredit();
      if (refundResult.success && profile) {
        updateCredits(profile.credits); // Restore credit
        toast.info("Kredit dibalikin, jangan sedih!");
      }
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
            <div className="bg-genz-purple p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <Camera className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Food Lens AI
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Ubah foto makanan biasa jadi sekelas restoran bintang 5!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Step 1: Upload */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">1</span>
                <span className="font-display uppercase text-lg">Unggah Foto Makanan</span>
              </div>
              <ImageUploader
                label=""
                onImageSelect={setFoodImage}
              />
            </div>

            {/* Mode Toggle */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">2</span>
                <span className="font-display uppercase text-lg">Pilih Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("easy")}
                  className={`p-4 border-4 border-black text-center transition-all rounded-lg ${
                    mode === "easy"
                      ? "bg-genz-lime shadow-brutal -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Star className="w-8 h-8 mx-auto mb-2 stroke-[2px]" />
                  <div className="font-display uppercase text-base">Mudah</div>
                  <div className="text-xs font-bold font-mono text-gray-600">1 klik, hasil maksimal</div>
                </button>
                <button
                  onClick={() => setMode("advanced")}
                  className={`p-4 border-4 border-black text-center transition-all rounded-lg ${
                    mode === "advanced"
                      ? "bg-genz-purple shadow-brutal -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 stroke-[2px]" />
                  <div className="font-display uppercase text-base">Kustom</div>
                  <div className="text-xs font-bold font-mono text-gray-600">Atur sendiri detailnya</div>
                </button>
              </div>
            </div>

            {/* Easy Mode - Presets */}
            {mode === "easy" && (
              <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">3</span>
                  <span className="font-display uppercase text-lg">Pilih Gaya (1 Klik!)</span>
                </div>
                <OptionGrid
                  options={easyPresets.map(p => ({ id: p.id, name: p.name, description: p.description, emoji: p.emoji }))}
                  selectedId={selectedPreset.id}
                  onSelect={(id) => setSelectedPreset(easyPresets.find(p => p.id === id) || easyPresets[0])}
                  showEmoji
                />
              </div>
            )}

            {/* Advanced Mode - Style & Angle in grid */}
            {mode === "advanced" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">3</span>
                    <span className="font-display uppercase text-lg">Gaya</span>
                  </div>
                  <OptionGrid
                    options={foodStyles}
                    selectedId={selectedStyle}
                    onSelect={setSelectedStyle}
                    columns={2}
                  />
                </div>

                <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">4</span>
                    <span className="font-display uppercase text-lg">Sudut Kamera</span>
                  </div>
                  <OptionGrid
                    options={angles}
                    selectedId={selectedAngle}
                    onSelect={setSelectedAngle}
                    columns={2}
                  />
                </div>
              </div>
            )}

            {/* Ornaments - Advanced Only */}
            {mode === "advanced" && (
              <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">5</span>
                  <span className="font-display uppercase text-lg">Tambahan (Opsional)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ornaments.map((ornament) => (
                    <button
                      key={ornament.id}
                      onClick={() => toggleOrnament(ornament.id)}
                      className={`flex items-center gap-2 px-3 py-2 border-3 border-black rounded-lg transition-all font-bold uppercase text-xs ${
                        selectedOrnaments.includes(ornament.id)
                          ? "bg-black text-white"
                          : "bg-white hover:bg-genz-purple/20"
                      }`}
                    >
                      <span>{ornament.emoji}</span>
                      <span>{ornament.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aspect Ratio */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">{mode === "easy" ? "4" : "6"}</span>
                <span className="font-display uppercase text-lg">Ukuran Gambar</span>
              </div>
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
                  <Camera className="w-5 h-5" />
                  Hasil Foto
                </span>
                <GeneratedImage 
                  imageUrl={imageUrl} 
                  isLoading={isLoading} 
                  error={error} 
                />

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !foodImage || !!rateLimitEndTime}
                  className="w-full mt-5 py-4 bg-black text-white font-display text-lg uppercase border-4 border-transparent hover:bg-genz-purple hover:text-black hover:border-black transition-all shadow-brutal hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lagi Masak...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Buat Foto
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
