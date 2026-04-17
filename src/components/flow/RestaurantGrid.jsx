import { motion } from "framer-motion";
import clsx from "clsx";
import { MapPin, UtensilsCrossed } from "lucide-react";

function RestaurantGrid({ places, selectedPlaceId, selectedPreferences, onSelectPlace, reviewCountMap }) {
  return (
    <section className="glass-card rounded-3xl p-4 soft-shadow sm:p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Place Selector</p>
          <h2 className="text-lg font-semibold text-slate-900">Place 선택</h2>
        </div>
        <p className="text-xs text-slate-500">선호 {selectedPreferences.length}개</p>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto pr-1 lg:max-h-[56vh]">
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          const visibleReviews = reviewCountMap[place.id] || { ranked: 0, total: 0 };
          return (
            <motion.button
              key={place.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectPlace(place.id)}
              className={clsx(
                "glass-panel w-full rounded-2xl p-3 text-left transition-all duration-250",
                isSelected
                  ? "border-orange-300 ring-2 ring-orange-200 shadow-soft"
                  : "hover:border-orange-200 hover:bg-white/95"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="inline-flex rounded-full bg-slate-100/90 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  {place.category}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">{visibleReviews.ranked}/{visibleReviews.total} 리뷰</p>
              </div>

              <h3 className="text-base font-semibold tracking-tight text-slate-900">{place.name}</h3>

              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                <MapPin size={13} />
                {place.district}
              </p>

              <p className="mt-1 text-xs text-slate-500">평균 {place.rating.toFixed(1)} · {place.priceBand}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {place.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <UtensilsCrossed size={12} />
                  {place.signature}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export default RestaurantGrid;
