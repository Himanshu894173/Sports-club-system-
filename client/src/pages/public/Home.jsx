import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { productService } from '../../services/productService';
import { bookingService } from '../../services/bookingService';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  ArrowUpRight,
  Package,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import Button from '../../components/common/Button';

export const Home = () => {
  const { addToCart } = useCart();
  const [plans, setPlans] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCourtImage = (court) => {
    if (court.image) return court.image;
    const name = (court.name || '').toLowerCase();
    const sport = (court.sport || '').toLowerCase();
    if (sport === 'cricket' || name.includes('cricket') || name.includes('roboarm')) {
      return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800';
    }
    if (name.includes('clay')) {
      return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800';
    }
    if (sport === 'padel' || name.includes('padel')) {
      return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800';
  };

  useEffect(() => {
    Promise.all([
      memberService.getPlans().catch(() => []),
      productService.getProducts({ activeOnly: 'true' }).catch(() => []),
      bookingService.getCourts().catch(() => [])
    ]).then(([plansData, prodsData, courtsData]) => {
      setPlans(plansData);
      setFeaturedProducts(prodsData.slice(0, 4));
      setCourts(courtsData.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION - Styled to match Tennis Center reference */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center bg-forest-950 overflow-hidden text-cream-50">
        {/* Diagonal Court Graphic & Dynamic Equipment Composition */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          {/* Base Dark Navy background */}
          <div className="absolute inset-0 bg-forest-950" />

          {/* Diagonal geometric tennis court wedge directly matching reference mockup */}
          <div className="absolute -top-28 -right-20 w-[70%] sm:w-[58%] lg:w-[50%] h-[150%] transform rotate-[20deg] origin-top-right overflow-hidden shadow-2xl">
            {/* Court green turf */}
            <div className="absolute inset-0 bg-[#27864A]" />

            {/* Subtle court turf grain */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Diagonal court stripes */}
            <div className="absolute top-0 bottom-0 left-[18%] w-5 sm:w-7 bg-secondary shadow-volt" />
            <div className="absolute top-0 bottom-0 left-[30%] w-3 sm:w-4 bg-white/95 shadow-sm" />
            <div className="absolute top-0 bottom-0 left-[68%] w-3 sm:w-4 bg-white/95 shadow-sm" />
            <div className="absolute left-0 right-0 top-[38%] h-3 sm:h-4 bg-white/95 shadow-sm" />
            <div className="absolute left-0 right-0 top-[72%] h-3 sm:h-4 bg-white/95 shadow-sm" />
          </div>

          {/* Photorealistic 3D Tennis Ball with soft contact shadow */}
          <div className="absolute top-[28%] sm:top-[26%] right-[25%] sm:right-[30%] lg:right-[32%] z-10">
            {/* Soft oval contact shadow */}
            <div className="absolute top-16 sm:top-24 -left-3 w-20 sm:w-28 h-6 sm:h-7 bg-black/55 rounded-full blur-md transform -rotate-12" />

            {/* 3D Tennis Ball SVG with radial gradient and seams */}
            <svg
              viewBox="0 0 160 160"
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform -rotate-6 hover:rotate-12 transition-transform duration-700"
            >
              <defs>
                <radialGradient id="heroTennisBallGrad" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#FAFF66" />
                  <stop offset="35%" stopColor="#C3FF01" />
                  <stop offset="75%" stopColor="#96C800" />
                  <stop offset="100%" stopColor="#5E8000" />
                </radialGradient>
              </defs>
              <circle cx="80" cy="80" r="72" fill="url(#heroTennisBallGrad)" />
              {/* Ball Seams */}
              <path
                d="M 38 22 C 72 45, 72 115, 38 138"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M 122 22 C 88 45, 88 115, 122 138"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Felt highlight sheen */}
              <ellipse cx="60" cy="48" rx="22" ry="14" fill="#FFFFFF" opacity="0.3" transform="rotate(-30 60 48)" />
            </svg>
          </div>

          {/* Angled Professional Tennis Racket Graphic on Right */}
          <div className="absolute -bottom-10 sm:bottom-0 lg:bottom-4 right-0 sm:right-6 lg:right-10 z-10 w-60 sm:w-72 lg:w-88 transform -rotate-[22deg] origin-bottom-right">
            <svg viewBox="0 0 300 450" className="w-full h-auto drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)]">
              <defs>
                <linearGradient id="heroRacketRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E4252" />
                  <stop offset="30%" stopColor="#102D3A" />
                  <stop offset="70%" stopColor="#0F161D" />
                  <stop offset="100%" stopColor="#1E4252" />
                </linearGradient>
                <linearGradient id="heroVoltAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C3FF01" />
                  <stop offset="100%" stopColor="#A8DF00" />
                </linearGradient>
                <pattern id="heroRacketStrings" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.45" />
                </pattern>
              </defs>

              {/* Racket Strings */}
              <ellipse cx="150" cy="160" rx="95" ry="125" fill="url(#heroRacketStrings)" />

              {/* Racket Outer Rim */}
              <ellipse
                cx="150"
                cy="160"
                rx="102"
                ry="132"
                fill="none"
                stroke="url(#heroRacketRim)"
                strokeWidth="16"
              />

              {/* Volt Accent Segments */}
              <path
                d="M 52 140 A 102 132 0 0 1 70 85"
                fill="none"
                stroke="url(#heroVoltAccent)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 248 140 A 102 132 0 0 0 230 85"
                fill="none"
                stroke="url(#heroVoltAccent)"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Throat */}
              <path
                d="M 115 285 L 138 350 L 162 350 L 185 285"
                fill="none"
                stroke="url(#heroRacketRim)"
                strokeWidth="14"
              />

              {/* Shaft & Handle */}
              <rect x="136" y="345" width="28" height="90" rx="6" fill="#193847" stroke="#0F161D" strokeWidth="3" />
              <line x1="136" y1="365" x2="164" y2="368" stroke="#C3FF01" strokeWidth="2" opacity="0.8" />
              <line x1="136" y1="385" x2="164" y2="388" stroke="#C3FF01" strokeWidth="2" opacity="0.8" />
              <line x1="136" y1="405" x2="164" y2="408" stroke="#C3FF01" strokeWidth="2" opacity="0.8" />
              <rect x="134" y="430" width="32" height="12" rx="3" fill="#C3FF01" />
            </svg>
          </div>

          {/* Left subtle dark gradient to ensure text readability */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] bg-gradient-to-r from-forest-950 via-forest-950/95 to-transparent z-[5]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            {/* Volt pill badge matching reference */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-forest-950 text-xs font-black tracking-wider uppercase mb-6 shadow-volt">
              <span className="w-2 h-2 rounded-full bg-forest-950 animate-pulse"></span>
              ✦ PROFESSIONAL ITF COURTS & ACADEMY
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black text-white uppercase leading-[1.02] tracking-tight">
              KHELORA <br />
              <span className="text-secondary block">SPORTS ARENA</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-cream-100/90 leading-relaxed font-normal max-w-xl">
              ITF-certified tournament Hard and Red Clay courts, automated cricket lanes, and private clubhouse amenities. Engineered for peak athletic performance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/courts">
                <Button variant="gold" size="lg" className="rounded-full shadow-volt font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Book a Court Slot <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/membership">
                <Button variant="outlineGold" size="lg" className="rounded-full font-bold">
                  Explore Memberships
                </Button>
              </Link>
              <Link to="/trial">
                <Button variant="ghost" size="lg" className="text-cream-200 hover:text-secondary rounded-full flex items-center gap-1.5">
                  Schedule Free Trial <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING STATS BAR - Directly matching reference mockup dark capsule */}
      <div className="relative -mt-16 sm:-mt-20 z-20 max-w-5xl mx-auto px-4">
        <div className="bg-forest-900/95 backdrop-blur-md border border-forest-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-white">
          {/* Stat 1: Courts */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white leading-none">15+</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">PROF. COURTS</p>
            </div>
          </div>

          {/* Stat 2: Area */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white leading-none">6,800 m²</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">TOTAL ARENA</p>
            </div>
          </div>

          {/* Stat 3: Coaches */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white leading-none">30+</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">ELITE COACHES</p>
            </div>
          </div>

          {/* Stat 4: 24/7 Access */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white leading-none">24/7</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">RESIDENT ACCESS</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SPORTS ZONES (ЗОНЫ СПОРТА) - 4 Dark Full-Bleed Cards Matching Reference Mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-volt animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest text-muted">
                DISCIPLINES & FACILITIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-sans font-black text-forest-950 uppercase tracking-tight">
              SPORTS ZONES
            </h2>
          </div>
          <p className="text-sm text-gray-600 max-w-md font-medium leading-relaxed">
            World-class architectural planning and professional tournament-grade lighting engineered for peak concentration and athletic excellence.
          </p>
        </div>

        {/* 2x2 Grid of dark full-bleed cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Lawn Tennis */}
          <Link to="/courts" className="group block">
            <div className="relative h-96 sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1.5 border border-forest-800/40 group-hover:border-secondary">
              <img
                src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200"
                alt="Lawn Tennis"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F161D] via-[#0F161D]/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between z-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight">
                    LAWN TENNIS
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                    ITF Certified Hard & Red Clay Courts
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:bg-secondary group-hover:text-forest-950 group-hover:border-secondary flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Fitness & Gym */}
          <Link to="/trial" className="group block">
            <div className="relative h-96 sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1.5 border border-forest-800/40 group-hover:border-secondary">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200"
                alt="Athletic Gym"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F161D] via-[#0F161D]/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between z-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight">
                    FITNESS & CONDITIONING
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                    TechnoGym Olympic Equipment & Bio-track
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:bg-secondary group-hover:text-forest-950 group-hover:border-secondary flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Dynamic Padel */}
          <Link to="/courts" className="group block">
            <div className="relative h-96 sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1.5 border border-forest-800/40 group-hover:border-secondary">
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200"
                alt="Dynamic Padel"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F161D] via-[#0F161D]/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between z-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight">
                    DYNAMIC PADEL
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                    Fast-Paced Arena with Panoramic Glass
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:bg-secondary group-hover:text-forest-950 group-hover:border-secondary flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 4: Badminton & Nets */}
          <Link to="/courts" className="group block">
            <div className="relative h-96 sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1.5 border border-forest-800/40 group-hover:border-secondary">
              <img
                src="https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200"
                alt="Badminton & Practice Arenas"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F161D] via-[#0F161D]/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between z-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight">
                    BADMINTON & NETS
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                    Professional Tournament Lighting & Automated RoboArm Nets
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:bg-secondary group-hover:text-forest-950 group-hover:border-secondary flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. COURT FACILITIES SHOWCASE */}
      <section className="bg-cream-100 py-20 border-y border-clubBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-hover block mb-2">
                Live Reservation Grid
              </span>
              <h2 className="text-3xl font-sans font-black text-forest-950 uppercase tracking-tight">
                Championship Courts & Nets
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                1-hour booking sessions available every 30 minutes from 06:00 to 22:00.
              </p>
            </div>
            <Link to="/courts" className="mt-4 md:mt-0">
              <Button variant="primary" size="sm" className="rounded-full">
                View Live Court Grid →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courts.map((court) => (
              <div
                key={court.id}
                className="bg-white rounded-2xl p-5 border border-clubBorder shadow-premium hover:shadow-premium-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-forest-950">
                    <img
                      src={getCourtImage(court)}
                      alt={court.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-secondary border border-secondary/40 backdrop-blur-sm">
                      {court.sport}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-cream-50 border border-forest-700 backdrop-blur-sm">
                      {formatCurrency(court.hourlyRate)}/hr
                    </div>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-forest-950 mb-1">{court.name}</h3>
                  <p className="text-xs text-secondary-hover font-semibold mb-2">{court.surface}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{court.description}</p>
                </div>

                <div className="pt-4 border-t border-clubBorder flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary-hover" /> 1-Hr Sessions
                  </span>
                  <Link
                    to={`/courts?courtId=${court.id}`}
                    className="text-xs font-bold text-forest-900 hover:text-secondary-hover flex items-center gap-0.5"
                  >
                    Check Free Slots <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP TIERS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary-hover block mb-2">
            Private Membership
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-forest-950 uppercase tracking-tight">
            Tiers Designed for Dedicated Competitors
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Unlock complimentary court reservations, priority booking privileges, and exclusive discounts across the pro shop and cafeteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isGold = plan.name.toLowerCase() === 'gold';
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  isGold
                    ? 'bg-forest-950 text-cream-50 border-2 border-secondary shadow-volt ring-1 ring-secondary'
                    : 'bg-white text-gray-900 border border-clubBorder shadow-premium'
                }`}
              >
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-forest-950 font-black text-[10px] uppercase tracking-wider shadow">
                    Most Popular Tier
                  </div>
                )}

                <div>
                  <h3 className={`text-2xl font-sans font-black uppercase ${isGold ? 'text-secondary' : 'text-forest-950'}`}>
                    {plan.name} Tier
                  </h3>
                  <p className={`text-xs mt-1 ${isGold ? 'text-cream-200' : 'text-gray-500'}`}>
                    {plan.tagline}
                  </p>

                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-sans font-black">
                      {formatCurrency(plan.priceAnnual)}
                    </span>
                    <span className={`text-xs ml-2 ${isGold ? 'text-gray-400' : 'text-gray-500'}`}>/ year</span>
                    <p className={`text-[11px] mt-1 ${isGold ? 'text-secondary/90' : 'text-gray-500'}`}>
                      or {formatCurrency(plan.priceMonthly)} billed monthly
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl mb-6 text-xs font-semibold ${isGold ? 'bg-forest-900 text-secondary' : 'bg-cream-100 text-forest-900'}`}>
                    ✦ {plan.courtDiscountPercent === 100 ? 'Complimentary Court Reservations' : `${plan.courtDiscountPercent}% Off Court Bookings`}
                    <br />
                    ✦ {plan.shopDiscountPercent}% Off Shop Gear & Bar Dining
                  </div>

                  <ul className="space-y-3 text-xs">
                    {plan.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isGold ? 'text-secondary' : 'text-forest-800'}`} />
                        <span className={isGold ? 'text-cream-100' : 'text-gray-600'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-forest-800/40">
                  <Link to={`/register?plan=${plan.name}`}>
                    <Button
                      variant={isGold ? 'gold' : 'primary'}
                      className="w-full font-bold shadow-md rounded-full"
                    >
                      Apply for {plan.name} Membership
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. SPORTS GEAR PRO SHOP HIGHLIGHTS */}
      <section className="bg-forest-950 text-cream-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
                Official Pro Shop
              </span>
              <h2 className="text-3xl font-sans font-black text-white uppercase tracking-tight">
                Premium Rackets, Balls & Matchday Gear
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Shared inventory: order online for home delivery or pick up directly at the front desk counter.
              </p>
            </div>
            <Link to="/shop" className="mt-4 md:mt-0">
              <Button variant="outlineGold" size="sm" className="rounded-full">
                Explore Full Catalog →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card-dark rounded-2xl overflow-hidden border border-forest-800 flex flex-col justify-between group hover:border-secondary transition-all shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-forest-950">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-secondary border border-secondary/40">
                    {product.brand}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans font-bold text-base text-cream-50 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-cream-50">
                          {formatCurrency(product.price)}
                        </span>
                        <p className="text-[10px] text-secondary font-medium">
                          Gold Member: {formatCurrency(product.memberPrice)}
                        </p>
                      </div>
                      <span className="text-[11px] text-emerald-400">
                        {product.stock} in stock
                      </span>
                    </div>

                    <Button
                      variant="gold"
                      size="sm"
                      className="w-full font-bold rounded-xl"
                      onClick={() => addToCart(product, 1)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5. VERANDA CAFETERIA & MATCHDAY BAR HIGHLIGHT */}
      <section className="bg-cream-100 py-20 border-t border-clubBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-hover block mb-2">
                Athlete Nutrition & Social Lounge
              </span>
              <h2 className="text-3xl font-sans font-black text-forest-950 uppercase tracking-tight">
                KHELORA Veranda & Lounge
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-xl">
                Al-fresco courtside dining, 30g whey isolate smoothies, single-origin cold brews, and seed-oil free recovery bowls.
              </p>
            </div>
            <Link to="/bar" className="mt-4 md:mt-0">
              <Button variant="primary" size="sm" className="rounded-full">
                View Full Veranda Menu →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl overflow-hidden border border-clubBorder shadow-premium hover:shadow-premium-lg transition-all group flex flex-col justify-between">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80"
                  alt="Berry Blast Whey Recovery Smoothie"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-secondary backdrop-blur-md">
                  30g Protein Isolate
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Smoothies & Juices</span>
                <h3 className="font-sans font-bold text-lg text-forest-950 mb-2">Berry Blast Whey Recovery</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">Grass-fed whey isolate, wild blueberries, organic almond milk, and chia seeds for accelerated muscle repair.</p>
                <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                  <span className="text-base font-bold text-forest-950">₹340</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">Gold Member: ₹289</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-clubBorder shadow-premium hover:shadow-premium-lg transition-all group flex flex-col justify-between">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80"
                  alt="Sourdough Avocado & Poached Eggs"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-secondary backdrop-blur-md">
                  Chef Signature
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">High-Protein Meals</span>
                <h3 className="font-sans font-bold text-lg text-forest-950 mb-2">Sourdough Avocado & Poached Eggs</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">Stone-ground sourdough, smashed Hass avocado, free-range poached eggs, Danish feta, and organic micro-greens.</p>
                <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                  <span className="text-base font-bold text-forest-950">₹420</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">Gold Member: ₹357</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-clubBorder shadow-premium hover:shadow-premium-lg transition-all group flex flex-col justify-between">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80"
                  alt="Chikmagalur Single Origin Cold Brew"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-secondary backdrop-blur-md">
                  18h Slow Steep
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Artisanal Coffee</span>
                <h3 className="font-sans font-bold text-lg text-forest-950 mb-2">Single Origin Chikmagalur Cold Brew</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">Steeped for 18 hours in filtered cold spring water. Velvety body with natural dark chocolate and caramel undertones.</p>
                <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                  <span className="text-base font-bold text-forest-950">₹240</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">Gold Member: ₹204</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SIGNATURE BOTTOM CTA BANNER - Directly matching reference mockup bright volt card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-secondary rounded-[32px] p-8 sm:p-14 lg:p-16 shadow-volt border border-secondary-hover text-heading relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-black uppercase tracking-tight text-heading leading-[1.05]">
              READY TO REACH <br />
              THE NEXT LEVEL?
            </h2>
            <p className="mt-5 text-sm sm:text-base text-heading/85 font-semibold leading-relaxed max-w-xl">
              Leave a request. We will conduct a personal tour of the club, showcase the equipment, and select a personalized training program for you and your family.
            </p>

            <div className="mt-8">
              <Link to="/trial">
                <button className="bg-heading hover:bg-forest-900 text-white rounded-full px-8 py-4 font-black text-sm uppercase tracking-wider shadow-2xl inline-flex items-center gap-2.5 transition-all hover:scale-105">
                  START TRAINING <ArrowUpRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
