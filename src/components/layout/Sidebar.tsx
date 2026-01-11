import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Warehouse,
  AlertTriangle,
  FileText,
  Truck,
  Tag,
  Menu,
  X,
  LayoutTemplate,
  Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, collapsed, badge, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to}>
      <motion.div
        className={`nav-item relative ${isActive ? 'active' : ''}`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
      >
        <span className="flex-shrink-0">{icon}</span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {badge && !collapsed && (
          <span className="ml-auto bg-danger text-danger-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </motion.div>
    </NavLink>
  );
};


const navItems = [
  { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/products', icon: <Package size={20} />, label: 'Products' },
  { to: '/categories', icon: <Tag size={20} />, label: 'Categories' },
  { to: '/inventory', icon: <Layers size={20} />, label: 'Inventory' },
  { to: '/warehouses', icon: <Warehouse size={20} />, label: 'Locations' },
  { to: '/audit', icon: <FileText size={20} />, label: 'History & Activity' },
  { to: '/users', icon: <Users size={20} />, label: 'Users' },
];

export const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: {
  collapsed: boolean,
  setCollapsed: (c: boolean) => void,
  mobileOpen?: boolean,
  setMobileOpen?: (o: boolean) => void
}) => {
  const [userRole, setUserRole] = useState('Admin');
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role) setUserRole(role);
    // Auto-close on route change for mobile
    if (setMobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  const filteredItems = navItems.filter(item => {
    if (userRole === 'SuperAdmin') return true;
    // Dashboard is now super admin only
    const superAdminOnly = ['/admin', '/users'];
    return !superAdminOnly.includes(item.to);
  });

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo & Mobile Close */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <motion.div
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: (collapsed && !mobileOpen) ? 'center' : 'flex-start' }}
        >
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="w-9 h-9 rounded-lg object-cover border-2 border-primary/30 shadow-lg"
          />
          <AnimatePresence>
            {(!collapsed || mobileOpen) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="font-black text-foreground whitespace-nowrap text-sm tracking-tighter uppercase block leading-none">
                  Marshall Ethel
                </span>
                <span className="text-[9px] text-primary block whitespace-nowrap leading-none mt-1 uppercase tracking-[0.2em] font-black italic">NID. LTD</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile Close Button */}
        {setMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        <NavItem
          to="/checkout"
          icon={<Scan size={20} />}
          label="Terminal POS"
          collapsed={collapsed}
        />
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};
