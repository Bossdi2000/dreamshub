import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Download, FileText, Calendar, ChevronRight, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/context/InventoryContext';

const reportTemplates = [
    { title: 'Inventory Valuation', description: 'Total value of stock-on-hand by category and location.', category: 'Financial', icon: BarChart3 },
    { title: 'Stock Health Analysis', description: 'Identify low-stock, out-of-stock, and optimal inventory levels.', category: 'Inventory', icon: TrendingUp },
    { title: 'Expiry & Wastage', description: 'Track products approaching expiry and historical waste.', category: 'Audit', icon: AlertTriangle },
    { title: 'Category Performance', description: 'Stock value and quantity breakdown across categories.', category: 'Sales', icon: PieChart },
    { title: 'Movement History', description: 'Complete audit trail of all stock IN, OUT, and TRANSFER movements.', category: 'Audit', icon: FileText },
    { title: 'Stock Turnover', description: 'Calculate inventory turnover rates and identify slow-moving items.', category: 'Analytics', icon: BarChart3 },
];

const Reports = () => {
    const { products, movements, batches } = useInventory();

    // Calculate real metrics
    const metrics = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;

        // Calculate turnover approximation based on OUT movements in last 30 days
        const recentOuts = movements.filter(m => m.movement_type === 'OUT').length;
        const turnoverRate = recentOuts > 0 ? (recentOuts / products.length).toFixed(1) : '0.0';

        // Calculate shrinkage (products with 0 stock / total products)
        const shrinkageRate = products.length > 0
            ? ((outOfStockCount / products.length) * 100).toFixed(2)
            : '0.00';

        return {
            totalValue,
            turnoverRate,
            shrinkageRate,
            lowStockCount,
            outOfStockCount
        };
    }, [products, movements]);

    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time inventory insights, stock health reports, and data exports.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar size={18} />
                        Scheduler
                    </Button>
                    <Button className="gap-2">
                        <Download size={18} />
                        Bulk Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border-b-4 border-b-primary shadow-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Inventory Value</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold">₦{metrics.totalValue.toLocaleString()}</h3>
                        <span className="text-success text-xs font-bold mb-1">Live Data</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                        {products.length} products • {metrics.lowStockCount} low stock
                    </p>
                </div>

                <div className="glass-card p-6 border-b-4 border-b-warning shadow-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stock Health Score</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold">
                            {((1 - (metrics.outOfStockCount / products.length)) * 100).toFixed(0)}%
                        </h3>
                        <span className="text-warning text-xs font-bold mb-1">
                            {metrics.outOfStockCount} critical
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                        Based on in-stock vs out-of-stock ratio
                    </p>
                </div>

                <div className="glass-card p-6 border-b-4 border-b-success shadow-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Movement Activity</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold">{movements.length}</h3>
                        <span className="text-success text-xs font-bold mb-1">Total logs</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                        Complete audit trail available
                    </p>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Report Templates
                </h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] uppercase font-bold tracking-wider">All</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground">Financial</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground">Inventory</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((report, index) => (
                    <motion.div
                        key={report.title}
                        className="glass-card p-5 group cursor-pointer hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <report.icon size={20} />
                            </div>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-muted-foreground/30">
                                {report.category}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed h-8 overflow-hidden">
                            {report.description}
                        </p>
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground">LIVE DATA AVAILABLE</span>
                            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Insights */}
            <div className="mt-8 glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Package size={20} className="text-primary" />
                    Quick Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-xs text-muted-foreground mb-1">Low Stock Items</p>
                        <p className="text-2xl font-bold text-warning">{metrics.lowStockCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                        <p className="text-xs text-muted-foreground mb-1">Out of Stock</p>
                        <p className="text-2xl font-bold text-danger">{metrics.outOfStockCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Total Movements</p>
                        <p className="text-2xl font-bold text-primary">{movements.length}</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Reports;
