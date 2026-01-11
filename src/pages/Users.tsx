import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Users as UsersIcon, UserPlus, Shield, ShieldCheck, Trash2, MoreVertical, Mail, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Users = () => {
    const [userRole, setUserRole] = useState('Admin');
    const [users, setUsers] = useState<any[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role) setUserRole(role);

        const savedUsers = localStorage.getItem('system_users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        } else {
            const initialUsers = [
                { id: '1', name: 'Alice Johnson', email: 'superadmin@dreamshub.com', password: 'password', role: 'SuperAdmin', status: 'Active' },
                { id: '2', name: 'Bob Smith', email: 'admin@dreamshub.com', password: 'password', role: 'Admin', status: 'Active' },
            ];
            setUsers(initialUsers);
            localStorage.setItem('system_users', JSON.stringify(initialUsers));
        }
    }, []);

    const saveUsers = (updatedUsers: any[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    };

    const handleDeleteUser = (id: string | number) => {
        if (userRole !== 'SuperAdmin') return toast.error("Only SuperAdmins can delete accounts");
        const updated = users.filter(u => u.id !== id);
        saveUsers(updated);
        toast.success("User account deactivated and removed.");
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            role: formData.get('role') as string,
            status: 'Active'
        };
        saveUsers([...users, newUser]);
        toast.success("New user account created successfully!");
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const updated = users.map(u => u.id === editingUser.id ? {
            ...u,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string || u.password,
            role: formData.get('role') as string
        } : u);
        saveUsers(updated);
        setIsEditDialogOpen(false);
        toast.success("User credentials updated successfully!");
    };

    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Control system access, create admins, and manage sales staff.
                    </p>
                </div>

                {userRole === 'SuperAdmin' && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <UserPlus size={18} />
                                Create New Admin
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card">
                            <DialogHeader>
                                <DialogTitle>Create Security Account</DialogTitle>
                                <DialogDescription>Assign roles and credentials to new staff members.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input name="name" placeholder="John Doe" required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input name="email" type="email" placeholder="john@company.com" required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Password</Label>
                                    <Input name="password" type="password" required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Access Role</Label>
                                    <Select name="role" defaultValue="Admin">
                                        <SelectTrigger className="bg-muted/30">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Admin">Main Admin</SelectItem>
                                            <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full">Initialize Account</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Level</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user, i) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <UsersIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'SuperAdmin' ? (
                                            <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                                                <ShieldCheck size={12} /> Super Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                {user.role === 'SalesStaff' ? 'Sales Staff' : 'Main Admin'}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Active</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="gap-2"><Mail size={14} /> Contact User</DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2"
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Key size={14} /> Edit Credentials
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-danger gap-2"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 size={14} /> Deactivate Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="glass-card">
                    <DialogHeader>
                        <DialogTitle>Edit User Credentials</DialogTitle>
                        <DialogDescription>Modify administrative access for {editingUser?.name}.</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleEditUser} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="name" defaultValue={editingUser.name} required className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (Username)</Label>
                                <Input name="email" type="email" defaultValue={editingUser.email} required className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password (Leave blank to keep current)</Label>
                                <Input name="password" type="password" className="bg-muted/30" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label>Access Role</Label>
                                <Select name="role" defaultValue={editingUser.role}>
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Main Admin</SelectItem>
                                        <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full">Update Credentials</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default Users;
