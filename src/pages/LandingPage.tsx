import { Link } from "react-router-dom";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, Star, Users, Sparkles, CheckCircle2, HelpCircle } from "lucide-react";

const features = [
  {
    icon: ImagePlus,
    title: "Buat Foto Produk",
    description: "Cukup ketik 'kue bolu enak di piring cantik', gambar langsung jadi.",
  },
  {
    icon: Megaphone,
    title: "Bikin Poster Iklan",
    description: "Template siap pakai untuk promosi di WhatsApp atau Instagram.",
  },
  {
    icon: Camera,
    title: "Foto Makanan Mewah",
    description: "Ubah foto makanan biasa jadi terlihat seperti di restoran bintang 5.",
  },
  {
    icon: Cat,
    title: "Bikin Maskot Lucu",
    description: "Buat karakter unik untuk ciri khas dagangan Anda.",
  },
  {
    icon: Palette,
    title: "Tiru Gaya Foto",
    description: "Suka gaya foto toko sebelah? Kita bisa buat yang mirip!",
  },
];

const steps = [
  {
    number: "1",
    title: "Tulis Keinginan Anda",
    desc: "Contoh: 'Foto nasi goreng spesial dengan telur mata sapi'"
  },
  {
    number: "2",
    title: "Klik Tombol 'Buat'",
    desc: "Tunggu sebentar, AI akan bekerja untuk Anda"
  },
  {
    number: "3",
    title: "Simpan Gambar",
    desc: "Gambar siap diposting ke sosmed atau status WA"
  }
];

const testimonials = [
  {
    name: "Bu Siti",
    role: "Penjual Kue Basah",
    text: "Awalnya takut susah, ternyata gampang banget. Sekarang foto kue saya jadi bagus-bagus, pesanan jadi nambah!",
    location: "Surabaya"
  },
  {
    name: "Pak Budi",
    role: "Pengrajin Kayu",
    text: "Dulu bingung mau foto produk tapi HP kentang. Pakai UMKM.AI, hasilnya kayak difotoin fotografer profesional.",
    location: "Jepara"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Marquee Banner */}
      <div className="bg-foreground text-background py-3 overflow-hidden">
        <div className="marquee">
          <span className="marquee-content font-bold uppercase text-base tracking-widest">
            ★ GRATIS UNTUK UMKM ★ CARA MUDAH BIKIN FOTO PRODUK ★ TIDAK PERLU JAGO DESAIN ★ HASIL PROFESIONAL ★
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b-[3px] border-foreground bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent p-2 border-[3px] border-foreground rounded-sm">
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-display text-2xl md:text-3xl uppercase tracking-tight">UMKM.AI</span>
            </div>
            
            <Link to="/dashboard" className="brutal-btn px-4 py-2 md:px-6 md:py-3 text-base md:text-lg flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="hidden md:inline">Masuk Dashboard</span>
              <span className="md:hidden">Masuk</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b-[3px] border-foreground bg-gradient-to-br from-genz-lime/20 via-genz-cyan/20 to-genz-pink/20 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-float">✨</div>
        <div className="absolute bottom-20 right-20 text-6xl animate-float" style={{ animationDelay: '1s' }}>🚀</div>
        <div className="absolute top-1/2 right-10 text-5xl animate-wiggle">💡</div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 md:mb-8 animate-bounce-in">
              <span className="brutal-tag text-base md:text-lg px-4 py-2 bg-genz-pink border-[3px] border-foreground">
                <Star className="w-5 h-5 inline mr-2 fill-current" />
                KHUSUS UMKM INDONESIA 🇮🇩
              </span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl mb-6 md:mb-8 leading-[1.1] uppercase animate-slide-up">
              Bikin Foto Produk Bagus<br />
              <span className="inline-block bg-gradient-to-r from-genz-lime via-genz-cyan to-genz-pink bg-clip-text text-transparent border-[4px] border-foreground px-4 py-2 animate-glow" style={{ WebkitTextStroke: '2px black', WebkitTextFillColor: 'transparent' }}>Cuma Pakai HP</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto text-foreground leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Tidak perlu sewa fotografer mahal. Tidak perlu jago desain. 
              Cukup ketik, gambar langsung jadi. Cocok untuk Bapak/Ibu pemilik usaha. 🎨
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/dashboard" className="brutal-btn-primary text-xl px-8 py-4 w-full sm:w-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all bg-genz-lime hover:animate-wiggle">
                <Zap className="w-6 h-6 mr-2 fill-yellow-300" />
                Coba Gratis Sekarang ⚡
              </Link>
              <p className="text-sm font-bold mt-2 sm:mt-0 sm:ml-4 flex items-center bg-white border-[3px] border-foreground px-4 py-2 shadow-brutal">
                <CheckCircle2 className="w-5 h-5 mr-1 text-green-600" />
                Tanpa Kartu Kredit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="py-10 bg-foreground text-background border-b-[3px] border-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-display text-accent mb-2">1000+</div>
              <div className="text-base md:text-lg font-bold uppercase tracking-wider">UMKM Bergabung</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-display text-accent mb-2">Gratis</div>
              <div className="text-base md:text-lg font-bold uppercase tracking-wider">Untuk Mulai</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-display text-accent mb-2">24/7</div>
              <div className="text-base md:text-lg font-bold uppercase tracking-wider">Bisa Diakses</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-display text-accent mb-2">Mudah</div>
              <div className="text-base md:text-lg font-bold uppercase tracking-wider">Tanpa Ribet</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-b-[3px] border-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-display text-center mb-12 uppercase">
            Caranya Gampang Banget
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const stepColors = ['bg-genz-cyan', 'bg-genz-pink', 'bg-genz-lime'];
              const badgeColors = ['bg-genz-pink', 'bg-genz-lime', 'bg-genz-cyan'];
              return (
              <div key={index} className={`relative p-8 border-[3px] border-foreground ${stepColors[index]} rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all`}>
                <div className={`absolute -top-6 -left-6 w-12 h-12 ${badgeColors[index]} text-foreground rounded-full flex items-center justify-center text-2xl font-bold border-[3px] border-foreground`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold mb-4 mt-2">{step.title}</h3>
                <p className="text-lg text-foreground leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            )}))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#f0f0f0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display uppercase mb-4">
              Apa Yang Bisa Anda Buat?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Semua kebutuhan gambar untuk jualan online, tersedia di sini.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const colors = ['bg-genz-lime', 'bg-genz-pink', 'bg-genz-cyan', 'bg-genz-coral', 'bg-genz-purple'];
              const bgColor = colors[index % colors.length];
              return (
              <div
                key={index}
                className={`bg-white p-8 border-[3px] border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:animate-wiggle group`}
              >
                <div className={`${bgColor} w-16 h-16 flex items-center justify-center border-[3px] border-foreground mb-6 rounded-full group-hover:animate-float`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl uppercase mb-3">
                  {feature.title}
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )}))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-secondary border-y-[3px] border-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-display text-center mb-12 uppercase">
            Kata Mereka
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-white p-8 border-[3px] border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                </div>
                <blockquote className="text-xl md:text-2xl font-medium mb-6 leading-relaxed">
                  "{item.text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center border-2 border-foreground font-bold text-lg">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{item.name}</div>
                    <div className="text-muted-foreground">{item.role}, {item.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Help */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 text-foreground" />
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-6">
            Masih Bingung?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-700">
            Jangan khawatir. Aplikasi ini dirancang sangat mudah. Kalau bisa kirim pesan WhatsApp, pasti bisa pakai aplikasi ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             {/* Placeholder for help link if needed, or just reassure */}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-genz-pink via-genz-cyan to-genz-lime border-y-[3px] border-foreground relative overflow-hidden">
        <div className="absolute top-10 right-20 text-6xl animate-float">🎉</div>
        <div className="absolute bottom-10 left-20 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🔥</div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-display uppercase mb-6 animate-glow">
            Mulai Sekarang, Gratis! 🎊
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-bold text-foreground">
            Bergabung dengan ribuan UMKM lainnya. Bikin dagangan makin laris dengan foto yang bagus. 📈
          </p>
          <Link to="/dashboard" className="inline-flex items-center justify-center bg-foreground text-background text-xl md:text-2xl font-bold py-4 px-10 border-[3px] border-foreground shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] transition-all hover:animate-wiggle">
            <Zap className="w-6 h-6 mr-3 fill-yellow-400" />
            Buat Akun Gratis ⚡
            <ArrowRight className="w-6 h-6 ml-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-8 h-8 text-accent fill-accent" />
            <span className="font-display text-3xl uppercase">UMKM.AI</span>
          </div>
          <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
            Membantu UMKM Indonesia naik kelas dengan teknologi AI yang mudah dan terjangkau.
          </p>
          <div className="border-t border-gray-700 pt-8">
            <p className="font-bold uppercase tracking-widest text-sm">
              © 2025 UMKM.AI — Dibuat dengan ❤️ untuk Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
