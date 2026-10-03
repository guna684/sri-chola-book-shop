import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
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

const ProductList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchBooks();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchBooks = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await api.get('/api/books', config);
            setBooks(data);
        } catch (error) {
            toast.error(t('admin.products.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm(t('admin.products.deleteConfirm'))) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                await api.delete(`/api/books/${id}`, config);
                toast.success(t('admin.products.deleteSuccess'));
                fetchBooks();
            } catch (error) {
                toast.error(t('admin.products.deleteError'));
            }
        }
    };

    const createBookHandler = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await api.post('/api/books', {}, config);
            toast.success(t('admin.products.sampleCreated'));
            navigate(`/admin/product/${data._id}/edit`);
        } catch (error) {
            toast.error(t('admin.products.createError'));
        }
    };

    const filteredProducts = books.filter((book: any) => {
        const search = searchTerm.toLowerCase();
        return (
            (book.title && book.title.toLowerCase().includes(search)) ||
            (book.author && book.author.toLowerCase().includes(search)) ||
            (book.category && book.category.toLowerCase().includes(search))
        );
    });

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin.products.title')} | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-serif">{t('admin.products.title')}</h1>
                    <div className="flex gap-4 items-center">
                        <div className="relative w-80 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t('admin.products.searchPlaceholder')}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={createBookHandler} className="gap-2 shrink-0">
                            <Plus className="h-4 w-4" /> {t('admin.products.createProduct')}
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('admin.products.table.id')}</TableHead>
                                    <TableHead>{t('admin.products.table.name')}</TableHead>
                                    <TableHead>{t('admin.products.table.price')}</TableHead>
                                    <TableHead>{t('admin.products.table.stock')}</TableHead>
                                    <TableHead>{t('admin.products.table.category')}</TableHead>
                                    <TableHead>{t('admin.products.table.author')}</TableHead>
                                    <TableHead>{t('admin.products.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((book: any) => (
                                    <TableRow key={book._id}>
                                        <TableCell className="font-mono text-xs">{book._id}</TableCell>
                                        <TableCell>{book.title}</TableCell>
                                        <TableCell>₹{book.price}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${book.stock <= 20 ? 'bg-red-100 text-red-700' : book.stock <= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {book.stock ?? 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>{book.category}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/admin/product/${book._id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => deleteHandler(book._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductList;
