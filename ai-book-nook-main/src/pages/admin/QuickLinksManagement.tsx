import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
    Link as LinkIcon, 
    Settings, 
    Plus, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    GripVertical, 
    Eye, 
    EyeOff,
    ExternalLink,
    Tag,
    ArrowUp,
    ArrowDown,
    Loader2
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface QuickLink {
    id: number;
    title: string;
    path: string;
    icon: string;
    order: number;
    active: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    order: number;
    active: boolean;
}

const QuickLinksManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'links' | 'categories'>('links');
    const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showAddLink, setShowAddLink] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newLink, setNewLink] = useState<Partial<QuickLink>>({ title: '', path: '', icon: 'Link', active: true });
    const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: '', slug: '', active: true });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const [linksRes, categoriesRes] = await Promise.all([
                api.get('/api/admin/quick-links', config),
                api.get('/api/admin/categories', config)
            ]);
            setQuickLinks(linksRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // --- Quick Links CRUD ---
    const saveQuickLink = async (link: QuickLink) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/admin/quick-links/${link.id}`, link, config);
            toast.success('Quick link updated successfully');
            setEditingLink(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update quick link');
        }
    };

    const addQuickLink = async () => {
        if (!newLink.title || !newLink.path) {
            toast.error('Title and path are required');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.post('/api/admin/quick-links', newLink, config);
            toast.success('Quick link added successfully');
            setNewLink({ title: '', path: '', icon: 'Link', active: true });
            setShowAddLink(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to add quick link');
        }
    };

    const deleteQuickLink = async (id: number) => {
        if (!confirm('Are you sure you want to delete this quick link?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.delete(`/api/admin/quick-links/${id}`, config);
            toast.success('Quick link deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete quick link');
        }
    };

    const toggleLinkActive = async (link: QuickLink) => {
        await saveQuickLink({ ...link, active: !link.active });
    };

    const moveLinkOrder = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= quickLinks.length) return;

        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const linkA = { ...quickLinks[index], order: quickLinks[newIndex].order };
        const linkB = { ...quickLinks[newIndex], order: quickLinks[index].order };

        try {
            await Promise.all([
                api.put(`/api/admin/quick-links/${linkA.id}`, linkA, config),
                api.put(`/api/admin/quick-links/${linkB.id}`, linkB, config)
            ]);
            fetchData();
        } catch (error) {
            toast.error('Failed to reorder');
        }
    };

    // --- Categories CRUD ---
    const saveCategory = async (category: Category) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/admin/categories/${category.id}`, category, config);
            toast.success('Category updated successfully');
            setEditingCategory(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const addCategory = async () => {
        if (!newCategory.name || !newCategory.slug) {
            toast.error('Name and slug are required');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.post('/api/admin/categories', newCategory, config);
            toast.success('Category added successfully');
            setNewCategory({ name: '', slug: '', active: true });
            setShowAddCategory(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to add category');
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.delete(`/api/admin/categories/${id}`, config);
            toast.success('Category deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const toggleCategoryActive = async (category: Category) => {
        await saveCategory({ ...category, active: !category.active });
    };

    const moveCategoryOrder = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const catA = { ...categories[index], order: categories[newIndex].order };
        const catB = { ...categories[newIndex], order: categories[index].order };

        try {
            await Promise.all([
                api.put(`/api/admin/categories/${catA.id}`, catA, config),
                api.put(`/api/admin/categories/${catB.id}`, catB, config)
            ]);
            fetchData();
        } catch (error) {
            toast.error('Failed to reorder');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Helmet>
                <title>Quick Links & Categories Management | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-foreground mb-2">Quick Links & Categories Management</h1>
                    <p className="text-muted-foreground">Manage navigation links and book categories</p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-muted/50 rounded-lg p-1 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('links')}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                            activeTab === 'links'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <LinkIcon className="h-4 w-4" />
                        Quick Links
                        <Badge variant="secondary" className="ml-1">{quickLinks.length}</Badge>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                            activeTab === 'categories'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Tag className="h-4 w-4" />
                        Categories
                        <Badge variant="secondary" className="ml-1">{categories.length}</Badge>
                    </button>
                </div>

                {/* ============== QUICK LINKS TAB ============== */}
                {activeTab === 'links' && (
                    <motion.div
                        key="links"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Add New Link Button */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Navigation Quick Links</h2>
                            <Button
                                onClick={() => setShowAddLink(!showAddLink)}
                                className="flex items-center gap-2"
                                variant={showAddLink ? 'outline' : 'default'}
                            >
                                {showAddLink ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {showAddLink ? 'Cancel' : 'Add Link'}
                            </Button>
                        </div>

                        {/* Add New Link Form */}
                        <AnimatePresence>
                            {showAddLink && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Card className="border-primary/30 border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Plus className="h-5 w-5 text-primary" />
                                                Add New Quick Link
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="new-link-title">Title *</Label>
                                                    <Input
                                                        id="new-link-title"
                                                        placeholder="e.g., About Us"
                                                        value={newLink.title}
                                                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="new-link-path">Path *</Label>
                                                    <Input
                                                        id="new-link-path"
                                                        placeholder="e.g., /about"
                                                        value={newLink.path}
                                                        onChange={(e) => setNewLink({ ...newLink, path: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="new-link-icon">Icon Name</Label>
                                                    <Input
                                                        id="new-link-icon"
                                                        placeholder="e.g., Info, Mail, Truck"
                                                        value={newLink.icon}
                                                        onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button onClick={addQuickLink} className="flex items-center gap-2">
                                                    <Save className="h-4 w-4" />
                                                    Save Link
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Links List */}
                        <div className="space-y-3">
                            {quickLinks.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground">No quick links yet. Add your first link above.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                quickLinks.map((link, index) => (
                                    <motion.div
                                        key={link.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className={`transition-all ${!link.active ? 'opacity-50' : ''} ${editingLink?.id === link.id ? 'ring-2 ring-primary' : ''}`}>
                                            <CardContent className="p-4">
                                                {editingLink?.id === link.id ? (
                                                    /* Edit Mode */
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <Label>Title</Label>
                                                                <Input
                                                                    value={editingLink.title}
                                                                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Path</Label>
                                                                <Input
                                                                    value={editingLink.path}
                                                                    onChange={(e) => setEditingLink({ ...editingLink, path: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Icon</Label>
                                                                <Input
                                                                    value={editingLink.icon}
                                                                    onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => setEditingLink(null)}>
                                                                <X className="h-4 w-4 mr-1" /> Cancel
                                                            </Button>
                                                            <Button size="sm" onClick={() => saveQuickLink(editingLink)}>
                                                                <Save className="h-4 w-4 mr-1" /> Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View Mode */
                                                    <div className="flex items-center gap-4">
                                                        {/* Reorder Buttons */}
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => moveLinkOrder(index, 'up')}
                                                                disabled={index === 0}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                            >
                                                                <ArrowUp className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveLinkOrder(index, 'down')}
                                                                disabled={index === quickLinks.length - 1}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                            >
                                                                <ArrowDown className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Icon */}
                                                        <div className="bg-primary/10 p-2.5 rounded-lg">
                                                            <LinkIcon className="h-5 w-5 text-primary" />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-foreground">{link.title}</h3>
                                                                <Badge variant={link.active ? 'default' : 'secondary'} className="text-xs">
                                                                    {link.active ? 'Active' : 'Hidden'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <ExternalLink className="h-3 w-3" />
                                                                {link.path}
                                                            </p>
                                                        </div>

                                                        {/* Icon Name Badge */}
                                                        <Badge variant="outline" className="text-xs hidden sm:flex">
                                                            icon: {link.icon}
                                                        </Badge>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => toggleLinkActive(link)}
                                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                                title={link.active ? 'Hide link' : 'Show link'}
                                                            >
                                                                {link.active ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingLink({ ...link })}
                                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                                title="Edit link"
                                                            >
                                                                <Edit2 className="h-4 w-4 text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteQuickLink(link.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Delete link"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ============== CATEGORIES TAB ============== */}
                {activeTab === 'categories' && (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Add New Category Button */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Book Categories</h2>
                            <Button
                                onClick={() => setShowAddCategory(!showAddCategory)}
                                className="flex items-center gap-2"
                                variant={showAddCategory ? 'outline' : 'default'}
                            >
                                {showAddCategory ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {showAddCategory ? 'Cancel' : 'Add Category'}
                            </Button>
                        </div>

                        {/* Add New Category Form */}
                        <AnimatePresence>
                            {showAddCategory && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Card className="border-primary/30 border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Plus className="h-5 w-5 text-primary" />
                                                Add New Category
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="new-cat-name">Category Name *</Label>
                                                    <Input
                                                        id="new-cat-name"
                                                        placeholder="e.g., Science Fiction"
                                                        value={newCategory.name}
                                                        onChange={(e) => setNewCategory({
                                                            ...newCategory,
                                                            name: e.target.value,
                                                            slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="new-cat-slug">Slug *</Label>
                                                    <Input
                                                        id="new-cat-slug"
                                                        placeholder="e.g., science-fiction"
                                                        value={newCategory.slug}
                                                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button onClick={addCategory} className="flex items-center gap-2">
                                                    <Save className="h-4 w-4" />
                                                    Save Category
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Categories List */}
                        <div className="space-y-3">
                            {categories.length === 0 ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground">No categories yet. Add your first category above.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                categories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className={`transition-all ${!category.active ? 'opacity-50' : ''} ${editingCategory?.id === category.id ? 'ring-2 ring-primary' : ''}`}>
                                            <CardContent className="p-4">
                                                {editingCategory?.id === category.id ? (
                                                    /* Edit Mode */
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>Name</Label>
                                                                <Input
                                                                    value={editingCategory.name}
                                                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Slug</Label>
                                                                <Input
                                                                    value={editingCategory.slug}
                                                                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                                                                <X className="h-4 w-4 mr-1" /> Cancel
                                                            </Button>
                                                            <Button size="sm" onClick={() => saveCategory(editingCategory)}>
                                                                <Save className="h-4 w-4 mr-1" /> Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View Mode */
                                                    <div className="flex items-center gap-4">
                                                        {/* Reorder Buttons */}
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => moveCategoryOrder(index, 'up')}
                                                                disabled={index === 0}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                            >
                                                                <ArrowUp className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveCategoryOrder(index, 'down')}
                                                                disabled={index === categories.length - 1}
                                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                            >
                                                                <ArrowDown className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Icon */}
                                                        <div className="bg-orange-500/10 p-2.5 rounded-lg">
                                                            <Tag className="h-5 w-5 text-orange-600" />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-foreground">{category.name}</h3>
                                                                <Badge variant={category.active ? 'default' : 'secondary'} className="text-xs">
                                                                    {category.active ? 'Active' : 'Hidden'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                                slug: {category.slug}
                                                            </p>
                                                        </div>

                                                        {/* Order Badge */}
                                                        <Badge variant="outline" className="text-xs hidden sm:flex">
                                                            #{category.order}
                                                        </Badge>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => toggleCategoryActive(category)}
                                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                                title={category.active ? 'Hide category' : 'Show category'}
                                                            >
                                                                {category.active ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCategory({ ...category })}
                                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                                title="Edit category"
                                                            >
                                                                <Edit2 className="h-4 w-4 text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteCategory(category.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Delete category"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
};

export default QuickLinksManagement;
