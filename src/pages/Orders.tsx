import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter, Plus, Eye, Download, MoreVertical, CreditCard, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewOrderDialog } from '@/components/orders/NewOrderDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventory } from '@/context/InventoryContext';
import { formatDistanceToNow, parseISO, isToday } from 'date-fns';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'status-success';
        case 'Pending': return 'status-warning';
        case 'Processing': return 'text-primary bg-primary/10 border-primary/20';
        case 'Cancelled': return 'status-danger';
        default: return 'status-neutral';
    }
};

const Orders = () => {
    const { movements, products } = useInventory();
    const [searchQuery, setSearchQuery] = useState('');

    // Derive orders from OUT movements
    const orders = useMemo(() => {
        const outMovements = movements.filter(m => m.movement_type === 'OUT');

        // Group by order ID (extracted from reason)
        const orderMap = new Map<string, any>();

        outMovements.forEach(m => {
            const orderIdMatch = m.reason?.match(/ORD-\d+/);
            const orderId = orderIdMatch ? orderIdMatch[0] : `ORD-${m.id.slice(0, 8)}`;

            if (!orderMap.has(orderId)) {
                orderMap.set(orderId, {
                    id: orderId,
                    customer: 'Walk-in Customer',
                    items: [],
                    total: 0,
                    status: 'Completed',
                    type: 'POS-Main',
                    time: m.created_at,
                    movements: []
                });
            }

            const order = orderMap.get(orderId)!;
            const product = products.find(p => p.id === m.product_id);
            const itemValue = Math.abs(m.quantity) * (product?.price || 0);

            order.items.push({
                name: m.product_name || product?.name,
                qty: Math.abs(m.quantity),
                price: product?.price || 0
            });
            order.total += itemValue;
            order.movements.push(m);
        });

        return Array.from(orderMap.values())
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }, [movements, products]);

    // Calculate metrics
    const metrics = useMemo(() => {
        const todayOrders = orders.filter(o => isToday(parseISO(o.time)));
        const todaySales = todayOrders.reduce((acc, o) => acc + o.total, 0);
        const totalSales = orders.reduce((acc, o) => acc + o.total, 0);

        return {
            todayOrderCount: todayOrders.length,
            todaySalesVolume: todaySales,
            avgFulfillment: '< 1 min'
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        return orders.filter(o =>
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Orders & Fulfillment</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage sales, POS transactions, and e-commerce fulfillment with stock synchronization.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        Export Orders
                    </Button>
                    <NewOrderDialog>
                        <Button className="gap-2">
                            <Plus size={18} />
                            New Order
                        </Button>
                    </NewOrderDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Today Orders', value: metrics.todayOrderCount.toString(), subValue: 'Real-time transactions', icon: ShoppingCart },
                    { label: 'Sales Volume', value: `₦${metrics.todaySalesVolume.toLocaleString()}`, subValue: 'Today\'s revenue', icon: CreditCard },
                    { label: 'Avg Fulfillment', value: metrics.avgFulfillment, subValue: 'Enterprise standard: 30m', icon: Clock },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                                <p className="text-xs text-success mt-2 font-medium">{stat.subValue}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <motion.div
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            className="pl-9 bg-muted/50 border-transparent h-9"
                            placeholder="Search orders, customers, or status..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="gap-2 h-9">
                            <Filter size={14} /> Filter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Type</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Time</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td className="font-mono text-xs font-bold">{order.id}</td>
                                    <td className="font-medium">{order.customer}</td>
                                    <td>
                                        <Badge variant="outline" className="text-[10px] font-bold border-muted-foreground/30">
                                            {order.type}
                                        </Badge>
                                    </td>
                                    <td>{order.items.length} Items</td>
                                    <td className="font-bold">₦{order.total.toLocaleString()}</td>
                                    <td>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(parseISO(order.time), { addSuffix: true })}
                                    </td>
                                    <td>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2"><Eye size={14} /> View Details</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2"><Download size={14} /> Invoice</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-danger">Refund / Return</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="text-muted-foreground/30" size={40} />
                                            <p className="text-sm font-bold text-foreground">No orders found</p>
                                            <p className="text-xs text-muted-foreground italic">Create a new order to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {filteredOrders.length} of {orders.length} transactions</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Previous</Button>
                        <Button variant="ghost" size="sm" className="text-primary">Next</Button>
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
};

export default Orders;

