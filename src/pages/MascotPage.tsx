import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageUploader } from "@/components/ImageUploader";
import { GeneratedImage } from "@/components/GeneratedImage";
import { OptionGrid } from "@/components/OptionGrid";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import CountdownTimer from "@/components/CountdownTimer";
import { generateImage, generateImageWithReference } from "@/lib/api";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import { Cat, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const mascotStyles = [
  { id: "pixar-3d", name: "3D Pixar", description: "Animasi Pixar yang ekspresif", category: "3D" },
  { id: "disney-3d", name: "3D Disney", description: "Gaya Disney yang ikonik", category: "3D" },
  { id: "chibi-3d", name: "3D Chibi", description: "3D dengan proporsi chibi", category: "3D" },
  { id: "kawaii", name: "Kawaii Chibi", description: "Imut gaya Jepang", category: "2D" },
  { id: "cartoon", name: "Cartoon Classic", description: "Kartun klasik yang fun", category: "2D" },
  { id: "anime", name: "Anime Style", description: "Gaya anime Jepang", category: "2D" },
  { id: "flat", name: "Flat Design", description: "Modern minimalis untuk logo", category: "Logo" },
  { id: "mascot-logo", name: "Mascot Logo", description: "Logo dengan karakter", category: "Logo" },
  { id: "vector-clean", name: "Vector Clean", description: "Vektor bersih profesional", category: "Logo" },
  { id: "retro-mascot", name: "Retro Mascot", description: "Gaya vintage 60-70an", category: "Vintage" },
  { id: "pop-art", name: "Pop Art", description: "Gaya Andy Warhol", category: "Art" },
  { id: "watercolor", name: "Watercolor", description: "Cat air lembut", category: "Art" },
];

const outputTypes = [
  { id: "poster", name: "Poster Commercial", description: "Dengan background dan teks promo" },
  { id: "transparent", name: "Background Polos (PNG)", description: "Maskot saja, siap dipakai ulang" },
  { id: "sticker", name: "Sticker Pack", description: "Beberapa pose/ekspresi" },
  { id: "profile", name: "Profile Picture", description: "Format bulat untuk sosmed" },
];

const mascotTypes = [
  { id: "product-based", name: "Berdasarkan Produk", description: "Maskot dari bentuk produk" },
  { id: "animal", name: "Hewan Lucu", description: "Kucing, anjing, burung, dll" },
  { id: "human", name: "Karakter Manusia", description: "Chef, petani, penjual" },
  { id: "object", name: "Objek Hidup", description: "Makanan/objek dengan wajah" },
  { id: "fantasy", name: "Karakter Fantasi", description: "Naga, peri, monster lucu" },
];

export default function MascotPage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, refundCredit, saveToHistory, clearRateLimit } = useCredits({ pageType: 'mascot' });
  
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("pixar-3d");
  const [selectedOutput, setSelectedOutput] = useState("poster");
  const [selectedMascotType, setSelectedMascotType] = useState("product-based");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("ig-feed");
  const [productImage, setProductImage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [rateLimitEndTime, setRateLimitEndTime] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error("Masukkan nama produk terlebih dahulu!");
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
      const styleDescriptions: Record<string, string> = {
        "pixar-3d": "3D Pixar style animation character, expressive, detailed textures, vibrant colors, cute and friendly",
        "disney-3d": "Disney 3D animation style, magical, iconic Disney character design, warm and inviting",
        "chibi-3d": "3D chibi style with big head and small body, cute proportions, adorable expressions",
        "kawaii": "Kawaii chibi style, cute Japanese anime character, big sparkling eyes, pastel colors",
        "cartoon": "Classic cartoon style character, bold outlines, bright colors, fun expression, like classic mascots",
        "anime": "Japanese anime style character, detailed eyes, dynamic pose, vibrant colors",
        "flat": "Flat design vector style mascot, minimalist, clean geometric shapes, modern logo style",
        "mascot-logo": "Professional mascot logo design, bold and memorable, suitable for branding",
        "vector-clean": "Clean vector illustration, professional, scalable design, minimal details",
        "retro-mascot": "Vintage 1960s-70s mascot style, retro colors, nostalgic feel, classic advertising look",
        "pop-art": "Pop art style, bold colors, Ben-Day dots, Andy Warhol inspired",
        "watercolor": "Soft watercolor illustration style, gentle colors, artistic brushstrokes",
      };

      const outputDescriptions: Record<string, string> = {
        "poster": "Create as a commercial advertisement poster with promotional text space and background, aspect ratio 4:5",
        "transparent": "Create mascot character only on a pure solid white or transparent background, no additional elements, PNG ready for cutout, clean edges",
        "sticker": "Create as a sticker pack with 4-6 different poses and expressions of the same character, white background",
        "profile": "Create as a circular profile picture format, centered character, suitable for social media avatar",
      };

      const mascotTypeDescriptions: Record<string, string> = {
        "product-based": "The mascot should be based on or inspired by the product itself",
        "animal": "Create a cute animal character as the mascot (cat, dog, bird, etc.)",
        "human": "Create a human character mascot (chef, farmer, seller, etc.)",
        "object": "Create a living object mascot - the product with a cute face and limbs",
        "fantasy": "Create a fantasy character mascot (dragon, fairy, cute monster, etc.)",
      };

      const aspectRatio = aspectRatios.find(r => r.id === selectedAspectRatio);
      const ratioPrompt = aspectRatio ? ` Format: ${aspectRatio.ratio} (${aspectRatio.name})` : "";

      const prompt = `Analyze and create a cute mascot character for the product "${productName}". ${productDescription ? `Product description: ${productDescription}.` : ""} ${mascotTypeDescriptions[selectedMascotType]}. Style: ${styleDescriptions[selectedStyle]}. ${outputDescriptions[selectedOutput]}.${ratioPrompt}`;

      let response;
      if (productImage) {
        response = await generateImageWithReference(prompt, productImage);
      } else {
        response = await generateImage(prompt);
      }

      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Maskot berhasil dibuat!");
        
        // Save to history
        await saveToHistory(imageData, "mascot", productName, selectedAspectRatio);
        
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
            <div className="bg-secondary p-2 border-[3px] border-foreground">
              <Cat className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Buat Maskot
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ciptakan maskot unik untuk brand UMKM-mu.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                1. Nama Produk/Brand *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Aneka Dimsum Mentai by Ini Mentaiku"
                className="brutal-input"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                2. Deskripsi Produk (Opsional)
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Contoh: Dimsum dengan saus mentai yang creamy dan gurih..."
                className="brutal-textarea"
                rows={2}
              />
            </div>

            {/* Mascot Type */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-3">
                3. Tipe Maskot
              </label>
              <OptionGrid
                options={mascotTypes}
                selectedId={selectedMascotType}
                onSelect={setSelectedMascotType}
              />
            </div>

            {/* Style Selection */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-3">
                <Sparkles className="w-4 h-4 inline mr-1" />
                4. Pilih Gaya Maskot
              </label>
              <OptionGrid
                options={mascotStyles}
                selectedId={selectedStyle}
                onSelect={setSelectedStyle}
                columns={3}
              />
            </div>

            {/* Output Type */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-3">
                5. Jenis Output
              </label>
              <OptionGrid
                options={outputTypes}
                selectedId={selectedOutput}
                onSelect={setSelectedOutput}
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-3">
                6. Rasio Gambar
              </label>
              <AspectRatioSelector
                selectedId={selectedAspectRatio}
                onSelect={setSelectedAspectRatio}
              />
            </div>

            <ImageUploader
              label="Upload Foto Produk (Opsional)"
              onImageSelect={setProductImage}
            />

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
              disabled={isLoading || !!rateLimitEndTime}
              className="brutal-btn w-full text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>Sedang Membuat Maskot...</>
              ) : (
                <>
                  <Cat className="w-5 h-5 mr-2" />
                  Buat Maskot
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div>
            <span className="block font-bold uppercase text-sm tracking-wider mb-2">
              Hasil Maskot
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
