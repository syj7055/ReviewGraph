import { motion } from "framer-motion";
import clsx from "clsx";

function FilterPills({ filters, selectedFilters, onToggleFilter }) {
  return (
    <div className="glass-card rounded-3xl p-4 soft-shadow sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Preference Setup</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">방문 목적 키워드</h2>
        </div>
        <p className="text-xs text-slate-500">일치 리뷰 우선 · 비일치 리뷰 후순위 노출</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((filter) => {
          const selected = selectedFilters.includes(filter);
          return (
            <motion.button
              key={filter}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              type="button"
              onClick={() => onToggleFilter(filter)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-250",
                selected
                  ? "border-orange-300 bg-orange-50 text-orange-900 shadow-soft"
                  : "border-white/70 bg-white/50 text-slate-600 hover:border-orange-200 hover:bg-white/90"
              )}
            >
              {filter}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterPills;
