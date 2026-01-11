import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, User, Command, Package, TrendingDown, AlertTriangle, ArrowRightLeft, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventory } from '@/context/InventoryContext';
import { formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

import { useTheme } from '@/context/ThemeContext';
import { Menu, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

interface TopBarProps {
  sidebarCollapsed?: boolean;
  onMenuClick?: () => void;
}

export const TopBar = ({ sidebarCollapsed = false, onMenuClick }: TopBarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userRole, setUserRole] = useState('Admin');
  const navigate = useNavigate();
  const { products, movements, batches } = useInventory();
  const { theme, toggleTheme } = useTheme();

  const hasAdmin = !!localStorage.getItem('auth_token_Admin');
  const hasSuper = !!localStorage.getItem('auth_token_SuperAdmin');

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role) setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_Admin');
    localStorage.removeItem('auth_token_SuperAdmin');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const switchRole = (newRole: string) => {
    localStorage.setItem('user_role', newRole);
    setUserRole(newRole);
    toast.success(`Switched to ${newRole} mode`);
    if (newRole === 'SuperAdmin') navigate('/admin');
    else navigate('/products');
  };

  // Generate real-time notifications from inventory data
  const notifications = useMemo(() => {
    const notifs: any[] = [];

    // Recent movements (last 5)
    movements.slice(0, 5).forEach(movement => {
      const product = products.find(p => p.id === movement.product_id);
      let icon, type, title, message;

      switch (movement.movement_type) {
        case 'IN':
          icon = Package;
          type = 'success';
          title = 'Stock Added';
          message = `${Math.abs(movement.quantity)} units of ${movement.product_name || product?.name} added`;
          break;
        case 'OUT':
          icon = TrendingDown;
          type = 'info';
          title = 'Stock Sold';
          message = `${Math.abs(movement.quantity)} units of ${movement.product_name || product?.name} sold`;
          break;
        case 'TRANSFER':
          icon = ArrowRightLeft;
          type = 'info';
          title = 'Stock Transfer';
          message = `${Math.abs(movement.quantity)} units of ${movement.product_name || product?.name} transferred`;
          break;
        default:
          icon = Package;
          type = 'info';
          title = 'Stock Movement';
          message = `${movement.product_name || product?.name} updated`;
      }

      notifs.push({
        id: `mov-${movement.id}`,
        icon,
        type,
        title,
        message,
        time: formatDistanceToNow(parseISO(movement.created_at), { addSuffix: true }),
        timestamp: new Date(movement.created_at)
      });
    });

    // Out of stock alerts
    products.filter(p => p.stock === 0).slice(0, 3).forEach(product => {
      notifs.push({
        id: `out-${product.id}`,
        icon: AlertTriangle,
        type: 'danger',
        title: 'Out of Stock',
        message: `${product.name} is out of stock`,
        time: 'Just now',
        timestamp: new Date()
      });
    });

    // Low stock alerts
    products.filter(p => p.stock > 0 && p.stock <= 5).slice(0, 3).forEach(product => {
      notifs.push({
        id: `low-${product.id}`,
        icon: AlertTriangle,
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.stock} units left`,
        time: 'Just now',
        timestamp: new Date()
      });
    });

    // Sort by timestamp (most recent first) and limit to 10
    return notifs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [products, movements]);

  const notificationCount = notifications.length;

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'success': return 'bg-success';
      default: return 'bg-primary';
    }
  };

  return (
    <header
      className="h-16 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 w-full"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-primary' : 'text-muted-foreground'
                }`}
            />
            <Input
              type="search"
              placeholder="Search products, inventory..."
              className="pl-10 pr-20 h-10 bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-all"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px] font-medium">
                <Command size={10} className="inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px] font-medium">K</kbd>
            </div>
          </div>
        </div>

        {/* Mobile Search Icon (only) */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search size={20} />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft shadow-sm shadow-primary/40">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 glass-card max-h-[500px] overflow-y-auto">
            <DropdownMenuLabel className="flex items-center justify-between sticky top-0 bg-card z-10 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span>Live Activity Feed</span>
                <Badge variant="outline" className="text-[10px]">{notificationCount} new</Badge>
              </div>
              <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-start gap-3 w-full">
                        <div className={`w-8 h-8 rounded-lg ${getNotifColor(notification.type)}/10 flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={getNotifColor(notification.type).replace('bg-', 'text-')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{notification.title}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">{notification.time}</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">{notification.message}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">
                  {userRole === 'SuperAdmin' ? 'Super Admin' : 'Main Admin'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {userRole === 'SuperAdmin' ? 'Enterprise Director' : 'System Admin'}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hasAdmin && hasSuper && (
              <>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-1">Switch Perspective</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole(userRole === 'SuperAdmin' ? 'Admin' : 'SuperAdmin')}>
                  Switch to {userRole === 'SuperAdmin' ? 'Main Admin' : 'Super Admin'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Team Management</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
