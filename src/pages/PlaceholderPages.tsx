import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          className="glass-card p-12 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Construction size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export const Categories = () => (
  <PlaceholderPage 
    title="Categories" 
    description="Manage product categories with custom rules for food expiry, electronics warranties, and more."
  />
);

export const Warehouses = () => (
  <PlaceholderPage 
    title="Locations" 
    description="Configure warehouses, store locations, and manage stock across multiple sites."
  />
);

export const Orders = () => (
  <PlaceholderPage 
    title="Orders" 
    description="Track sales orders, manage fulfillment, and handle returns."
  />
);

export const Suppliers = () => (
  <PlaceholderPage 
    title="Suppliers" 
    description="Manage supplier relationships, purchase orders, and deliveries."
  />
);

export const Reports = () => (
  <PlaceholderPage 
    title="Reports" 
    description="Generate inventory reports, analytics, and export data."
  />
);

export const AuditLog = () => (
  <PlaceholderPage 
    title="Audit Log" 
    description="Complete audit trail of all inventory changes and user actions."
  />
);

export const Users = () => (
  <PlaceholderPage 
    title="Users" 
    description="Manage team members, roles, and access permissions."
  />
);

export const Settings = () => (
  <PlaceholderPage 
    title="Settings" 
    description="Configure system settings, integrations, and preferences."
  />
);
