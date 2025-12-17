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
    emoji: "📸",
    description: "Paling populer! Siap posting langsung",
    style: "clean-cafe",
    angle: "45-dining",
    ornaments: ["garnish", "tableware"],
  },
  { 
    id: "street-food-vibes", 
    name: "Street Food Vibes", 
    emoji: "🍜",
    description: "Untuk makanan tradisional & jajanan",
    style: "street-food",
    angle: "eye-level",
    ornaments: ["natural"],
  },
  { 
    id: "premium-look", 
    name: "Premium & Elegan", 
    emoji: "✨",
    description: "Kesan mewah dan profesional",
    style: "luxury-dining",
    angle: "45-dining",
    ornaments: ["tableware", "garnish"],
  },
  { 
    id: "fresh-healthy", 
    name: "Fresh & Sehat", 
    emoji: "🥗",
    description: "Untuk salad, jus, makanan sehat",
    style: "healthy-fresh",
    angle: "flatlay",
    ornaments: ["natural", "drinks"],
  },
  { 
    id: "cozy-homemade", 
    name: "Homemade Cozy", 
    emoji: "🏠",
    description: "Kesan hangat buatan rumah",
    style: "comfort-food",
    angle: "eye-level",
    ornaments: ["side-dish"],
  },
  { 
    id: "korean-aesthetic", 
    name: "Korean Aesthetic", 
    emoji: "🇰🇷",
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
  { id: "drinks", name: "Minuman", emoji: "🥤" },
  { id: "natural", name: "Daun/Bunga", emoji: "🌿" },
  { id: "side-dish", name: "Side Dish", emoji: "🍟" },
  { id: "tableware", name: "Piring/Sendok", emoji: "🍽️" },
  { id: "garnish", name: "Garnish", emoji: "🌶️" },
  { id: "steam", name: "Steam/Uap", emoji: "♨️" },
];

export default function FoodPage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, refundCredit, saveToHistory, clearRateLimit } = useCredits({ pageType: 'food' });
  
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
      toast.error("Upload foto makanan terlebih dahulu!");
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
        toast.success("Foto makanan berhasil di-upgrade!");
        
        // Save to history
        const promptText = mode === "easy" ? selectedPreset.name : selectedStyle;
        await saveToHistory(imageData, "food", promptText, selectedAspectRatio);
        
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
              <Camera className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Food Lens AI
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ubah foto makanan biasa jadi profesional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Step 1: Upload */}
            <div className="brutal-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">1</div>
                <span className="font-bold uppercase">Unggah Foto Makanan</span>
              </div>
              <ImageUploader
                label=""
                onImageSelect={setFoodImage}
              />
            </div>

            {/* Mode Toggle */}
            <div className="brutal-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">2</div>
                <span className="font-bold uppercase">Pilih Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("easy")}
                  className={`p-4 border-[3px] border-foreground text-center transition-all ${
                    mode === "easy"
                      ? "bg-accent"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Star className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold uppercase">Mudah</div>
                  <div className="text-xs text-muted-foreground">1 klik, hasil maksimal</div>
                </button>
                <button
                  onClick={() => setMode("advanced")}
                  className={`p-4 border-[3px] border-foreground text-center transition-all ${
                    mode === "advanced"
                      ? "bg-accent"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Sparkles className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-bold uppercase">Kustom</div>
                  <div className="text-xs text-muted-foreground">Atur sendiri detailnya</div>
                </button>
              </div>
            </div>

            {/* Easy Mode - Presets */}
            {mode === "easy" && (
              <div className="brutal-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <span className="font-bold uppercase">Pilih Gaya (1 Klik!)</span>
                </div>
                <OptionGrid
                  options={easyPresets.map(p => ({ id: p.id, name: p.name, description: p.description, emoji: p.emoji }))}
                  selectedId={selectedPreset.id}
                  onSelect={(id) => setSelectedPreset(easyPresets.find(p => p.id === id) || easyPresets[0])}
                  showEmoji
                />
              </div>
            )}

            {/* Aspect Ratio - Easy Mode */}
            {mode === "easy" && (
              <div className="brutal-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <span className="font-bold uppercase">Rasio Gambar</span>
                </div>
                <AspectRatioSelector
                  selectedId={selectedAspectRatio}
                  onSelect={setSelectedAspectRatio}
                />
              </div>
            )}

            {/* Advanced Mode */}
            {mode === "advanced" && (
              <>
                <div className="brutal-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <span className="font-bold uppercase">Pilih Gaya</span>
                  </div>
                  <OptionGrid
                    options={foodStyles}
                    selectedId={selectedStyle}
                    onSelect={setSelectedStyle}
                  />
                </div>

                {/* Angle */}
                <div className="brutal-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">4</div>
                    <span className="font-bold uppercase">Sudut Kamera</span>
                  </div>
                  <OptionGrid
                    options={angles}
                    selectedId={selectedAngle}
                    onSelect={setSelectedAngle}
                    columns={3}
                  />
                </div>

                {/* Ornaments */}
                <div className="brutal-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">5</div>
                    <span className="font-bold uppercase">Tambahan (Opsional)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ornaments.map((ornament) => (
                      <button
                        key={ornament.id}
                        onClick={() => toggleOrnament(ornament.id)}
                        className={`flex items-center gap-2 px-4 py-2 border-[3px] border-foreground transition-all ${
                          selectedOrnaments.includes(ornament.id)
                            ? "bg-foreground text-background"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        <span>{ornament.emoji}</span>
                        <span className="font-bold uppercase text-sm">{ornament.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio - Advanced Mode */}
                <div className="brutal-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-foreground text-background w-8 h-8 flex items-center justify-center font-bold">6</div>
                    <span className="font-bold uppercase">Rasio Gambar</span>
                  </div>
                  <AspectRatioSelector
                    selectedId={selectedAspectRatio}
                    onSelect={setSelectedAspectRatio}
                  />
                </div>
              </>
            )}

            {/* Rate Limit Warning */}
            {rateLimitEndTime && (
              <div className="brutal-card bg-yellow-100 border-yellow-500">
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
              disabled={isLoading || !foodImage || !!rateLimitEndTime}
              className="brutal-btn w-full text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>Sedang Memproses...</>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Buat Foto Profesional
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
