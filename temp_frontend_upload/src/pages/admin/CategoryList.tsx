import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    bookCount: number;
}

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [createLoading, setCreateLoading] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            toast.error(t('admin.categories.fetchError'));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory) return;

        setCreateLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };

            let iconPath = '📚';
            if (iconFile) {
                const formData = new FormData();
                formData.append('image', iconFile);
                const { data: uploadData } = await api.post('/api/upload/category-icon', formData, {
                    headers: {
                        ...config.headers,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                iconPath = uploadData.filePath;
            }

            await api.post('/api/categories', {
                name: newCategory,
                icon: iconPath,
            }, config);
            
            toast.success(t('admin.categories.createSuccess'));
            setNewCategory('');
            setIconFile(null);
            setIconPreview(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.categories.createError'));
        } finally {
            setCreateLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIconFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await api.delete(`/api/categories/${id}`, config);
            toast.success(t('admin.categories.deleteSuccess'));
            fetchCategories();
        } catch (error) {
            toast.error(t('admin.categories.deleteError'));
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin.categories.title')} | Admin</title>
            </Helmet>
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" /> {t('admin.common.back')}
                    </Link>
                    <h1 className="text-3xl font-bold font-serif">{t('admin.categories.manage')}</h1>
                </div>

                {/* Create Form */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t('admin.categories.addNew')}</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('admin.categories.form.name')}</label>
                                <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required placeholder="e.g. Fiction" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('admin.categories.form.icon')}</label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {iconPreview && (
                                        <div className="h-10 w-10 rounded border border-border overflow-hidden bg-muted flex items-center justify-center">
                                            <img src={iconPreview} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button type="submit" disabled={createLoading} className="w-full md:w-auto">
                            {createLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                            {t('admin.common.add')}
                        </Button>
                    </form>
                </div>

                {/* List */}
                {loading ? <div>{t('admin.common.loading')}</div> : (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin.categories.table.icon')}</TableHead>
                                    <TableHead>{t('admin.categories.table.name')}</TableHead>
                                    <TableHead>{t('admin.categories.table.books')}</TableHead>
                                    <TableHead className="text-right">{t('admin.categories.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell>
                                            {cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? (
                                                <div className="h-10 w-10 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                                                    <img 
                                                        src={cat.icon.startsWith('/') ? `${import.meta.env.VITE_API_URL || ''}${cat.icon}` : cat.icon} 
                                                        alt={cat.name} 
                                                        className="h-full w-full object-cover" 
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=📚';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-2xl">{cat.icon || '📚'}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{t(`categories.${cat.slug}`, cat.name)}</TableCell>
                                        <TableCell>{cat.bookCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {t('admin.categories.noCategories')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CategoryList;
