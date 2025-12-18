import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GeneratedImage } from "@/components/GeneratedImage";
import { ImageUploader } from "@/components/ImageUploader";
import { OptionGrid } from "@/components/OptionGrid";
import { AspectRatioSelector, aspectRatios } from "@/components/AspectRatioSelector";
import CountdownTimer from "@/components/CountdownTimer";
import { generateImage, generateImageWithReference } from "@/lib/api";
import { useCredits } from "@/hooks/use-credits";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, AlertCircle, Sparkles, Box } from "lucide-react";
import { toast } from "sonner";

const promoTemplates = [
  {
    id: "product-photo",
    name: "Foto Produk UMKM",
    description: "Foto produk profesional dengan latar petani",
    template: 'A highly engaging and promotional product photo for a small business (UMKM) selling "[PRODUCT_NAME]". [PACKAGE_TYPE] packaging with a clean and modern label. Products are falling from above and also placed beside the package to showcase their texture and appeal. In the background, authentic Indonesian farmers are seen joyfully harvesting in a lush green field. Use warm natural lighting, earthy tones, and a storytelling composition. [COLOR_SCHEME]. The visual style should be realistic and marketable.',
  },
  {
    id: "product-promo",
    name: "Promo Human Touch",
    description: "Foto produk dengan orang menikmati produk",
    template: 'A promotional and eye-catching product photo for a small business (UMKM) featuring "[PRODUCT_NAME]". The product is showcased in [PACKAGE_TYPE] packaging with [COLOR_SCHEME] color scheme. Products are placed in an irresistible arrangement. In the background, real Indonesian people are harvesting. One of them is smiling and enjoying the product. The overall visual should be warm, natural, and emotionally engaging.',
  },
  {
    id: "food-splash",
    name: "Food Splash Cinematic",
    description: "Foto makanan dengan efek splash dramatis",
    template: 'A dynamic cinematic food photography shot of [PRODUCT_NAME] falling into a bowl with dramatic splash effects. Studio professional lighting with vivid contrast, [COLOR_SCHEME] background. Hyper-realistic, 8K UHD resolution, sharp focus, frozen action moment with ingredients and garnish elegantly scattered in the air. Advertising-style composition, highly detailed textures, vibrant colors, mouthwatering presentation. Format Square 1:1',
  },
  {
    id: "street-food",
    name: "Poster Street Food",
    description: "Poster ala warung kaki lima yang vibrant",
    template: 'Create a vibrant street food poster with warm night market vibes, colorful neon lights, and a cozy food stall background. Main product: [PRODUCT_NAME]. Place the product inside a realistic serving container. Headline text in the center (big, bold, playful font): [PRODUCT_NAME] in CAPS. Subheadline: "[TAGLINE]". Bottom section: "Order Now! [CONTACT]". [COLOR_SCHEME] color scheme. Keep design colorful, appetizing, and eye-catching.',
  },
  {
    id: "minimalist-clean",
    name: "Minimalis Clean",
    description: "Foto produk dengan latar bersih dan modern",
    template: 'A clean minimalist product photography of [PRODUCT_NAME]. White or light gray studio background with soft shadows. Product is the hero, perfectly lit with natural window lighting. [PACKAGE_TYPE] packaging design. Modern, Scandinavian aesthetic. Professional e-commerce style photography. [COLOR_SCHEME] accent colors.',
  },
  {
    id: "lifestyle-shot",
    name: "Lifestyle Shot",
    description: "Foto produk dalam suasana kehidupan sehari-hari",
    template: 'A lifestyle product photography of [PRODUCT_NAME] in a cozy Indonesian home setting. Natural morning light streaming through windows. Product placed on a wooden table with traditional Indonesian elements. Warm and inviting atmosphere. [PACKAGE_TYPE] packaging. [COLOR_SCHEME] color palette. Authentic and relatable scene for local consumers.',
  },
  {
    id: "festive-promo",
    name: "Promo Hari Raya",
    description: "Desain khusus untuk promo lebaran/natal/imlek",
    template: 'A festive promotional image for [PRODUCT_NAME] celebrating Indonesian holiday season. [PACKAGE_TYPE] packaging decorated with festive ornaments. Traditional Indonesian patterns and decorations. [COLOR_SCHEME] color scheme with gold accents. Warm, celebratory atmosphere. Text area for "Promo Spesial [TAGLINE]". Gift-ready presentation with ribbons and festive elements.',
  },
  {
    id: "social-media-carousel",
    name: "Social Media Ready",
    description: "Desain untuk Instagram/TikTok yang eye-catching",
    template: 'A trendy social media style product image of [PRODUCT_NAME]. Bold typography overlay space. [COLOR_SCHEME] gradient background with geometric shapes. Product floating with dynamic shadows. Instagram-ready square format. Gen-Z aesthetic with playful elements. [PACKAGE_TYPE] packaging. Modern, vibrant, and scroll-stopping design.',
  },
];

const packageTypes = [
  { id: "original", name: "Original", description: "Pertahankan kemasan asli dari foto" },
  { id: "kraft", name: "Kraft/Eco-friendly", description: "Kemasan ramah lingkungan" },
  { id: "plastic-modern", name: "Plastik Modern", description: "Standing pouch modern" },
  { id: "glass-jar", name: "Toples Kaca", description: "Jar kaca premium" },
  { id: "box", name: "Kotak Kardus", description: "Box packaging standar" },
  { id: "traditional", name: "Tradisional", description: "Anyaman/daun pisang" },
  { id: "premium", name: "Premium Gift", description: "Kemasan gift box mewah" },
];

const colorSchemes = [
  { id: "original", name: "Original Wadah", description: "Pertahankan warna kemasan asli" },
  { id: "earthy", name: "Earthy Natural", description: "Coklat, krem, hijau daun" },
  { id: "vibrant", name: "Vibrant Bold", description: "Merah, kuning, oranye" },
  { id: "pastel", name: "Pastel Soft", description: "Pink, mint, lavender" },
  { id: "monochrome", name: "Monokrom", description: "Hitam, putih, abu-abu" },
  { id: "traditional", name: "Tradisional Indo", description: "Merah, emas, batik" },
  { id: "fresh", name: "Fresh & Clean", description: "Hijau, biru muda, putih" },
];

export default function PromoPage() {
  const { profile, updateCredits } = useAuth();
  const { checkAndDeductCredit, refundCredit, clearRateLimit } = useCredits({ pageType: 'promo' });
  
  const [selectedTemplate, setSelectedTemplate] = useState(promoTemplates[0]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [contact, setContact] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("original");
  const [selectedColor, setSelectedColor] = useState("original");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("ig-feed");
  const [productImage, setProductImage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [rateLimitEndTime, setRateLimitEndTime] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error("Nama produknya mana nih? Diisi dulu ya!");
      return;
    }

    // Check and deduct credit first
    const creditResult = await checkAndDeductCredit();
    if (!creditResult.success) {
      if (creditResult.retryAt) {
        setRateLimitEndTime(creditResult.retryAt);
      }
      toast.error(creditResult.error || "Gagal memproses kredit, coba lagi nanti");
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
      const packageDesc = packageTypes.find(p => p.id === selectedPackage)?.name || "eco-friendly";
      const colorDesc = colorSchemes.find(c => c.id === selectedColor)?.name || "natural";
      const aspectRatio = aspectRatios.find(r => r.id === selectedAspectRatio);
      const ratioPrompt = aspectRatio ? ` Format: ${aspectRatio.ratio} (${aspectRatio.name})` : "";
      
      let prompt = selectedTemplate.template
        .replace(/\[PRODUCT_NAME\]/g, productName)
        .replace(/\[PACKAGE_TYPE\]/g, packageDesc)
        .replace(/\[COLOR_SCHEME\]/g, colorDesc)
        .replace("[TAGLINE]", tagline || "Rasakan kelezatannya!")
        .replace("[CONTACT]", contact || "0812-XXXX-XXXX");

      if (productDescription) {
        prompt += ` Product details: ${productDescription}.`;
      }

      if (aspectRatio) {
        prompt += ` ${aspectRatio.ratio}`;
      }

      let response;
      if (productImage) {
        response = await generateImageWithReference(prompt, productImage, 'promo', aspectRatio?.ratio);
      } else {
        response = await generateImage(prompt, 'promo', aspectRatio?.ratio);
      }
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Poster promo jadi! Siap viral");
        // No need to save to history - backend handles it automatically
        clearRateLimit();
      } else {
        throw new Error("Yah, gambarnya gak muncul");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat gambar";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Refund credit on failure
      const refundResult = await refundCredit();
      if (refundResult.success && profile) {
        updateCredits(profile.credits); // Restore credit
        toast.info("Tenang, kredit udah dibalikin kok");
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
            <div className="bg-genz-pink p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-wiggle">
              <Megaphone className="w-6 h-6 stroke-[3px]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
              Bikin Promo
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono">
            Pilih template, upload produk, jadi deh poster iklan!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Input Section - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Template Selection */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">1</span>
                Pilih Gaya Promo
              </label>
              <OptionGrid
                options={promoTemplates.map(t => ({ id: t.id, name: t.name, description: t.description }))}
                selectedId={selectedTemplate.id}
                onSelect={(id) => setSelectedTemplate(promoTemplates.find(t => t.id === id) || promoTemplates[0])}
              />
            </div>

            {/* Product Image */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl">
              <label className="block font-display uppercase text-lg mb-4 flex items-center gap-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">2</span>
                Upload Produk (Opsional)
              </label>
              <ImageUploader
                label=""
                onImageSelect={setProductImage}
              />
              <p className="text-xs font-bold font-mono mt-2 text-gray-500">
                *Upload foto produk asli biar hasilnya lebih mirip
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-white border-4 border-black p-6 shadow-brutal rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">3</span>
                <span className="font-display uppercase text-lg">Detail Produk</span>
              </div>
              
              <div>
                <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Keripik Tempe, Bakso Urat..."
                  className="w-full p-3 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-genz-pink/50 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Jelaskan produk Anda: bahan, rasa, keunikan..."
                  className="w-full p-3 border-4 border-black font-mono text-sm min-h-[80px] focus:outline-none focus:ring-4 focus:ring-genz-pink/50 rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            {/* Package & Color in grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">4</span>
                  Kemasan
                </label>
                <OptionGrid
                  options={packageTypes}
                  selectedId={selectedPackage}
                  onSelect={setSelectedPackage}
                  columns={2}
                />
              </div>

              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <label className="block font-display uppercase text-lg mb-3 flex items-center gap-2">
                  <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">5</span>
                  Warna
                </label>
                <OptionGrid
                  options={colorSchemes}
                  selectedId={selectedColor}
                  onSelect={setSelectedColor}
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

            {/* Optional Fields */}
            <div className="bg-genz-cyan/20 border-4 border-black p-5 rounded-xl border-dashed">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-sm font-display">7</span>
                <span className="font-display uppercase text-lg">Info Tambahan (Opsional)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Contoh: Renyah & Gurih!"
                    className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-xs tracking-wider mb-2">
                    Kontak
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="0812-XXXX-XXXX"
                    className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Rate Limit Warning */}
            {rateLimitEndTime && (
              <div className="border-4 border-black bg-yellow-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Sabar Dulu Gan! ⏳</span>
                </div>
                <CountdownTimer 
                  targetTime={rateLimitEndTime} 
                  onComplete={() => setRateLimitEndTime(null)} 
                />
              </div>
            )}
          </div>

          {/* Result Section - Sticky Sidebar */}
          <div className="lg:w-[380px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white border-4 border-black p-5 shadow-brutal rounded-xl">
                <span className="block font-display uppercase text-lg mb-4 tracking-wider flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Hasil Promo
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
                  className="w-full mt-5 py-4 bg-black text-white font-display text-lg uppercase border-4 border-transparent hover:bg-genz-pink hover:text-black hover:border-black transition-all shadow-brutal hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lagi Bikin...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Buat Promo
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
