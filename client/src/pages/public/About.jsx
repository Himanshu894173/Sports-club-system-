import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Shield, Users, Trophy, Clock, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

export const About = () => {
  return (
    <div className="pb-24 space-y-20">
      {/* Header Banner */}
      <section className="bg-forest-950 text-cream-50 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
            The KHELORA Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-cream-50">
            A Heritage of Sports Excellence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-cream-200 max-w-3xl leading-relaxed">
            Founded with a singular pursuit: to offer serious tennis enthusiasts and cricket players an uncompromising athletic sanctuary, completely free of the scheduling friction and outdated management of ordinary clubs.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-forest-950 mb-4">
              Designed For The Dedicated Athlete
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              At KHELORA, we believe that an athlete's focus should belong entirely to the arena. For years, club players endured WhatsApp group delays, manual Excel spreadsheets, scribbled paper receipts, and double-booked courts.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
              We engineered a digital backbone connecting every facet of club life: real-time 30-minute interval reservations, instantaneous member discounts at the gear pro shop, seamless open bar tabs at the veranda cafeteria, and professional coach performance tracking.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-300">
              <div>
                <p className="text-3xl font-serif font-bold text-forest-900">12+</p>
                <p className="text-xs text-gray-500 font-medium">Years of Club Traditions</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-forest-900">450+</p>
                <p className="text-xs text-gray-500 font-medium">Active Member Athletes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800"
              alt="Tennis court aerial"
              className="rounded-2xl object-cover h-72 w-full shadow-premium"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800';
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800"
              alt="Cricket nets training"
              className="rounded-2xl object-cover h-72 w-full shadow-premium mt-8"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800';
              }}
            />
          </div>
        </div>
      </section>

      {/* Facilities Breakdown */}
      <section className="bg-cream-200/60 py-20 border-y border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600 block mb-2">
              World-Class Facilities
            </span>
            <h2 className="text-3xl font-serif font-bold text-forest-950">
              Engineered To Tournament Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-forest-950 mb-2">Plexicushion Hard Courts</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Identical shock-absorption acrylic system used at major Grand Slam championships. True bounce, reduced joint strain, and professional court drainage.
              </p>
              <span className="text-[11px] font-semibold text-forest-800">ITF Category 4 Medium-Fast Pace</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-forest-950 mb-2">Authentic Red Clay</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Imported crushed brick layered on limestone base. Hand-watered and laser-swept twice daily for authentic slide and high spin response.
              </p>
              <span className="text-[11px] font-semibold text-forest-800">Roland Garros Specification</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-forest-950 mb-2">Automated Cricket Nets</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Full 22-yard pitches with automated programmable bowling machines, calibrated pace delivery, and professional high-density safety netting.
              </p>
              <span className="text-[11px] font-semibold text-forest-800">AstroTurf & Natural Turf Pitches</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-forest-950 mb-3">
          Experience The Club Firsthand
        </h2>
        <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8">
          Meet our coaches, test the surfaces, and discover how membership elevates your game.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/trial">
            <Button variant="gold" size="lg" className="font-bold">
              Book a Free Trial Session
            </Button>
          </Link>
          <Link to="/membership">
            <Button variant="outline" size="lg">
              View Membership Plans
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
export default About;
