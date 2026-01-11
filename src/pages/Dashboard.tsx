import React, { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { StockStatusChart } from '@/components/dashboard/StockStatusChart';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { ExpiryAlerts } from '@/components/dashboard/ExpiryAlerts';
import { LowStockTable } from '@/components/dashboard/LowStockTable';
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, Users, Eye, EyeOff, Lock } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { products, movements, loading } = useInventory();

  const [isAmountVisible, setIsAmountVisible] = useState(false);

  const metrics = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + (p.selling_price * p.stock), 0);
    const totalInventoryCost = products.reduce((acc, p) => acc + (p.buying_price * p.stock), 0);
    const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = movements.filter(m =>
      m.movement_type === 'OUT' &&
      new Date(m.created_at).getTime() >= today
    );

    let revenueToday = 0;
    let costOfGoodsSoldToday = 0;

    todaySales.forEach(m => {
      const product = products.find(p => p.id === m.product_id);
      if (product) {
        const qty = Math.abs(m.quantity);
        revenueToday += qty * product.selling_price;
        costOfGoodsSoldToday += qty * product.buying_price;
      }
    });

    const profitToday = revenueToday - costOfGoodsSoldToday;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;

    return {
      totalValue,
      totalInventoryCost,
      totalItems,
      ordersToday: todaySales.length,
      revenueToday,
      costOfGoodsSoldToday,
      profitToday,
      lowStockCount
    };
  }, [products, movements]);

  const handleToggleVisibility = () => {
    if (isAmountVisible) {
      setIsAmountVisible(false);
    } else {
      const code = prompt("Enter Secret Code to Reveal Financials:");
      if (code === "DREAM01") {
        setIsAmountVisible(true);
        toast.success("Financial data unlocked");
      } else {
        toast.error("Invalid Secret Code");
      }
    }
  };

  const formatAmount = (amount: number) => {
    if (!isAmountVisible) return "****";
    return `₦${(amount / 1000).toFixed(1)}k`;
  };

  if (loading) return <MainLayout><div>Synchronizing with Cloud...</div></MainLayout>;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Dreams Hub Main Hub</h1>
          <p className="text-muted-foreground mt-1">
            Precision control for your enterprise.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleToggleVisibility}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          {isAmountVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          {isAmountVisible ? "Hide Figures" : "Show Figures"}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Stock Asset Value"
          value={formatAmount(metrics.totalValue)}
          change={12.5}
          changeLabel="Total Valuation"
          icon={DollarSign}
          accentColor="primary"
          delay={0}
        />
        <MetricCard
          title="Profit Gain (Today)"
          value={formatAmount(metrics.profitToday)}
          change={metrics.revenueToday > 0 ? (metrics.profitToday / metrics.revenueToday) * 100 : 0}
          changeLabel="Net Profit margin"
          icon={TrendingUp}
          accentColor="success"
          delay={0.05}
        />
        <MetricCard
          title="Bought Price (Today)"
          value={formatAmount(metrics.costOfGoodsSoldToday)}
          change={8.2}
          changeLabel="Cost of Sales"
          icon={Package}
          accentColor="warning"
          delay={0.1}
        />
        <MetricCard
          title="Sales Recorded Today"
          value={metrics.ordersToday.toString()}
          change={23.1}
          changeLabel="Real-time Count"
          icon={ShoppingCart}
          accentColor="primary"
          delay={0.15}
        />
        <MetricCard
          title="Revenue Recorded (Today)"
          value={formatAmount(metrics.revenueToday)}
          change={18.7}
          changeLabel="Total Sales"
          icon={DollarSign}
          accentColor="primary"
          delay={0.2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <StockStatusChart />
      </div>

      {/* Activity and Categories Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <RecentActivity />
        <CategoryBreakdown />
        <ExpiryAlerts />
      </div>

      {/* Low Stock Table */}
      <LowStockTable />
    </MainLayout>
  );
};

export default Dashboard;
