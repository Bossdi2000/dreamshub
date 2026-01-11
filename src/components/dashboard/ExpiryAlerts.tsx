import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/context/InventoryContext';
import { differenceInDays, parseISO } from 'date-fns';

const getUrgencyColor = (days: number) => {
  if (days <= 0) return 'bg-danger text-white';
  if (days <= 3) return 'status-danger';
  if (days <= 7) return 'status-warning';
  return 'status-neutral';
};

const getUrgencyLabel = (days: number) => {
  if (days <= 0) return 'Expired';
  if (days <= 1) return 'Critical';
  if (days <= 3) return 'Urgent';
  if (days <= 7) return 'Soon';
  return 'Upcoming';
};

export const ExpiryAlerts = () => {
  const { products } = useInventory();

  const expiringItems = useMemo(() => {
    const now = new Date();
    return products
      .filter(p => p.expiryDate && p.stock > 0)
      .map(p => {
        const days = differenceInDays(parseISO(p.expiryDate!), now);
        return {
          ...p,
          daysLeft: days
        };
      })
      .filter(item => item.daysLeft >= 1 && item.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [products]);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-warning" />
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Expiring Soon</h3>
        <Badge variant="secondary" className="ml-auto font-bold">
          {expiringItems.length} Records
        </Badge>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {expiringItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50 group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 * index }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground truncate">{item.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getUrgencyColor(item.daysLeft)}`}>
                  {getUrgencyLabel(item.daysLeft)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-bold text-primary">{item.stock} Units</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={12} className={item.daysLeft <= 3 ? 'text-danger' : ''} />
                <span className={`text-xs font-black tracking-tighter ${item.daysLeft <= 3 ? 'text-danger' : ''}`}>
                  {item.daysLeft <= 0 ? 'Exp' : `${item.daysLeft}d`}
                </span>
              </div>
              <ChevronRight
                size={14}
                className="text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </motion.div>
        ))}

        {expiringItems.length === 0 && (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <AlertTriangle size={18} />
            </div>
            <p className="text-xs font-medium text-muted-foreground italic">No items expiring within 30 days.</p>
          </div>
        )}
      </div>

      <button className="w-full mt-4 py-2 text-xs text-primary font-bold hover:bg-primary/5 rounded-lg border border-primary/10 transition-all uppercase tracking-widest">
        Full Expiry Audit
      </button>
    </motion.div>
  );
};
