import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, Sparkles, Heart, Flame, MousePointer2, Rocket, DollarSign, MessageCircle, Coffee, Glasses } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";

// Capture referral code from URL on landing page
function useReferralCapture() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode.toUpperCase());
      console.log('Referral code captured from landing:', refCode);
    }
  }, [searchParams]);
}

const features = [
  {
    icon: ImagePlus,
    title: "FOTO PRODUK INSTAN",
    description: "Ketik 'keripik pedas background api', BOOM! Jadi deh foto keren.",
    color: "bg-genz-lime"
  },
  {
    icon: Megaphone,
    title: "POSTER PROMO",
    description: "Template story IG & WA siap pake. Gak perlu jago ngedit!",
    color: "bg-genz-cyan"
  },
  {
    icon: Camera,
    title: "FOTO MAKANAN",
    description: "Bikin foto makanan auto ngiler. Kayak difoto chef bintang 5!",
    color: "bg-genz-pink"
  },
  {
    icon: Cat,
    title: "MASKOT UNIK",
    description: "Bikin karakter lucu buat brand kamu. Biar makin diinget orang.",
    color: "bg-genz-purple"
  },
  {
    icon: Palette,
    title: "TIRU STYLE",
    description: "Nemu foto bagus? Kita bisa bikin yang mirip-mirip style-nya.",
    color: "bg-genz-coral"
  },
  {
    icon: Flame,
    title: "TRENDING STYLE",
    description: "Selalu update sama gaya desain yang lagi hits jaman now.",
    color: "bg-genz-blue"
  }
];

const steps = [
  {
    number: "1",
    title: "KETIK MAUMU",
    desc: "Contoh: 'Bakso mercon super pedas di mangkok ayam jago'",
    rotate: "-rotate-2"
  },
  {
    number: "2",
    title: "KLIK GAS!",
    desc: "Tunggu bentar sambil nyeruput kopi, AI kita lagi kerja keras.",
    rotate: "rotate-2"
  },
  {
    number: "3",
    title: "POST & CUAN",
    desc: "Download gambarnya, upload ke sosmed, siap-siap banjir orderan!",
    rotate: "-rotate-1"
  }
];

const testimonials = [
  {
    name: "Kak Sisi",
    role: "Owner Seblak Huhah",
    text: "Gila sih, foto seblak gue jadi estetik parah! Omzet naik 2x lipat sejak pake ini. Wajib coba guys!",
    handle: "@seblak_sisi"
  },
  {
    name: "Bang Jago",
    role: "Distro Kaos",
    text: "Dulu pusing mikirin konten IG, sekarang tinggal ketik jadi. Hemat budget banget buat UMKM kecil kayak gue.",
    handle: "@kaos.jagoan"
  },
  {
    name: "Mba Rara",
    role: "Cookies Homemade",
    text: "Suka banget sama fiturnya! Gampang dipake, hasilnya nggak kaleng-kaleng. Love it!",
    handle: "@rara.cookies"
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  
  // Capture referral code from URL
  useReferralCapture();
  
  return (
    <div className="min-h-screen bg-[#f3f3f3] font-mono selection:bg-genz-pink selection:text-white overflow-x-hidden">
      
      {/* Marquee Banner - TOP */}
      <div className="bg-black text-white py-2 overflow-hidden border-b-4 border-black rotate-1 scale-105 z-50 relative shadow-[0_10px_0_rgba(0,0,0,0.1)]">
        <div className="marquee font-display tracking-wider text-xl flex items-center">
          <span className="marquee-content px-4 flex items-center gap-2">
            <Flame className="w-5 h-5 inline-block fill-orange-500 text-orange-500" /> GRATIS BUAT UMKM  •  GAK PERLU JAGO DESAIN  •  CUMA PAKAI HP  •  HASILNYA KECE BADAI  •  AUTO LARIS MANIS  •  COBAIN SEKARANG  •  
            <Flame className="w-5 h-5 inline-block fill-orange-500 text-orange-500" /> GRATIS BUAT UMKM  •  GAK PERLU JAGO DESAIN  •  CUMA PAKAI HP  •  HASILNYA KECE BADAI  •  AUTO LARIS MANIS  •  COBAIN SEKARANG  •
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#f3f3f3]/90 backdrop-blur-md border-b-4 border-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-genz-lime p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all rounded-lg">
              <Zap className="w-6 h-6 md:w-8 md:h-8 stroke-[3px]" />
            </div>
            <span className="font-display text-3xl tracking-tighter uppercase stroke-black stroke-2">UMKM.AI</span>
          </div>
          
          <Link to="/dashboard" className="hidden md:flex items-center gap-2 bg-genz-pink text-black px-6 py-2 font-display text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-full">
            {user ? 'Dashboard' : 'Masuk'} <ArrowRight className="w-6 h-6 stroke-[3px]" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-genz-cyan rounded-full border-4 border-black opacity-50 blur-xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-genz-pink rounded-full border-4 border-black opacity-50 blur-xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <ScrollReveal animation="zoom-in" duration={800}>
            <div className="inline-block mb-6">
               <span className="px-6 py-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full font-bold uppercase tracking-wide text-sm md:text-base flex items-center gap-2 transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                 <Sparkles className="w-5 h-5 text-genz-purple fill-genz-purple" />
                 Solusi Konten No. 1 Buat UMKM
               </span>
            </div>
          </ScrollReveal>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 uppercase drop-shadow-sm">
            <ScrollReveal animation="slide-left" delay={200} className="inline-block">FOTO PRODUK</ScrollReveal> <br/>
            <ScrollReveal animation="rotate-in" delay={400} className="relative inline-block text-white px-4 mx-2 transform -rotate-2 hover:rotate-2 transition-transform duration-300">
              <span className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></span>
              <span className="absolute inset-0 bg-genz-lime border-4 border-black rounded-xl"></span>
              <span className="relative z-10 text-black">KEREN?</span>
            </ScrollReveal>
            <br/>
            <ScrollReveal animation="slide-right" delay={600} className="inline-block">
              <span className="text-stroke-3 text-transparent bg-clip-text bg-gradient-to-r from-black to-black" style={{ WebkitTextStroke: '3px black' }}>PAKE AI AJA!</span>
            </ScrollReveal>
          </h1>

          <ScrollReveal animation="fade-up" delay={800}>
            <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed bg-white/50 backdrop-blur-sm p-4 rounded-xl border-2 border-black/10">
              Gak perlu sewa studio mahal atau jago desain. <br className="hidden md:block" />
              Cuma modal HP, ketik-ketik dikit, foto produk auto <span className="inline-flex items-center justify-center gap-2 bg-genz-pink text-white px-4 py-1 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all font-display tracking-wider mx-2 align-middle text-lg md:text-xl">GLOWING! <Sparkles className="w-5 h-5 fill-white animate-pulse" /></span>
            </p>
          </ScrollReveal>

          <ScrollReveal animation="bounce-in" delay={1000} className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link to="/dashboard" className="group relative px-8 py-4 bg-genz-cyan text-black font-display text-2xl uppercase tracking-wide border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              <span className="flex items-center gap-3">
                {user ? 'BUKA DASHBOARD!' : 'GAS COBA GRATIS!'} <Rocket className="w-6 h-6 fill-black" />
              </span>
            </Link>
            
            <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="User" />
                  </div>
                ))}
              </div>
              <span className="bg-white px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                1000+ UMKM udah join!
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section className="py-20 bg-black text-white border-y-4 border-black relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <ScrollReveal animation="slide-left">
              <h2 className="font-display text-5xl md:text-7xl uppercase mb-4 text-genz-lime" style={{ textShadow: '4px 4px 0 #fff' }}>
                Kenapa Harus Pake Ini?
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-xl md:text-2xl font-mono text-gray-300 flex items-center justify-center gap-2">
                Fitur lengkap buat bikin daganganmu makin laku keras! <DollarSign className="w-7 h-7 text-green-400 inline-block" />
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div className={`group relative p-8 bg-white text-black border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_#fff] hover:shadow-[12px_12px_0px_0px_#fff] hover:-translate-y-2 transition-all duration-300 h-full`}>
                  <div className={`absolute top-0 right-0 p-4 ${feature.color} border-l-4 border-b-4 border-black rounded-bl-2xl rounded-tr-xl transform group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="font-display text-3xl uppercase mb-4 mt-4 leading-none">{feature.title}</h3>
                  <p className="font-medium text-lg leading-relaxed border-t-2 border-black pt-4">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-genz-purple border-b-4 border-black overflow-hidden">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="zoom-in">
            <h2 className="font-display text-5xl md:text-7xl text-center uppercase mb-16 text-white stroke-black flex items-center justify-center gap-3" style={{ textShadow: '5px 5px 0 #000' }}>
              Caranya Gampang Bet! <Zap className="w-16 h-16 fill-yellow-400 text-yellow-400" />
            </h2>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 items-center">
            {steps.map((step, index) => (
              <ScrollReveal key={index} animation="rotate-in" delay={index * 200} className="w-full max-w-sm">
                <div className={`relative bg-white p-8 border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transform ${step.rotate} hover:rotate-0 transition-transform duration-300`}>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-black text-white font-display text-4xl flex items-center justify-center rounded-full border-4 border-white transform -rotate-12">
                    {step.number}
                  </div>
                  <h3 className="font-display text-3xl uppercase mb-4 mt-4 bg-genz-lime inline-block px-2 border-2 border-black transform -skew-x-6">
                    {step.title}
                  </h3>
                  <p className="text-lg font-bold">
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-[#f3f3f3] relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <ScrollReveal animation="bounce-in">
              <span className="bg-black text-white px-4 py-1 font-bold rounded-full mb-4 animate-bounce inline-block">REAL TESTIMONI</span>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <h2 className="font-display text-5xl md:text-7xl uppercase text-center flex items-center justify-center gap-3">
                Spill Kata Mereka <MessageCircle className="w-16 h-16 fill-genz-cyan text-black" />
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} animation="fade-up" delay={i * 150}>
                <div className="bg-white p-6 border-4 border-black rounded-xl shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-1 h-full">
                  <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none">{t.name}</h4>
                      <span className="text-sm text-gray-500 font-bold">{t.handle}</span>
                    </div>
                    <div className="ml-auto">
                      <Heart className="w-6 h-6 fill-genz-pink text-black" />
                    </div>
                  </div>
                  <p className="text-lg font-medium leading-relaxed mb-4">
                    "{t.text}"
                  </p>
                  <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>{new Date().toLocaleDateString()}</span> • <span>Via Twitter</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-genz-lime border-t-4 border-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 opacity-20 animate-spin-slow">
            <Sparkles className="w-32 h-32 text-black" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-20 animate-bounce">
            <Zap className="w-32 h-32 text-black fill-black" />
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollReveal animation="zoom-in">
            <h2 className="font-display text-6xl md:text-8xl uppercase mb-8 leading-[0.9]">
              Tunggu Apa Lagi? <br/>
              <span className="text-white text-stroke-3" style={{ WebkitTextStroke: '3px black' }}>Buruan Cobain!</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-2xl font-bold mb-12 max-w-2xl mx-auto flex items-center justify-center gap-2">
              Gabung sekarang biar daganganmu makin <span className="italic bg-black text-white px-2">next level</span>. 
              Gratis kok, santuy aja! <Glasses className="w-7 h-7 inline-block" />
            </p>
          </ScrollReveal>
          
          <ScrollReveal animation="bounce-in" delay={400} className="inline-block">
            <Link to="/dashboard" className="inline-flex group relative">
              <div className="absolute inset-0 bg-black rounded-xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
              <div className="relative bg-genz-pink border-4 border-black px-12 py-6 rounded-xl flex items-center gap-4 text-3xl font-display uppercase tracking-wider hover:-translate-y-1 transition-transform">
                {user ? 'Buka Dashboard!' : 'Bikin Sekarang!'}
                <MousePointer2 className="w-8 h-8 fill-white animate-bounce" />
              </div>
            </Link>
          </ScrollReveal>

          <ScrollReveal animation="fade-in" delay={800}>
            <p className="mt-8 font-bold text-sm opacity-75">
              *Tanpa syarat ribet, tinggal login gaspol!
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-genz-lime border-2 border-white rounded flex items-center justify-center">
              <Zap className="w-8 h-8 text-black fill-black" />
            </div>
            <span className="font-display text-4xl uppercase">UMKM.AI</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-sm font-mono opacity-80 mb-12">
            <a href="#" className="hover:text-genz-lime hover:underline decoration-2">Kebijakan Privasi</a>
            <a href="#" className="hover:text-genz-lime hover:underline decoration-2">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-genz-lime hover:underline decoration-2">Hubungi Kami</a>
          </div>
          <p className="font-bold uppercase tracking-widest text-xs text-gray-500 flex items-center justify-center gap-2">
            © 2025 UMKM.AI — Dibuat dengan <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> dan <Coffee className="w-4 h-4 text-amber-700" /> untuk Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
