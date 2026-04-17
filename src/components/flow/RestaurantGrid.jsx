import { motion } from "framer-motion";
import clsx from "clsx";
import { MapPin, Utensils } from "lucide-react";

function RestaurantGrid({ restaurants, selectedRestaurantId, selectedFilters, onSelectRestaurant, reviewCountMap }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Restaurant List</p>
          <h2 className="text-2xl font-semibold text-slate-900">식당 선택</h2>
        </div>
        <p className="text-sm text-slate-500">
          필터 {selectedFilters.length}개 적용
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => {
          const isSelected = restaurant.id === selectedRestaurantId;
          const visibleReviews = reviewCountMap[restaurant.id] || 0;
          return (
            <motion.button
              key={restaurant.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectRestaurant(restaurant.id)}
              className={clsx(
                "glass-card rounded-3xl p-4 text-left transition-colors",
                isSelected ? "border-orange-300 ring-2 ring-orange-200" : "hover:border-orange-200"
              )}
            >
              <p className="mb-2 inline-flex rounded-full bg-slate-100/80 px-2 py-1 text-xs font-semibold text-slate-600">
                {restaurant.category}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                <MapPin size={13} />
                {restaurant.district}
              </p>
              <p className="mt-1 text-sm text-slate-500">평균 {restaurant.rating.toFixed(1)} · {restaurant.priceBand}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {restaurant.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/70 px-2 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Utensils size={12} />
                  대표메뉴 {restaurant.signature}
                </span>
                <span>리뷰 {visibleReviews}개</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export default RestaurantGrid;
