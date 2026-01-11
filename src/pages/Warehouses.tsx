import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Warehouse as WarehouseIcon,
    Plus,
    MapPin,
    Package,
    ArrowRightLeft,
    MoreHorizontal,
    Store,
    Box,
    Clock,
    TrendingUp,
    ArrowLeft,
    Trash2,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventory, Warehouse } from '@/context/InventoryContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const Warehouses = () => {
    const { warehouses, movements, products, addWarehouse, updateWarehouse, deleteWarehouse, transferStock, loading, refreshInventory } = useInventory();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog states for warehouse management
    const [isAddStockOpen, setIsAddStockOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // Form states
    const [newWh, setNewWh] = useState<Omit<Warehouse, 'id'>>({
        name: '',
        type: 'Warehouse',
        is_active: true
    });

    const [stockForm, setStockForm] = useState({
        productId: '',
        quantity: 0,
        reason: 'Manual warehouse entry'
    });

    const [transferForm, setTransferForm] = useState({
        productId: '',
        toWarehouseId: '',
        quantity: 0,
        reason: 'Internal logistics transfer'
    });

    const warehouseStats = useMemo(() => {
        return warehouses.map(wh => {
            const itemsStored = movements.reduce((acc, m) => {
                if (m.to_location_id === wh.id) return acc + m.quantity;
                if (m.from_location_id === wh.id) return acc - m.quantity;
                return acc;
            }, 0);

            const recentMovements = movements
                .filter(m => m.from_location_id === wh.id || m.to_location_id === wh.id)
                .slice(0, 3);

            return {
                ...wh,
                itemsStored,
                recentMovements
            };
        });
    }, [warehouses, movements]);

    const selectedWhInventory = useMemo(() => {
        if (!selectedWarehouse) return [];

        const inventoryMap: Record<string, { product: any, stock: number }> = {};

        movements.forEach(m => {
            if (m.to_location_id === selectedWarehouse.id) {
                if (!inventoryMap[m.product_id]) {
                    const product = products.find(p => p.id === m.product_id);
                    if (product) inventoryMap[m.product_id] = { product, stock: 0 };
                }
                if (inventoryMap[m.product_id]) inventoryMap[m.product_id].stock += m.quantity;
            }
            if (m.from_location_id === selectedWarehouse.id) {
                if (!inventoryMap[m.product_id]) {
                    const product = products.find(p => p.id === m.product_id);
                    if (product) inventoryMap[m.product_id] = { product, stock: 0 };
                }
                if (inventoryMap[m.product_id]) inventoryMap[m.product_id].stock -= m.quantity;
            }
        });

        return Object.values(inventoryMap)
            .filter(item => item.stock > 0)
            .filter(item =>
                item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [selectedWarehouse, movements, products, searchTerm]);

    const handleAddWarehouse = async () => {
        await addWarehouse(newWh);
        setIsAddOpen(false);
        setNewWh({ name: '', type: 'Warehouse', is_active: true });
    };

    const handleAddStock = async () => {
        if (!selectedWarehouse || !stockForm.productId || stockForm.quantity <= 0) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { error } = await (supabase as any).from('inventory_movements').insert({
                product_id: stockForm.productId,
                to_location_id: selectedWarehouse.id,
                quantity: stockForm.quantity,
                movement_type: 'IN',
                reason: stockForm.reason
            });

            if (error) throw error;
            toast.success(`Successfully added ${stockForm.quantity} units`);
            setIsAddStockOpen(false);
            setStockForm({ productId: '', quantity: 0, reason: 'Manual warehouse entry' });
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleTransfer = async () => {
        if (!selectedWarehouse || !transferForm.productId || !transferForm.toWarehouseId || transferForm.quantity <= 0) {
            toast.error("Invalid transfer details");
            return;
        }

        // Check if source has enough stock
        const sourceItem = selectedWhInventory.find(i => i.product.id === transferForm.productId);
        if (!sourceItem || sourceItem.stock < transferForm.quantity) {
            toast.error("Insufficient stock in source warehouse");
            return;
        }

        await transferStock(
            transferForm.productId,
            selectedWarehouse.id,
            transferForm.toWarehouseId,
            transferForm.quantity,
            transferForm.reason
        );

        setIsTransferOpen(false);
        setTransferForm({ productId: '', toWarehouseId: '', quantity: 0, reason: 'Internal logistics transfer' });
    };

    const handleDecommission = async (id: string) => {
        if (confirm('Are you sure you want to decommission this logistics hub? This action cannot be undone.')) {
            await deleteWarehouse(id);
        }
    };

    if (loading && !selectedWarehouse) return <MainLayout><div className="flex items-center justify-center min-h-[60vh] font-bold text-primary animate-pulse italic uppercase tracking-widest text-sm">Synchronizing Cloud Warehouses...</div></MainLayout>;

    return (
        <MainLayout>
            <AnimatePresence mode="wait">
                {!selectedWarehouse ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-black font-display text-foreground tracking-tight uppercase">Enterprise Supply Chain</h1>
                                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <MapPin size={12} className="text-primary" />
                                    Global Warehouse Fleet & Logistics Distribution Center.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 shadow-lg shadow-primary/20 h-9 px-4 bg-primary hover:bg-primary/90 text-xs">
                                            <Plus size={16} />
                                            Register Hub
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="border-primary/20 bg-background/95 backdrop-blur-xl p-5">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                                <WarehouseIcon className="text-primary" size={20} />
                                                Register New Hub
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hub Identity</Label>
                                                <Input
                                                    placeholder="e.g. Northeast Distribution Center"
                                                    className="h-10 bg-muted/30 border-primary/10 text-xs"
                                                    value={newWh.name}
                                                    onChange={e => setNewWh({ ...newWh, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Functional Type</Label>
                                                <Select
                                                    value={newWh.type}
                                                    onValueChange={(v: any) => setNewWh({ ...newWh, type: v })}
                                                >
                                                    <SelectTrigger className="h-10 bg-muted/30 border-primary/10 text-xs">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Warehouse" className="text-xs">Secure Global Warehouse</SelectItem>
                                                        <SelectItem value="Store Front" className="text-xs">Retail Terminal</SelectItem>
                                                        <SelectItem value="Backroom" className="text-xs">Employee Storage</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter className="gap-2">
                                            <Button variant="ghost" className="h-10 text-xs" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                            <Button className="h-10 px-6 font-bold text-xs" onClick={handleAddWarehouse} disabled={!newWh.name}>Initialize Hub</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Active Fleets', value: warehouses.length.toString(), icon: MapPin, color: 'primary' },
                                { label: 'Stored Inventory', value: warehouseStats.reduce((acc, w) => acc + w.itemsStored, 0).toLocaleString(), icon: Package, color: 'success' },
                                { label: 'Movement Ratio', value: `${movements.filter(m => m.movement_type === 'TRANSFER').length.toString()} TX`, icon: ArrowRightLeft, color: 'warning' },
                                { label: 'Live Capacity', value: `${((warehouseStats.reduce((acc, w) => acc + w.itemsStored, 0) / 10000) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'primary' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card p-4 group hover:border-primary/30 transition-all cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color} group-hover:scale-105 transition-transform`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-tight">{stat.label}</p>
                                            <p className="text-xl font-black tracking-tighter mt-0.5">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {warehouseStats.map((loc, index) => (
                                <motion.div
                                    key={loc.id}
                                    className={`glass-card p-4 border-b-4 ${loc.name === 'Main Store' ? 'border-b-primary bg-primary/[0.02]' : 'border-b-transparent'} group cursor-pointer hover:shadow-xl transition-all`}
                                    onClick={() => setSelectedWarehouse(loc as any)}
                                    layoutId={`wh-${loc.id}`}
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl ${loc.name === 'Main Store' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted'} flex items-center justify-center transition-all group-hover:scale-105`}>
                                                {loc.type === 'Store Front' ? <Store size={22} /> : loc.type === 'Warehouse' ? <WarehouseIcon size={22} /> : <Box size={22} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-lg leading-tight uppercase tracking-tight">{loc.name}</h3>
                                                    {loc.name === 'Main Store' && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Retail Terminal" />}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-4 px-1.5 bg-muted/40 border-muted-foreground/20">{loc.type}</Badge>
                                                    <span className={`text-[8px] uppercase font-black tracking-widest flex items-center gap-1 ${loc.is_active ? 'text-success' : 'text-danger'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${loc.is_active ? 'bg-success' : 'bg-danger'}`} />
                                                        {loc.is_active ? 'ONLINE' : 'OFFLINE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem className="font-bold gap-2 text-xs"><MapPin size={12} /> View Location</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-xs"><Clock size={12} /> Full Ledger</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-danger font-bold gap-2 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDecommission(loc.id);
                                                    }}
                                                >
                                                    <Trash2 size={12} /> Decommission
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-muted/10 p-4 rounded-xl border border-primary/5">
                                            <p className="text-[9px] text-muted-foreground mb-1 font-black uppercase tracking-widest">Current Load</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black tracking-tighter">{loc.itemsStored.toLocaleString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold italic">qty</span>
                                            </div>
                                        </div>
                                        <div className="bg-muted/10 p-4 rounded-xl border border-primary/5">
                                            <p className="text-[9px] text-muted-foreground mb-1 font-black uppercase tracking-widest">Efficiency</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black tracking-tighter">98%</span>
                                                <span className="text-[10px] text-success font-black">▲</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                                        <div className="flex items-center -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold overflow-hidden shadow-sm">
                                                    <Package size={10} className="text-muted-foreground" />
                                                </div>
                                            ))}
                                            <div className="w-7 h-7 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[8px] font-black z-10 shadow-sm">
                                                +9
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Audit</span>
                                            <span className="text-[10px] font-bold text-primary">Jan 12</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-muted"
                                    onClick={() => setSelectedWarehouse(null)}
                                >
                                    <ArrowLeft size={20} />
                                </Button>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner`}>
                                        {selectedWarehouse.type === 'Store Front' ? <Store size={20} /> : selectedWarehouse.type === 'Warehouse' ? <WarehouseIcon size={20} /> : <Box size={20} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight">{selectedWarehouse.name}</h2>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                                            <Badge variant="outline" className="text-[8px] font-black tracking-widest bg-muted/30 h-4 px-1.5">{selectedWarehouse.type}</Badge>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 uppercase tracking-tighter">
                                                <Clock size={10} className="text-primary/60" />
                                                Updated 2m ago
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline" className="flex-1 md:flex-none gap-2 h-9 border-primary/20 hover:bg-primary/5 text-primary text-xs" onClick={() => setIsTransferOpen(true)}>
                                    <ArrowRightLeft size={16} />
                                    Transfer
                                </Button>
                                <Button className="flex-1 md:flex-none gap-2 h-9 px-6 shadow-lg shadow-primary/20 text-xs" onClick={() => setIsAddStockOpen(true)}>
                                    <Plus size={16} />
                                    Add Stock
                                </Button>
                            </div>
                        </div>

                        {/* Inventory Table Container */}
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 border-b border-border bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-inner">
                                        <Package size={16} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base leading-tight">Terminal Inventory</h3>
                                        <div className="flex gap-3">
                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{selectedWhInventory.length} SKUs</p>
                                            <p className="text-[9px] text-primary uppercase font-black tracking-widest">{selectedWhInventory.reduce((acc, item) => acc + item.stock, 0).toLocaleString()} Units</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-64">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search terminal..."
                                        className="pl-9 h-9 bg-background border-primary/10 focus:border-primary/30 text-xs"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/5 text-left border-b border-border">
                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Product Detail</th>
                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Asset Identity</th>
                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Available</th>
                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right flex items-center justify-end gap-1">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {selectedWhInventory.map((item, i) => (
                                            <tr key={item.product.id} className="group hover:bg-primary/[0.02] transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-lg bg-muted/40 p-1 flex items-center justify-center shadow-inner text-[8px]">
                                                            <img
                                                                src={item.product.image.length > 2 ? item.product.image : "https://via.placeholder.com/150"}
                                                                className="max-w-full max-h-full object-contain"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.product.name}</p>
                                                            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter opacity-70">{item.product.model || 'Standard'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 font-mono text-[10px] font-bold text-muted-foreground">{item.product.sku}</td>
                                                <td className="px-5 py-3">
                                                    <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-muted/50 h-4 px-1">{item.product.category}</Badge>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="text-lg font-black tabular-nums">{item.stock.toLocaleString()}</span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <Badge className={`text-[8px] h-4 px-1 ${item.stock > 20 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                        {item.stock > 20 ? 'OPTIMAL' : 'REPLENISH'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {selectedWhInventory.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <Box size={48} className="text-muted-foreground mb-4" />
                                                        <p className="text-lg font-bold">No assets found in terminal</p>
                                                        <p className="text-sm">Initiate a transfer or add new stock to this hub.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Terminal Logs */}
                        <div className="glass-card p-5">
                            <h3 className="font-black uppercase tracking-tight text-base mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                Terminal Operation Logs
                            </h3>
                            <div className="space-y-2">
                                {movements
                                    .filter(m => m.from_location_id === selectedWarehouse.id || m.to_location_id === selectedWarehouse.id)
                                    .slice(0, 5)
                                    .map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.movement_type === 'IN' || (m.to_location_id === selectedWarehouse.id && m.movement_type === 'TRANSFER') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    {m.movement_type === 'IN' || (m.to_location_id === selectedWarehouse.id && m.movement_type === 'TRANSFER') ? <Plus size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs tracking-tight">{m.product_name}</p>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-black leading-tight tracking-widest">{m.movement_type} • {m.reason || 'Operational'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-base ${m.movement_type === 'IN' || (m.to_location_id === selectedWarehouse.id && m.movement_type === 'TRANSFER') ? 'text-success' : 'text-danger'}`}>
                                                    {(m.movement_type === 'IN' || (m.to_location_id === selectedWarehouse.id && m.movement_type === 'TRANSFER')) ? '+' : '-'}{Math.abs(m.quantity)}
                                                </p>
                                                <p className="text-[9px] text-muted-foreground font-bold">{format(new Date(m.created_at), 'MMM dd')}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Stock Dialog */}
            <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
                <DialogContent className="max-w-md glass-card border-success/30 p-5">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black uppercase flex items-center gap-2">
                            <Plus className="text-success" size={20} />
                            Stock Import
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Target Hub</Label>
                            <Input value={selectedWarehouse?.name} disabled className="h-9 bg-muted/50 border-transparent font-bold text-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Product Catalog</Label>
                            <Select onValueChange={v => setStockForm({ ...stockForm, productId: v })}>
                                <SelectTrigger className="h-9 border-primary/20 bg-muted/30 text-xs">
                                    <SelectValue placeholder="Locate product..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-bold">{p.name}</span>
                                                <span className="text-[9px] text-muted-foreground font-mono">[{p.sku}]</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest">Quantity</Label>
                                <Input
                                    type="number"
                                    className="h-10 text-lg font-black border-success/20 bg-success/[0.03] text-success focus:border-success"
                                    placeholder="0"
                                    value={stockForm.quantity}
                                    onChange={e => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Reference Note</Label>
                            <Textarea
                                className="bg-muted/30 border-primary/10 min-h-[60px] text-xs"
                                placeholder="Restock reason..."
                                value={stockForm.reason}
                                onChange={e => setStockForm({ ...stockForm, reason: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAddStockOpen(false)}>Cancel</Button>
                        <Button className="h-10 px-6 font-bold bg-success hover:bg-success/90 text-xs" onClick={handleAddStock}>Authorize Stash</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Internal Transfer Dialog */}
            <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                <DialogContent className="max-w-md glass-card border-primary/30 p-5">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black uppercase flex items-center gap-2">
                            <ArrowRightLeft className="text-primary" size={20} />
                            Redistribution
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest">Source Hub</Label>
                                <Input value={selectedWarehouse?.name} disabled className="h-9 bg-muted/50 border-transparent font-bold text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest">Target Hub</Label>
                                <Select onValueChange={v => setTransferForm({ ...transferForm, toWarehouseId: v })}>
                                    <SelectTrigger className="h-9 border-primary/10 bg-muted/30 text-xs">
                                        <SelectValue placeholder="Select target..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses
                                            .filter(w => w.id !== selectedWarehouse?.id)
                                            .map(w => (
                                                <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Asset Selection</Label>
                            <Select onValueChange={v => setTransferForm({ ...transferForm, productId: v })}>
                                <SelectTrigger className="h-9 border-primary/20 bg-muted/30 text-xs text-primary font-bold">
                                    <SelectValue placeholder="Select item..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {selectedWhInventory.map(item => (
                                        <SelectItem key={item.product.id} value={item.product.id}>
                                            <div className="flex items-center justify-between w-full gap-4 text-xs">
                                                <span className="font-bold">{item.product.name}</span>
                                                <Badge variant="secondary" className="text-[8px] h-3">{item.stock} Avail</Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Quantity</Label>
                            <Input
                                type="number"
                                className="h-10 text-lg font-black border-primary/20 bg-primary/[0.03] text-primary focus:border-primary"
                                placeholder="0"
                                value={transferForm.quantity}
                                onChange={e => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest">Transfer Note</Label>
                            <Textarea
                                className="bg-muted/30 border-primary/10 text-xs min-h-[60px]"
                                placeholder="Reason..."
                                value={transferForm.reason}
                                onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
                        <Button className="h-10 px-6 font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-[10px]" onClick={handleTransfer}>Authorize</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};
export default Warehouses;
