import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRightLeft, AlertTriangle, ShoppingCart, Truck, History } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const RecentActivity = () => {
  const { movements, products } = useInventory();

  const activities = useMemo(() => {
    return movements.slice(0, 7).map(m => {
      const isTransfer = m.movement_type === 'TRANSFER';
      const isOut = m.movement_type === 'OUT';
      const isIn = m.movement_type === 'IN';

      const Icon = isTransfer ? ArrowRightLeft : isOut ? ShoppingCart : isIn ? Package : Truck;
      const color = isTransfer ? 'text-primary' : isOut ? 'text-success' : isIn ? 'text-primary' : 'text-warning';
      const bgColor = isTransfer ? 'bg-primary/10' : isOut ? 'bg-success/10' : isIn ? 'bg-primary/10' : 'bg-warning/10';

      return {
        id: m.id,
        title: isTransfer ? 'Internal Transfer' : isOut ? 'Order Fulfilled' : isIn ? 'Inventory Inflow' : 'System log',
        description: `${m.product_name || 'System Object'} (${m.quantity > 0 ? '+' : ''}${m.quantity} units)`,
        time: formatDistanceToNow(parseISO(m.created_at), { addSuffix: true }),
        icon: Icon,
        color,
        bgColor
      };
    });
  }, [movements]);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Enterprise Activity</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Global Terminal Ledger</p>
        </div>
        <History size={16} className="text-primary/40" />
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/50 group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 * index }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${activity.bgColor}`}>
                <Icon size={18} className={activity.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate italic">{activity.description}</p>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap mt-1 group-hover:text-primary transition-colors">{activity.time}</span>
            </motion.div>
          );
        })}

        {activities.length === 0 && (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
              <History size={18} />
            </div>
            <p className="text-xs font-medium text-muted-foreground italic">No recent activities on the cloud.</p>
          </div>
        )}
      </div>

      <button className="w-full mt-4 py-2 text-xs text-primary font-bold hover:bg-primary/5 rounded-lg border border-primary/10 transition-all uppercase tracking-widest">
        Full Audit Trail
      </button>
    </motion.div>
  );
};
