import React from 'react';
import { 
  LayoutGrid, 
  Headphones, 
  Shirt, 
  Armchair, 
  Compass, 
  Coffee,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Check
} from 'lucide-react';
import { Category, SubCategory } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  selectedSubcategory: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  sortBy: string;
  onSortChange: (sort: any) => void;
  totalProductsCount: number;
  onToggleMobileFilter: () => void;
}

const getCategoryIcon = (iconName: string, active: boolean) => {
  const iconClass = `w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`;
  switch (iconName) {
    case 'Headphones':
      return <Headphones className={iconClass} />;
    case 'Shirt':
      return <Shirt className={iconClass} />;
    case 'Armchair':
      return <Armchair className={iconClass} />;
    case 'Compass':
      return <Compass className={iconClass} />;
    case 'Coffee':
      return <Coffee className={iconClass} />;
    default:
      return <LayoutGrid className={iconClass} />;
  }
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  sortBy,
  onSortChange,
  totalProductsCount,
  onToggleMobileFilter,
}) => {
  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0] || null;
  const subcategories = currentCategory?.subcategories || [];

  return (
    <div className="bg-[#0d0d11] border-b border-white/5 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Category Carousel / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory('all');
                }}
                className={`group flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                  {getCategoryIcon(cat.icon, isSelected)}
                </div>
                <span>{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                }`}>
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories & Filter Bar */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {subcategories.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] shrink-0 mr-1">
                Subcategory:
              </span>
            )}
            {subcategories.map((sub) => {
              const isSubSelected = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  id={`subcat-pill-${sub.id}`}
                  onClick={() => onSelectSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isSubSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-[#161b22] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {sub.name}
                  <span className="ml-1.5 opacity-60">({sub.itemCount})</span>
                </button>
              );
            })}
          </div>

          {/* Right Tools: Result Count & Sorting */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              id="mobile-filter-drawer-btn"
              onClick={onToggleMobileFilter}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Showing <strong className="text-white font-bold">{totalProductsCount}</strong> curated items
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="products-sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort products by"
                className="bg-[#161b22] border border-white/10 text-slate-300 rounded-lg text-xs font-medium py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
              >
                <option value="popular">Featured & Bestsellers</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
