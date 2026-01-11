import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  accentColor?: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  accentColor = 'primary',
  delay = 0,
}: MetricCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const accentStyles = {
    primary: 'from-primary to-primary/50',
    success: 'from-success to-success/50',
    warning: 'from-warning to-warning/50',
    danger: 'from-danger to-danger/50',
  };

  const bgStyles = {
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    danger: 'bg-danger/10',
  };

  const textStyles = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <motion.div
      className="glass-card p-4 md:p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {/* Accent Bar */}
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accentStyles[accentColor]}`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 md:space-y-2 min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-foreground truncate">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPositive && <TrendingUp size={12} className="text-success" />}
              {isNegative && <TrendingDown size={12} className="text-danger" />}
              <span
                className={`text-xs md:text-sm font-medium ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-muted-foreground'
                  }`}
              >
                {isPositive && '+'}{change}%
              </span>
              {changeLabel && (
                <span className="text-[10px] md:text-xs text-muted-foreground opacity-70 truncate">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgStyles[accentColor]}`}>
          <Icon size={20} className={`${textStyles[accentColor]}`} />
        </div>
      </div>
    </motion.div>
  );
};
