import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Package, Search, Filter, ShoppingCart } from 'lucide-react';
import { useInventory, Product } from '@/context/InventoryContext';
import { useCheckout } from '@/context/CheckoutContext';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'In Stock': return 'status-success';
    case 'Low Stock': return 'status-warning';
    case 'Out of Stock': return 'status-danger';
    default: return 'status-neutral';
  }
};

const Products = () => {
  const { addToCart } = useCheckout();
  const { products, categories, deleteProduct } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const userRole = localStorage.getItem('user_role') || 'Admin';
  const isSuper = userRole === 'SuperAdmin' || userRole === 'Admin';
  const canManage = isSuper;

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    try {
      const search = (searchTerm || '').toLowerCase();
      return products.filter(p => {
        if (!p) return false;
        const name = String(p.name || '').toLowerCase();
        const sku = String(p.sku || '').toLowerCase();
        const category = String(p.category || '').toLowerCase();
        return name.includes(search) || sku.includes(search) || category.includes(search);
      });
    } catch (err) {
      console.error("Filtering error:", err);
      return [];
    }
  }, [products, searchTerm]);

  const handleEdit = (product: Product) => {
    setFormMode('edit');
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setFormMode('view');
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog across all categories.
          </p>
        </div>
        {canManage && (
          <Button className="gap-2" onClick={() => {
            setFormMode('add');
            setEditingProduct(null);
            setEditDialogOpen(true);
          }}>
            <Plus size={18} />
            Add Product
          </Button>
        )}
      </div>

      <ProductFormDialog
        mode={formMode}
        product={editingProduct || undefined}
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
      />

      {/* Filters */}
      <motion.div
        className="glass-card p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU..."
              className="pl-10 bg-muted/50 border-transparent focus:border-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            onValueChange={(val) => {
              if (val === 'all') setSearchTerm('');
              else setSearchTerm(val);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-transparent">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.filter(cat => cat && cat.name).map(cat => (
                <SelectItem key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</SelectItem>
              ))}
              {categories.length === 0 && (
                <>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-transparent">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            More Filters
          </Button>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            <span className="font-semibold">All Products</span>
            <Badge variant="secondary">{filteredProducts.length} items</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredProducts.length} items</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                >
                  <td>
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl overflow-hidden">
                        {(product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? (
                          <img src={product.image} className="w-full h-full object-contain" alt="" />
                        ) : (
                          product.image || '📦'
                        )}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">{product.sku}</td>
                  <td>
                    <Badge variant="secondary">{product.category}</Badge>
                  </td>
                  <td className="font-semibold text-primary">₦{(product.selling_price || 0).toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => addToCart(product)}>
                            <ShoppingCart size={14} /> Add to Cart
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleView(product)}>
                            <Eye size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleEdit(product)}>
                            <Edit size={14} /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-danger" onClick={() => deleteProduct(product.id)}>
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-danger hover:bg-danger/10 hover:text-danger"
                          onClick={() => deleteProduct(product.id)}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page 1 of 1
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Products;
