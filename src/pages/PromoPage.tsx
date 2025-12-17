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
import { Megaphone, AlertCircle } from "lucide-react";
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
  const { checkAndDeductCredit, refundCredit, saveToHistory, clearRateLimit } = useCredits({ pageType: 'promo' });
  
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
      
      prompt += ratioPrompt;

      let response;
      if (productImage) {
        response = await generateImageWithReference(prompt, productImage);
      } else {
        response = await generateImage(prompt);
      }
      const imageData = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageData) {
        setImageUrl(imageData);
        toast.success("Gambar promo berhasil dibuat!");
        
        // Save to history
        await saveToHistory(imageData, "promo", productName, selectedAspectRatio);
        
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
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Promo Produk
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Pilih template dan buat gambar promo profesional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-3">
                1. Pilih Style Template
              </label>
              <OptionGrid
                options={promoTemplates.map(t => ({ id: t.id, name: t.name, description: t.description }))}
                selectedId={selectedTemplate.id}
                onSelect={(id) => setSelectedTemplate(promoTemplates.find(t => t.id === id) || promoTemplates[0])}
              />
            </div>

            {/* Product Details */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                2. Upload Foto Produk (Opsional)
              </label>
              <ImageUploader
                label=""
                onImageSelect={setProductImage}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload foto produk asli untuk hasil yang lebih akurat
              </p>
            </div>

            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                3. Nama Produk *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Keripik Tempe, Bakso Urat, Es Kopi Susu..."
                className="brutal-input"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                4. Deskripsi Produk (Opsional)
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Jelaskan produk Anda: bahan, rasa, keunikan..."
                className="brutal-textarea"
                rows={2}
              />
            </div>

            {/* Package Type */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                5. Jenis Kemasan
              </label>
              <OptionGrid
                options={packageTypes}
                selectedId={selectedPackage}
                onSelect={setSelectedPackage}
                columns={3}
              />
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                6. Skema Warna
              </label>
              <OptionGrid
                options={colorSchemes}
                selectedId={selectedColor}
                onSelect={setSelectedColor}
                columns={3}
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                7. Rasio Gambar
              </label>
              <AspectRatioSelector
                selectedId={selectedAspectRatio}
                onSelect={setSelectedAspectRatio}
              />
            </div>

            {/* Optional Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                  Tagline (Opsional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Renyah & Gurih!"
                  className="brutal-input"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-sm tracking-wider mb-2">
                  Kontak (Opsional)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="0812-XXXX-XXXX"
                  className="brutal-input"
                />
              </div>
            </div>

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
                <>Sedang Membuat...</>
              ) : (
                <>
                  <Megaphone className="w-5 h-5 mr-2" />
                  Buat Gambar Promo
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
