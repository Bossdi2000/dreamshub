import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useInventory } from '@/context/InventoryContext';

export const StockStatusChart = () => {
  const { products } = useInventory();

  const data = useMemo(() => {
    const inStock = products.filter(p => p.stock > 10).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    return [
      { name: 'Healthy Stock', value: inStock, color: 'hsl(var(--success))' },
      { name: 'Critical/Low', value: lowStock, color: 'hsl(var(--warning))' },
      { name: 'Depleted', value: outOfStock, color: 'hsl(var(--destructive))' },
    ];
  }, [products]);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight">Enterprise Stock Status</h3>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Inventory Health Distribution</p>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(var(--card), 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-border/50">
            <div
              className="w-2.5 h-2.5 rounded-full shadow-lg"
              style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }}
            />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.name}</span>
            <span className="text-sm font-black ml-auto tabular-nums">{item.value} <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">SKUs</span></span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
