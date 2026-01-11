import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInventory } from '@/context/InventoryContext';
import { subDays, format, startOfToday, isSameDay } from 'date-fns';

export const SalesChart = () => {
  const { movements, products } = useInventory();

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => subDays(startOfToday(), 6 - i));

    return days.map(day => {
      const dayMovements = movements.filter(m => isSameDay(new Date(m.created_at), day));

      const salesValue = Math.abs(dayMovements
        .filter(m => m.movement_type === 'OUT')
        .reduce((acc, m) => {
          const prod = products.find(p => p.id === m.product_id);
          return acc + (m.quantity * (prod?.price || 0));
        }, 0));

      const inventoryCount = dayMovements
        .filter(m => m.movement_type === 'IN')
        .reduce((acc, m) => acc + m.quantity, 0);

      return {
        name: format(day, 'EEE'),
        sales: salesValue,
        inventory: inventoryCount * 100 // Scale inventory for visibility if needed, or just show raw
      };
    });
  }, [movements, products]);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Weekly Enterprise Overview</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Live Flow Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sales (₦)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Inflow (Units)</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInventory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `₦${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(var(--card), 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value: number, name: string) => [
                name === 'sales' ? `₦${value.toLocaleString()}` : `${value / 100} Units`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorSales)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="inventory"
              stroke="hsl(var(--success))"
              strokeWidth={3}
              fill="url(#colorInventory)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
