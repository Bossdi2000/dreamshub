import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Layers, Plus, Search, ArrowRightLeft, Package, Clock, MapPin, RotateCcw, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransferStockDialog } from '@/components/inventory/TransferStockDialog';
import { ReturnsDialog } from '@/components/inventory/ReturnsDialog';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/context/InventoryContext';
import { formatDistanceToNow, format } from 'date-fns';

const getTypeStyle = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'IN': return { bg: 'bg-success/10', text: 'text-success', label: 'Stock In', icon: <TrendingUp size={18} /> };
    case 'OUT': return { bg: 'bg-danger/10', text: 'text-danger', label: 'Stock Out', icon: <TrendingDown size={18} /> };
    case 'TRANSFER': return { bg: 'bg-warning/10', text: 'text-warning', label: 'Transfer', icon: <ArrowRightLeft size={18} /> };
    case 'ADJUSTMENT': return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Adjustment', icon: <RefreshCcw size={18} /> };
    default: return { bg: 'bg-muted', text: 'text-muted-foreground', label: type, icon: <Package size={18} /> };
  }
};

const Inventory = () => {
  const { movements, loading, refreshInventory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch =
        m.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || m.movement_type.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [movements, searchQuery, filterType]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayMovements = movements.filter(m => new Date(m.created_at).getTime() >= today);

    return [
      { label: 'Today\'s Movements', value: todayMovements.length, icon: Layers, color: 'primary' },
      { label: 'Stock Added (IN)', value: todayMovements.filter(m => m.movement_type === 'IN').length, icon: Package, color: 'success' },
      { label: 'Stock Out', value: todayMovements.filter(m => m.movement_type === 'OUT').length, icon: Package, color: 'danger' },
      { label: 'Transfers', value: todayMovements.filter(m => m.movement_type === 'TRANSFER').length, icon: ArrowRightLeft, color: 'warning' },
    ];
  }, [movements]);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Enterprise Inventory Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Real-time audit trail of all enterprise movements with a <span className="text-primary font-bold">Gold</span> standard ledger.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => refreshInventory()} className={loading ? "animate-spin" : ""}>
            <RefreshCcw size={18} />
          </Button>
          <TransferStockDialog>
            <Button variant="outline" className="gap-2">
              <ArrowRightLeft size={18} />
              Transfer Stock
            </Button>
          </TransferStockDialog>
          <ProductFormDialog mode="add">
            <Button className="gap-2">
              <Plus size={18} />
              Register Initial Stock
            </Button>
          </ProductFormDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4 border-l-4 border-primary hover:border-gold transition-all shadow-lg hover:shadow-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 tracking-tighter">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color === 'danger' ? 'destructive' : stat.color}/10 flex items-center justify-center`}>
                <stat.icon size={24} className={`text-${stat.color === 'danger' ? 'destructive' : stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        className="glass-card p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-transparent focus:border-primary/30 h-11"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48 bg-muted/30 border-transparent h-11">
              <SelectValue placeholder="Movement Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Movements</SelectItem>
              <SelectItem value="in">Inbound (Stock In)</SelectItem>
              <SelectItem value="out">Outbound (Stock Out)</SelectItem>
              <SelectItem value="transfer">Inter-Warehouse Transfer</SelectItem>
              <SelectItem value="adjustment">Manual Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Movements Timeline */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 tracking-tight">
            <Clock size={18} className="text-primary" />
            Activity Timeline
          </h3>
          <Badge variant="outline" className="bg-primary/5">{filteredMovements.length} Record(s)</Badge>
        </div>

        <div className="divide-y divide-border">
          {filteredMovements.map((movement, index) => {
            const style = getTypeStyle(movement.movement_type);
            return (
              <motion.div
                key={movement.id}
                className="p-6 hover:bg-muted/30 transition-all cursor-pointer group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {style.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold tracking-tight">{movement.product_name}</span>
                        <Badge className={`${style.bg} ${style.text} border-0 text-[10px] uppercase font-bold`}>
                          {style.label}
                        </Badge>
                      </div>
                      <span className={`text-xl font-black ${movement.quantity > 0 ? 'text-success' : 'text-destructive'} tracking-tighter`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                        <MapPin size={14} className="text-primary/60" />
                        {movement.movement_type === 'TRANSFER' ? (
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{movement.from_location_name}</span>
                            <ArrowRightLeft size={10} />
                            <span className="font-bold text-foreground">{movement.to_location_name}</span>
                          </span>
                        ) : (
                          <span className="font-bold text-foreground">
                            {movement.movement_type === 'IN' ? movement.to_location_name :
                              movement.movement_type === 'OUT' ? movement.from_location_name :
                                'Enterprise Ledger'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                        <Badge variant="outline" className="bg-muted/20 font-normal italic text-xs w-full truncate">
                          {movement.reason || "Automatic system entry"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        SYSTEM OPERATOR
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary/40" />
                        {movement.created_at ? formatDistanceToNow(new Date(movement.created_at), { addSuffix: true }) : 'unknown time'}
                      </div>
                      <div className="text-primary/60 font-mono">
                        REF: {movement.id.split('-')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredMovements.length === 0 && (
            <div className="px-6 py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center opacity-20">
                <Package size={32} />
              </div>
              <p className="text-muted-foreground font-medium">No ledger entries match your current search criteria.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>Clear Filters</Button>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Inventory;
