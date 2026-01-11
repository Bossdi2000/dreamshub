import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/context/InventoryContext';

export const LowStockTable = () => {
  const { products } = useInventory();

  const lowStockItems = useMemo(() => {
    return products
      .filter(p => p.stock > 0 && p.stock <= 10)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-danger" />
          <h3 className="text-lg font-bold text-foreground tracking-tight">Enterprise Low Stock Audit</h3>
        </div>
        <Badge variant="destructive" className="font-bold">
          {lowStockItems.length} Urgent Items
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Health</th>
              <th>Unit Price</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item, index) => {
              const stockPercentage = (item.stock / 10) * 100;
              const isCritical = item.stock <= 3;

              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px]">
                        {item.image && item.image.length > 2 ? <img src={item.image} className="w-full h-full object-contain" /> : item.image}
                      </div>
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground font-mono text-xs">{item.sku}</td>
                  <td>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{item.category}</Badge>
                  </td>
                  <td>
                    <span className={`font-black tabular-nums ${isCritical ? 'text-danger' : 'text-warning'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td>
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCritical ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-muted-foreground font-bold tabular-nums">₦{item.price.toLocaleString()}</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-primary font-bold hover:bg-primary/5 gap-1">
                      <ShoppingCart size={12} />
                      Refill
                    </Button>
                  </td>
                </motion.tr>
              );
            })}

            {lowStockItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-sm font-bold text-foreground">Perfect Stock Health</p>
                    <p className="text-xs text-muted-foreground italic">All inventory levels are above enterprise thresholds.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
