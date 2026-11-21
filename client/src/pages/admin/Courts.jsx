import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { formatCurrency } from '../../utils/formatters';
import { Grid, Clock, Sparkles, MapPin, CheckCircle2, Award } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const CourtsAdmin = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getCourts()
      .then(setCourts)
      .catch(() => setCourts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Court & Facility Specifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">Physical ground maintenance, surface pacing, and lighting configurations</p>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading court facility details..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-white p-6 rounded-3xl border border-cream-300 shadow-premium flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-900 text-cream-50">
                    {court.sport}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    {court.status}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-forest-950 mb-1">{court.name}</h3>
                <p className="text-xs text-gold-700 font-semibold mb-3">{court.surface}</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{court.description}</p>
              </div>

              <div className="pt-4 border-t border-cream-200 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Lighting Specification:</span>
                  <span className="font-semibold text-gray-900">{court.lighting}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-semibold text-gray-900">{court.type}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-forest-950 pt-2 border-t border-cream-200">
                  <span>Standard Hourly Rate:</span>
                  <span>{formatCurrency(court.hourlyRate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CourtsAdmin;
