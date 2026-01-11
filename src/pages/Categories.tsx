import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Edit, Trash2, Smartphone, Apple, Sparkles, Shirt, Info,
  MoreVertical, ArrowLeft, Package, TrendingUp, AlertCircle, Calendar, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory, Category } from '@/context/InventoryContext';
import { format } from 'date-fns';

const CategoryIcon = ({ iconName, className }: { iconName: string | null, className?: string }) => {
  switch (iconName?.toLowerCase()) {
    case 'smartphone': return <Smartphone className={className || "text-primary"} />;
    case 'apple': return <Apple className={className || "text-success"} />;
    case 'sparkles': return <Sparkles className={className || "text-primary"} />;
    case 'shirt': return <Shirt className={className || "text-primary"} />;
    default: return <Tag className={className || "text-muted-foreground"} />;
  }
};

const Categories = () => {
  const { categories, products, movements, addCategory, updateCategory, deleteCategory, loading } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: 'tag', has_expiry: false, has_serials: false });
  const [editCat, setEditCat] = useState({ name: '', description: '', icon: 'tag', has_expiry: false, has_serials: false });

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat.name);
      const catMovements = movements.filter(m => catProducts.some(p => p.id === m.product_id));

      const amountEntered = catMovements
        .filter(m => m.movement_type === 'IN')
        .reduce((sum, m) => sum + m.quantity, 0);

      const amountSold = Math.abs(
        catMovements
          .filter(m => m.movement_type === 'OUT')
          .reduce((sum, m) => sum + m.quantity, 0)
      );

      const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const outOfStock = catProducts.filter(p => p.stock === 0).length;

      return {
        ...cat,
        productCount: catProducts.length,
        totalStock,
        outOfStock,
        amountEntered,
        amountSold
      };
    });
  }, [categories, products, movements]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCategory({
      name: newCat.name,
      description: newCat.description,
      icon: newCat.icon,
      has_expiry: newCat.has_expiry,
      has_serials: newCat.has_serials
    });
    setNewCat({ name: '', description: '', icon: 'tag', has_expiry: false, has_serials: false });
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;
    await updateCategory(categoryToEdit.id, {
      name: editCat.name,
      description: editCat.description,
      icon: editCat.icon,
      has_expiry: editCat.has_expiry,
      has_serials: editCat.has_serials
    });
    setIsEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setEditCat({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'tag',
      has_expiry: category.has_expiry || false,
      has_serials: category.has_serials || false
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  if (selectedCategory) {
    const categoryProducts = products.filter(p => p.category === selectedCategory.name);
    const stats = categoryStats.find(s => s.id === selectedCategory.id);

    return (
      <MainLayout>
        <div className="mb-6">
          <Button
            variant="ghost"
            className="gap-2 mb-4 -ml-2"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={18} />
            Back to Categories
          </Button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                <CategoryIcon iconName={selectedCategory.icon} className="text-primary w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedCategory.name} Ledger</h1>
                <p className="text-muted-foreground mt-1 max-w-xl">
                  {selectedCategory.description || "Viewing all stock assets and historical ledger for this department."}
                </p>
                <div className="flex gap-2 mt-2">
                  {selectedCategory.has_expiry && <Badge className="bg-warning/20 text-warning hover:bg-warning/20 border-warning/30 text-[10px]">Expiry Tracking ON</Badge>}
                  {selectedCategory.has_serials && <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-primary/30 text-[10px]">Serial Tracking ON</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <div className="glass-card p-4 text-center min-w-[120px] border-primary/20 bg-primary/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-bold">Total Entered</p>
                <p className="text-2xl font-black text-primary">{stats?.amountEntered.toLocaleString() || 0}</p>
              </div>
              <div className="glass-card p-4 text-center min-w-[120px] border-danger/20 bg-danger/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-bold">Total Sold</p>
                <p className="text-2xl font-black text-danger">{stats?.amountSold.toLocaleString() || 0}</p>
              </div>
              <div className="glass-card p-4 text-center min-w-[120px] border-success/20 bg-success/5 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-bold">Inventory Remaining</p>
                <p className="text-2xl font-black text-success">
                  {categoryProducts.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Package size={18} className="text-primary" />
                Department Product Catalog
              </h3>
              <Badge variant="outline" className="bg-primary/5">Live Inventory</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Product & Model</th>
                    <th className="px-6 py-4">Buy Price</th>
                    <th className="px-6 py-4">Sell Price</th>
                    <th className="px-6 py-4 text-center">Remaining</th>
                    <th className="px-6 py-4">Serials</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categoryProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden">
                            <img
                              src={product.image.length > 2 ? product.image : "https://via.placeholder.com/150"}
                              alt={product.name}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{product.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase">{product.model || 'No Model'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-danger/70 text-sm">₦{product.buying_price.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-success text-sm">₦{product.selling_price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-black text-lg">{product.stock}</div>
                        <Badge variant={product.stock > 5 ? "secondary" : (product.stock > 0 ? "outline" : "destructive")} className="text-[8px] h-4">
                          {product.stock > 0 ? (product.stock > 5 ? 'IN STOCK' : 'LOW STOCK') : 'SOLD OUT'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {product.serials.length > 0 ? (
                            product.serials.slice(0, 1).map(s => (
                              <Badge key={s} variant="outline" className="text-[9px] font-mono">{s}</Badge>
                            ))
                          ) : <span className="text-[10px] italic opacity-50">Empty</span>}
                          {product.serials.length > 1 && <span className="text-[10px] font-bold">+{product.serials.length - 1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ProductFormDialog mode="edit" product={product}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                            <Edit size={14} />
                          </Button>
                        </ProductFormDialog>
                      </td>
                    </tr>
                  ))}
                  {categoryProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                        No products found in this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Historical Stock Ledger
              </h3>
              <Badge variant="outline">Recorded Movements</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4 text-right">Qty Change</th>
                    <th className="px-6 py-4">Ledger Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movements
                    .filter(m => categoryProducts.some(p => p.id === m.product_id))
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((movement) => (
                      <tr key={movement.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {format(new Date(movement.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 font-medium">{movement.product_name}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={movement.movement_type === 'IN' ? 'outline' : 'destructive'}
                            className="gap-1"
                          >
                            {movement.movement_type === 'IN' ? <Plus size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                            {movement.movement_type}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${movement.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground italic">
                          {movement.reason || "Operational movement"}
                        </td>
                      </tr>
                    ))}
                  {movements.filter(m => categoryProducts.some(p => p.id === m.product_id)).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                        No movement history recorded for this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">DEPARTMENTS & SECTIONS</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Info size={14} className="text-primary" />
            Manage store sections, ledger tracking, and inventory rules.
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              <Plus size={18} />
              New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Department</DialogTitle>
              <DialogDescription>
                Categorize your enterprise products for better ledger tracking.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category Name</Label>
                  <Input
                    id="name"
                    value={newCat.name}
                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder="e.g. Luxury Perfumes"
                    className="h-12 border-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Input
                    id="desc"
                    value={newCat.description}
                    onChange={e => setNewCat({ ...newCat, description: e.target.value })}
                    placeholder="Tracking for high-end scents"
                    className="h-12 border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-muted/50 transition-all hover:bg-muted">
                    <input
                      type="checkbox"
                      id="has_expiry"
                      checked={newCat.has_expiry}
                      onChange={e => setNewCat({ ...newCat, has_expiry: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <Label htmlFor="has_expiry" className="text-xs font-bold cursor-pointer">Expiry Tracking</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-muted/50 transition-all hover:bg-muted">
                    <input
                      type="checkbox"
                      id="has_serials"
                      checked={newCat.has_serials}
                      onChange={e => setNewCat({ ...newCat, has_serials: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <Label htmlFor="has_serials" className="text-xs font-bold cursor-pointer">Serial Numbers</Label>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Icon</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {['tag', 'smartphone', 'apple', 'sparkles', 'shirt'].map(icon => (
                      <Button
                        key={icon}
                        type="button"
                        variant={newCat.icon === icon ? "secondary" : "outline"}
                        className={`h-12 w-full transition-all ${newCat.icon === icon ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => setNewCat({ ...newCat, icon })}
                      >
                        <CategoryIcon iconName={icon} className={newCat.icon === icon ? 'text-primary' : 'text-muted-foreground'} />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                  {loading ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((category, index) => (
          <motion.div
            key={category.id}
            className="glass-card flex flex-col h-full hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setSelectedCategory(category as any)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-6 relative">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-all group-hover:scale-110 shadow-inner">
                  <CategoryIcon iconName={category.icon} className="text-primary w-6 h-6" />
                </div>
                <div className="flex gap-1 absolute right-0 top-0">
                  {category.has_expiry && <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_5px_rgba(245,158,11,0.5)]" title="Expiry Tracking Active" />}
                  {category.has_serials && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]" title="Serial Tracking Active" />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 backdrop-blur-sm border border-border/50 ml-1">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(category as any);
                        }}
                      >
                        <Edit size={14} className="text-primary" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-danger cursor-pointer py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(category as any);
                        }}
                      >
                        <Trash2 size={14} /> Delete Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                {category.description || "Active department tracking products and movements."}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active SKUs</span>
                  <div className="flex items-center gap-2">
                    <Hash size={12} className="text-primary/50" />
                    <span className="text-lg font-black">{category.productCount}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Stock</span>
                  <div className="flex items-center gap-2">
                    <Package size={12} className="text-success/50" />
                    <span className="text-lg font-black text-success">{category.totalStock.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border mt-auto flex items-center justify-between">
              <div className="flex gap-2">
                {category.outOfStock > 0 && (
                  <Badge variant="destructive" className="text-[9px] font-bold animate-pulse">
                    {category.outOfStock} OUT
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] font-medium bg-background/50">
                  LEDGER ACTIVE
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold uppercase tracking-widest gap-1 h-7 px-2 hover:bg-primary hover:text-white transition-all"
              >
                Intell <TrendingUp size={10} />
              </Button>
            </div>
          </motion.div>
        ))}

        {/* Add New Card */}
        <motion.button
          className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[250px] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <Plus size={32} />
          </div>
          <p className="font-bold text-lg">Add New Section</p>
          <p className="text-xs mt-1 text-center max-w-[150px]">Create custom inventory rules and tracking</p>
        </motion.button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Department</DialogTitle>
            <DialogDescription>
              Update the details for this store section.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editCat.name}
                  onChange={e => setEditCat({ ...editCat, name: e.target.value })}
                  className="h-12 border-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Input
                  id="edit-desc"
                  value={editCat.description}
                  onChange={e => setEditCat({ ...editCat, description: e.target.value })}
                  className="h-12 border-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-muted/50 transition-all hover:bg-muted">
                  <input
                    type="checkbox"
                    id="edit_has_expiry"
                    checked={editCat.has_expiry}
                    onChange={e => setEditCat({ ...editCat, has_expiry: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="edit_has_expiry" className="text-xs font-bold cursor-pointer">Expiry Tracking</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border bg-muted/50 transition-all hover:bg-muted">
                  <input
                    type="checkbox"
                    id="edit_has_serials"
                    checked={editCat.has_serials}
                    onChange={e => setEditCat({ ...editCat, has_serials: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="edit_has_serials" className="text-xs font-bold cursor-pointer">Serial Numbers</Label>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Icon</Label>
                <div className="grid grid-cols-5 gap-3">
                  {['tag', 'smartphone', 'apple', 'sparkles', 'shirt'].map(icon => (
                    <Button
                      key={icon}
                      type="button"
                      variant={editCat.icon === icon ? "secondary" : "outline"}
                      className={`h-12 w-full transition-all ${editCat.icon === icon ? 'border-primary ring-2 ring-primary/20' : ''}`}
                      onClick={() => setEditCat({ ...editCat, icon })}
                    >
                      <CategoryIcon iconName={icon} className={editCat.icon === icon ? 'text-primary' : 'text-muted-foreground'} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-danger">Delete Department?</DialogTitle>
            <DialogDescription className="py-2 text-base">
              Are you sure you want to delete <strong className="text-foreground">{categoryToDelete?.name}</strong>?
              This will un-categorize all products currently assigned to this department. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              className="w-full sm:w-auto font-bold"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};


export default Categories;
