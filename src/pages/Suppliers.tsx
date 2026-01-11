import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Phone, Mail, AlertTriangle, MoreVertical, PackageCheck, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventory } from '@/context/InventoryContext';

const Suppliers = () => {
    const { products, categories } = useInventory();
    const [searchQuery, setSearchQuery] = useState('');

    // Group products by supplier (using category as a proxy for supplier)
    const supplierData = useMemo(() => {
        const supplierMap = new Map();

        categories.forEach(cat => {
            const catProducts = products.filter(p => p.category === cat.name);
            const totalProducts = catProducts.length;
            const lowStockProducts = catProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
            const outOfStockProducts = catProducts.filter(p => p.stock === 0).length;
            const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
            const totalValue = catProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);

            // Calculate stock health percentage
            const healthyProducts = catProducts.filter(p => p.stock > 10).length;
            const stockHealth = totalProducts > 0 ? (healthyProducts / totalProducts) * 100 : 100;

            supplierMap.set(cat.name, {
                name: `${cat.name} Suppliers Ltd`,
                category: cat.name,
                icon: cat.icon,
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                stockHealth: Math.round(stockHealth),
                totalStock,
                totalValue,
                status: outOfStockProducts > 0 ? 'Critical' : lowStockProducts > 2 ? 'Action Needed' : 'Active',
                email: `orders@${cat.name.toLowerCase().replace(/\s+/g, '')}.com`,
                phone: '+234 ' + Math.floor(Math.random() * 900000000 + 100000000)
            });
        });

        return Array.from(supplierMap.values());
    }, [products, categories]);

    // Calculate overall metrics
    const metrics = useMemo(() => {
        const activeSuppliers = supplierData.filter(s => s.status !== 'Critical').length;
        const totalLowStock = supplierData.reduce((sum, s) => sum + s.lowStockProducts, 0);
        const totalOutOfStock = supplierData.reduce((sum, s) => sum + s.outOfStockProducts, 0);
        const avgStockHealth = supplierData.length > 0
            ? Math.round(supplierData.reduce((sum, s) => sum + s.stockHealth, 0) / supplierData.length)
            : 0;

        return {
            activeSuppliers,
            totalLowStock,
            totalOutOfStock,
            avgStockHealth
        };
    }, [supplierData]);

    const filteredSuppliers = useMemo(() => {
        if (!searchQuery.trim()) return supplierData;
        return supplierData.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [supplierData, searchQuery]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'status-success';
            case 'Action Needed': return 'status-warning';
            case 'Critical': return 'status-danger';
            default: return 'status-neutral';
        }
    };

    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Supplier & Stock Health</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor supplier performance based on real-time stock levels and reorder requirements.
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} />
                    Add Supplier
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Suppliers</p>
                            <p className="text-xl font-bold">{metrics.activeSuppliers}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Low Stock Items</p>
                            <p className="text-xl font-bold">{metrics.totalLowStock}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Out of Stock</p>
                            <p className="text-xl font-bold">{metrics.totalOutOfStock}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                            <PackageCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg Stock Health</p>
                            <p className="text-xl font-bold">{metrics.avgStockHealth}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            className="pl-9 bg-muted/30 border-transparent h-9"
                            placeholder="Search suppliers by name or category..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>Supplier</th>
                                <th>Category</th>
                                <th>Products</th>
                                <th>Stock Health</th>
                                <th>Low Stock</th>
                                <th>Out of Stock</th>
                                <th>Inventory Value</th>
                                <th>Status</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((supplier, index) => (
                                <motion.tr
                                    key={supplier.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td className="font-bold">{supplier.name}</td>
                                    <td>
                                        <Badge variant="secondary" className="gap-1">
                                            <span>{supplier.icon}</span>
                                            {supplier.category}
                                        </Badge>
                                    </td>
                                    <td className="text-center font-medium">{supplier.totalProducts}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${supplier.stockHealth >= 70 ? 'bg-success' : supplier.stockHealth >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                                    style={{ width: `${supplier.stockHealth}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold">{supplier.stockHealth}%</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {supplier.lowStockProducts > 0 ? (
                                            <Badge variant="outline" className="border-warning/50 text-warning gap-1">
                                                <AlertTriangle size={12} />
                                                {supplier.lowStockProducts}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {supplier.outOfStockProducts > 0 ? (
                                            <Badge variant="outline" className="border-danger/50 text-danger gap-1">
                                                <AlertCircle size={12} />
                                                {supplier.outOfStockProducts}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="font-bold">₦{supplier.totalValue.toLocaleString()}</td>
                                    <td>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(supplier.status)}`}>
                                            {supplier.status}
                                        </span>
                                    </td>
                                    <td>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2">
                                                    <Mail size={14} /> Email Supplier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Phone size={14} /> Call: {supplier.phone}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <PackageCheck size={14} /> View Products
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-primary">
                                                    <Plus size={14} /> Create Purchase Order
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSuppliers.length === 0 && (
                    <div className="py-12 text-center">
                        <Truck className="mx-auto text-muted-foreground/30 mb-2" size={40} />
                        <p className="text-sm font-bold text-foreground">No suppliers found</p>
                        <p className="text-xs text-muted-foreground italic">Try adjusting your search</p>
                    </div>
                )}

                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {filteredSuppliers.length} of {supplierData.length} suppliers</span>
                    <span className="text-xs">Stock data updated in real-time</span>
                </div>
            </div>
        </MainLayout>
    );
};

export default Suppliers;
