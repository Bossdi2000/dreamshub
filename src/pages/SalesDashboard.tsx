import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    Package,
    ShoppingCart,
    Clock,
    Plus,
    History,
    ArrowUpRight,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { MetricCard } from '@/components/dashboard/MetricCard';

const SalesDashboard = () => {
    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your daily performance and manage stock levels.
                    </p>
                </div>
                <div className="flex gap-3">
                    <ProductFormDialog mode="add">
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <Plus size={18} />
                            Add Stock
                        </Button>
                    </ProductFormDialog>
                </div>
            </div>

            {/* Sales Metrics - Focusing only on Revenue, no Profit/Gain as per request */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Daily Revenue"
                    value="₦1,240.00"
                    change={12.5}
                    changeLabel="vs yesterday"
                    icon={DollarSign}
                    accentColor="primary"
                    delay={0}
                />
                <MetricCard
                    title="Weekly Revenue"
                    value="₦8,450.25"
                    change={5.2}
                    changeLabel="vs last week"
                    icon={TrendingUp}
                    accentColor="success"
                    delay={0.05}
                />
                <MetricCard
                    title="Monthly Revenue"
                    value="₦32,100.00"
                    change={18.7}
                    changeLabel="vs last month"
                    icon={Plus}
                    accentColor="primary"
                    delay={0.1}
                />
                <MetricCard
                    title="Yearly Revenue"
                    value="₦384,500.00"
                    icon={ArrowUpRight}
                    accentColor="success"
                    delay={0.15}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions History */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <History size={20} className="text-primary" />
                            My Transaction History
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs">View Full History</Button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'ORD-8821', items: 'iPhone 15 Pro, Case', total: 1045, time: '10:15 AM', status: 'Completed' },
                            { id: 'ORD-8820', items: 'Organic Milk 1L x4', total: 24, time: '09:45 AM', status: 'Completed' },
                            { id: 'ORD-8819', items: 'Nike Air Max 90', total: 160, time: '09:12 AM', status: 'Refunded' },
                            { id: 'ORD-8818', items: 'Dior Sauvage 100ml', total: 115, time: '08:50 AM', status: 'Completed' },
                        ].map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{tx.id}</p>
                                        <p className="text-xs text-muted-foreground">{tx.items}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">₦{tx.total.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{tx.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sales Staff Profile Summary */}
                <div className="glass-card p-6 space-y-6">
                    <h3 className="font-bold flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        My Performance
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Customer Satisfaction</p>
                            <p className="text-2xl font-black text-primary">98.4%</p>
                        </div>

                        <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Items Scanned Today</p>
                            <p className="text-2xl font-black text-success">142</p>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">Scan Assist is Active</p>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SalesDashboard;
