import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Clock, Award, ChevronRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest-950 text-cream-200 border-t border-forest-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-forest-900">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#193847] border border-[#C3FF01]/40 p-1.5 flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif font-black text-2xl tracking-wider text-white block leading-none">
                  KHELORA
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              A private championship sanctuary for tennis enthusiasts and cricket players. Featuring professional tournament Plexicushion and red clay courts, RoboArm cricket nets, pro shop, and culinary sports bar.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Established 2012 • ITF & BCCI Certified Facilities
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-cream-50 font-semibold text-base mb-4 tracking-wide">Club Facilities</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courts" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500" /> Court Availability & Booking
                </Link>
              </li>
              <li>
                <Link to="/membership" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500" /> Membership Tiers (Gold, Silver, Junior)
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500" /> Sports Gear & Apparel Shop
                </Link>
              </li>
              <li>
                <Link to="/bar" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500" /> Cafeteria & Post-Match Bar
                </Link>
              </li>
              <li>
                <Link to="/trial" className="text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500" /> Book Free 45-Min Trial Session
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Schedule */}
          <div>
            <h4 className="font-serif text-cream-50 font-semibold text-base mb-4 tracking-wide">Club Hours</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-cream-100 font-medium">Tennis & Cricket Courts</p>
                  <p className="text-xs">Mon – Sun: 06:00 AM – 10:00 PM</p>
                  <p className="text-[11px] text-gold-400/80">Floodlight play available till 10 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-cream-100 font-medium">Cafeteria & Lounge</p>
                  <p className="text-xs">Mon – Sun: 06:30 AM – 10:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-cream-100 font-medium">Sports Pro Shop</p>
                  <p className="text-xs">Mon – Sun: 07:00 AM – 09:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-cream-50 font-semibold text-base mb-4 tracking-wide">Contact Front Desk</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <span>Estate 14, Royal Greens Blvd, Sector 62, Gurgaon, Haryana 122002</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 (0124) 488-9000 / 9001</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>concierge@khelora.com</span>
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/trial"
                className="block text-center px-4 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold text-sm transition-all shadow-md"
              >
                Inquire for Membership
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} KHELORA. All Rights Reserved. Built for sports excellence.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-cream-100">About Club</Link>
            <Link to="/courts" className="hover:text-cream-100">Court Rules</Link>
            <Link to="/login" className="text-gold-400 hover:text-gold-300">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
