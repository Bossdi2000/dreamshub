import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Smartphone, Sparkles, Shirt, Droplet, Box, Layers } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

const ICON_MAP: Record<string, any> = {
  'food': Utensils,
  'electronics': Smartphone,
  'perfumes': Sparkles,
  'fashion': Shirt,
  'cosmetics': Droplet,
};

const COLOR_MAP: Record<string, string> = {
  'food': 'text-success',
  'electronics': 'text-primary',
  'perfumes': 'text-purple-500',
  'fashion': 'text-pink-500',
  'cosmetics': 'text-orange-500',
};

const BG_COLOR_MAP: Record<string, string> = {
  'food': 'bg-success/10',
  'electronics': 'bg-primary/10',
  'perfumes': 'bg-purple-500/10',
  'fashion': 'bg-pink-500/10',
  'cosmetics': 'bg-orange-500/10',
};

const BAR_COLOR_MAP: Record<string, string> = {
  'food': 'bg-success',
  'electronics': 'bg-primary',
  'perfumes': 'bg-purple-500',
  'fashion': 'bg-pink-500',
  'cosmetics': 'bg-orange-500',
};

export const CategoryBreakdown = () => {
  const { products, categories: inventoryCategories } = useInventory();

  const data = useMemo(() => {
    const breakdown = inventoryCategories.map(cat => {
      const catProducts = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase());
      const count = catProducts.reduce((acc, p) => acc + p.stock, 0);
      const value = catProducts.reduce((acc, p) => acc + (p.stock * p.price), 0);
      const key = cat.name.toLowerCase();

      return {
        name: cat.name,
        icon: ICON_MAP[key] || Box,
        count,
        value: `₦${(value / 1000).toFixed(1)}k`,
        color: COLOR_MAP[key] || 'text-muted-foreground',
        bgColor: BG_COLOR_MAP[key] || 'bg-muted/10',
        barColor: BAR_COLOR_MAP[key] || 'bg-muted-foreground',
        rawValue: value
      };
    }).sort((a, b) => b.rawValue - a.rawValue);

    return breakdown;
  }, [products, inventoryCategories]);

  const totalCount = data.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Enterprise Segments</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Asset Allocation</p>
        </div>
        <Layers size={16} className="text-primary/40" />
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const Icon = item.icon;
          const percentage = (item.count / totalCount) * 100;

          return (
            <motion.div
              key={item.name}
              className="group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 * index }}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bgColor} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon size={14} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground truncate">{item.name}</span>
                    <span className="text-sm font-black text-foreground tabular-nums">{item.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>{item.count.toLocaleString()} Stocks</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="h-1 bg-muted/30 rounded-full overflow-hidden ml-11">
                <motion.div
                  className={`h-full rounded-full ${item.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 * index }}
                  style={{ boxShadow: `0 0 8px ${item.barColor}50` }}
                />
              </div>
            </motion.div>
          );
        })}

        {data.length === 0 && (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <Box className="text-muted-foreground/20" size={32} />
            <p className="text-xs font-medium text-muted-foreground italic">No category data available.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
