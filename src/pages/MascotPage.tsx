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
import { Cat, Sparkles, AlertCircle, Wand2 } from "lucide-react";
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
  const { checkAndDeductCredit, clearRateLimit } = useCredits({ pageType: 'mascot' });
  
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
      const ratioPrompt = aspectRatio ? ` ${aspectRatio.ratio}` : "";

      const prompt = `Analyze and create a cute mascot character for the product "${productName}". ${productDescription ? `Product description: ${productDescription}.` : ""} ${mascotTypeDescriptions[selectedMascotType]}. Style: ${styleDescriptions[selectedStyle]}. ${outputDescriptions[selectedOutput]}.${ratioPrompt}`;

      let response;
      if (productImage) {
        response = await generateImageWithReference(prompt, productImage, 'mascot', aspectRatio?.ratio);
      } else {
        response = await generateImage(prompt, 'mascot', aspectRatio?.ratio);
      }

      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Maskot berhasil dibuat!");
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
            <div className="bg-genz-coral p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <Cat className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Buat Maskot 🦁
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Bikin karakter unik biar brand kamu makin dikenal!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Product Info */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl space-y-4">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">1</span>
                Info Produk
              </label>
              
              <div>
                <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                  Nama Produk/Brand *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Aneka Dimsum Mentai by Ini Mentaiku"
                  className="w-full p-3 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-genz-coral/50 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                  Deskripsi Produk (Opsional)
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Contoh: Dimsum dengan saus mentai yang creamy dan gurih..."
                  className="w-full p-3 border-4 border-black font-mono text-sm min-h-[80px] focus:outline-none focus:ring-4 focus:ring-genz-coral/50 rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            {/* Upload */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">2</span>
                Upload Produk (Opsional)
              </label>
              <ImageUploader
                label=""
                onImageSelect={setProductImage}
              />
            </div>

            {/* Mascot Type */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">3</span>
                Tipe Maskot
              </label>
              <OptionGrid
                options={mascotTypes}
                selectedId={selectedMascotType}
                onSelect={setSelectedMascotType}
              />
            </div>

            {/* Style & Output in grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">4</span>
                  Gaya Visual
                </label>
                <OptionGrid
                  options={mascotStyles}
                  selectedId={selectedStyle}
                  onSelect={setSelectedStyle}
                  columns={2}
                />
              </div>

              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">5</span>
                  Output
                </label>
                <OptionGrid
                  options={outputTypes}
                  selectedId={selectedOutput}
                  onSelect={setSelectedOutput}
                  columns={2}
                />
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">6</span>
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
                  <Cat className="w-5 h-5" />
                  Hasil Maskot
                </span>
                <GeneratedImage 
                  imageUrl={imageUrl} 
                  isLoading={isLoading} 
                  error={error} 
                />

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !!rateLimitEndTime}
                  className="w-full mt-5 py-4 bg-black text-white font-display text-lg uppercase border-4 border-transparent hover:bg-genz-coral hover:text-black hover:border-black transition-all shadow-brutal hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lagi Bikin...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Buat Maskot
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
