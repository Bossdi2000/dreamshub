import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Clock, CheckCircle, XCircle, Filter, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/context/InventoryContext';
import { formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

const getAlertStyle = (type: string) => {
  switch (type) {
    case 'critical': return { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', icon: XCircle };
    case 'warning': return { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', icon: AlertTriangle };
    case 'info': return { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: Bell };
    case 'success': return { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', icon: CheckCircle };
    default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', icon: Bell };
  }
};

const Alerts = () => {
  const { products, batches } = useInventory();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  // Generate real-time alerts from inventory data
  const alerts = useMemo(() => {
    const generatedAlerts: any[] = [];

    // Out of Stock Alerts (Critical)
    products.filter(p => p.stock === 0).forEach(product => {
      generatedAlerts.push({
        id: `out-${product.id}`,
        type: 'critical',
        title: 'Out of Stock',
        message: `${product.name} has 0 units remaining`,
        product: product.sku || product.id,
        time: 'Just now',
        resolved: false,
        timestamp: new Date()
      });
    });

    // Low Stock Alerts (Warning)
    products.filter(p => p.stock > 0 && p.stock <= 10).forEach(product => {
      generatedAlerts.push({
        id: `low-${product.id}`,
        type: 'warning',
        title: 'Low Stock',
        message: `${product.name} is below minimum threshold (${product.stock} units remaining)`,
        product: product.sku || product.id,
        time: formatDistanceToNow(new Date(), { addSuffix: true }),
        resolved: false,
        timestamp: new Date()
      });
    });

    // Expiry Alerts (Critical/Warning)
    batches.forEach(batch => {
      if (!batch.expiry_date) return;

      const product = products.find(p => p.id === batch.product_id);
      if (!product) return;

      const expiryDate = parseISO(batch.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, new Date());

      if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
        generatedAlerts.push({
          id: `exp-${batch.id}`,
          type: daysUntilExpiry <= 2 ? 'critical' : 'warning',
          title: 'Expiring Soon',
          message: `${product.name} expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`,
          product: product.sku || product.id,
          time: formatDistanceToNow(new Date(), { addSuffix: true }),
          resolved: false,
          timestamp: new Date()
        });
      }
    });

    // Reorder Suggestions (Info) - for products with high stock turnover
    products.filter(p => p.stock > 0 && p.stock <= 15).slice(0, 3).forEach(product => {
      generatedAlerts.push({
        id: `reorder-${product.id}`,
        type: 'info',
        title: 'Reorder Suggestion',
        message: `Consider reordering ${product.name} - stock level is moderate (${product.stock} units)`,
        product: product.sku || product.id,
        time: formatDistanceToNow(new Date(), { addSuffix: true }),
        resolved: false,
        timestamp: new Date()
      });
    });

    return generatedAlerts.sort((a, b) => {
      // Sort by type priority: critical > warning > info
      const typePriority = { critical: 0, warning: 1, info: 2, success: 3 };
      return typePriority[a.type as keyof typeof typePriority] - typePriority[b.type as keyof typeof typePriority];
    });
  }, [products, batches]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const typeMatch = filterType === 'all' || alert.type === filterType;
      const statusMatch = filterStatus === 'all' ||
        (filterStatus === 'active' && !alert.resolved) ||
        (filterStatus === 'resolved' && alert.resolved);
      return typeMatch && statusMatch;
    });
  }, [alerts, filterType, filterStatus]);

  const activeAlerts = filteredAlerts.filter(a => !a.resolved);
  const resolvedAlerts = filteredAlerts.filter(a => a.resolved);

  const alertCounts = useMemo(() => ({
    critical: alerts.filter(a => a.type === 'critical' && !a.resolved).length,
    warning: alerts.filter(a => a.type === 'warning' && !a.resolved).length,
    info: alerts.filter(a => a.type === 'info' && !a.resolved).length,
    resolved: resolvedAlerts.length
  }), [alerts, resolvedAlerts]);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of stock levels, expiry warnings, and inventory health.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <CheckCircle size={18} />
          Mark All Read
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Critical', count: alertCounts.critical, color: 'danger', icon: XCircle },
          { label: 'Warnings', count: alertCounts.warning, color: 'warning', icon: AlertTriangle },
          { label: 'Info', count: alertCounts.info, color: 'primary', icon: Bell },
          { label: 'Resolved Today', count: alertCounts.resolved, color: 'success', icon: CheckCircle },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 text-${stat.color}`}>{stat.count}</p>
              </div>
              <stat.icon className={`text-${stat.color} opacity-20`} size={32} />
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-transparent">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-transparent">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground flex items-center gap-2">
            <Clock size={14} />
            <span>Live monitoring active</span>
          </div>
        </div>
      </motion.div>

      {/* Active Alerts */}
      <motion.div
        className="glass-card overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-4 border-b border-border flex items-center gap-2">
          <AlertTriangle size={20} className="text-warning" />
          <h3 className="font-semibold">Active Alerts</h3>
          <Badge variant="secondary">{activeAlerts.length}</Badge>
        </div>

        <div className="divide-y divide-border">
          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-success/30 mb-3" size={48} />
              <p className="text-sm font-bold text-foreground">All Clear!</p>
              <p className="text-xs text-muted-foreground mt-1">No active alerts at this time</p>
            </div>
          ) : (
            activeAlerts.map((alert, index) => {
              const style = getAlertStyle(alert.type);
              const Icon = style.icon;

              return (
                <motion.div
                  key={alert.id}
                  className={`p-4 ${style.bg} border-l-4 ${style.border} hover:brightness-95 transition-all cursor-pointer`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <div className="flex items-start gap-4">
                    <Icon size={20} className={style.text} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${style.text}`}>{alert.title}</span>
                        <Badge variant="outline" className="text-xs">{alert.product}</Badge>
                      </div>
                      <p className="text-sm text-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          {alert.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Dismiss</Button>
                      <Button size="sm">Take Action</Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="p-4 border-b border-border flex items-center gap-2">
            <CheckCircle size={20} className="text-success" />
            <h3 className="font-semibold">Recently Resolved</h3>
            <Badge variant="secondary">{resolvedAlerts.length}</Badge>
          </div>

          <div className="divide-y divide-border">
            {resolvedAlerts.map((alert, index) => {
              const style = getAlertStyle(alert.type);
              const Icon = style.icon;

              return (
                <motion.div
                  key={alert.id}
                  className="p-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.6, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <div className="flex items-start gap-4">
                    <Icon size={20} className={style.text} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant="outline" className="text-xs">{alert.product}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Clock size={12} />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </MainLayout>
  );
};

export default Alerts;
