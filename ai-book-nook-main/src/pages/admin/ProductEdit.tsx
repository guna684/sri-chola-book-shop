import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Loader2, Upload, X, Search } from 'lucide-react';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);
    const [image, setImage] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [featured, setFeatured] = useState(false);
    const [bestseller, setBestseller] = useState(false);

    const [pages, setPages] = useState('');
    const [language, setLanguage] = useState('');
    const [publishedDate, setPublishedDate] = useState('');
    const [publisher, setPublisher] = useState('');
    const [genre, setGenre] = useState('');

    const [pastedDetails, setPastedDetails] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const handlePasteFill = () => {
        if (!pastedDetails) return;

        const lines = pastedDetails.split('\n');
        lines.forEach((line) => {
            if (!line.includes(':')) return;

            const [key, ...rest] = line.split(':');
            const field = key.trim().toLowerCase();
            const value = rest.join(':').trim();

            if (!value) return;

            switch (field) {
                case 'title':
                    setTitle(value);
                    break;
                case 'author':
                    setAuthor(value);
                    break;
                case 'category':
                    setCategory(value);
                    break;
                case 'pages':
                    setPages(value);
                    break;
                case 'language':
                    setLanguage(value);
                    break;
                case 'published date':
                    let dateVal = value;
                    if (dateVal.length === 4) dateVal += '-01-01';
                    else if (dateVal.length === 7) dateVal += '-01';
                    if (dateVal.length >= 10) {
                        setPublishedDate(dateVal.substring(0, 10));
                    } else {
                        setPublishedDate(dateVal);
                    }
                    break;
                case 'publisher':
                    setPublisher(value);
                    break;
                case 'genre':
                    setGenre(value);
                    break;
                default:
                    break;
            }
        });

        toast.success('Book details parsed and filled');
    };

    useEffect(() => {
        if (!user || (user && !user.isAdmin)) {
            // navigate('/login'); // Do not navigate here, let the second check handle it or protect route
            // Actually, usually we redirect if not admin.
        }

        const fetchProduct = async () => {
            if (!id) return;
            try {
                const { data } = await api.get(`/api/books/${id}`);
                setTitle(data.title);
                setAuthor(data.author);
                setPrice(data.price);
                setOriginalPrice(data.originalPrice || 0);
                setDescription(data.description);
                setCategory(data.category);
                setImage(data.coverImage); // Backend uses 'coverImage'
                setCountInStock(data.stock); // Backend uses 'stock'
                setFeatured(data.featured);
                setBestseller(data.bestseller);

                setPages(data.pages || '');
                setLanguage(data.language || '');
                if (data.publishedDate) {
                    setPublishedDate(data.publishedDate.split('T')[0]);
                } else {
                    setPublishedDate('');
                }
                setPublisher(data.publisher || '');
                setGenre(data.genre || '');
                setLoading(false);
            } catch (error) {
                toast.error('Failed to fetch product');
                navigate('/admin/productlist');
                setLoading(false);
            }
        };

        if (user && user.isAdmin) {
            fetchProduct();
        } else if (!user) {
            navigate('/login');
        }
    }, [id, user, navigate]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only JPEG, PNG, and WebP images are allowed');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image to server
    const uploadImage = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            const { data } = await api.post('/api/upload/book-image', formData, config);
            toast.success('Image uploaded successfully');
            return data.filePath;
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Image upload failed');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingUpdate(true);
        try {
            // Custom validation: Ensure at least one image source is provided
            if (!selectedFile && !image) {
                toast.error('Please upload a book cover image');
                setLoadingUpdate(false);
                return;
            }

            // Upload image if a file is selected
            let uploadedImagePath = null;
            if (selectedFile) {
                uploadedImagePath = await uploadImage();
                if (!uploadedImagePath) {
                    // Upload failed, stop submission
                    setLoadingUpdate(false);
                    return;
                }
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            const payload = {
                title,
                author,
                price,
                originalPrice,
                description,
                category,
                coverImage: uploadedImagePath || image, // Prioritize uploaded image
                stock: countInStock, // Map 'countInStock' state to 'stock' for backend
                featured,
                bestseller,

                pages,
                language,
                publishedDate,
                publisher,
                genre,
            };

            const { data } = await api.put(
                `/api/books/${id}`,
                payload,
                config
            );

            toast.success('Product updated successfully');

            // Navigate back to product list which will auto-refresh
            navigate('/admin/productlist');
        } catch (error: any) {
            console.error('Update error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Update failed';
            toast.error(`Failed to update product: ${errorMessage}`);
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin.products.editProduct')} | Sri Chola Book Shop</title>
            </Helmet>

            <div className="max-w-2xl mx-auto">
                <Link to="/admin/productlist" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ChevronLeft className="h-4 w-4" /> {t('admin.common.back')}
                </Link>

                <h1 className="text-3xl font-bold font-serif mb-8">{t('admin.products.editProduct')}</h1>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <form onSubmit={submitHandler} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">

                        {/* Paste Book Details Section */}
                        <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg mb-6 space-y-4">
                            <Label htmlFor="pasteDetails">Paste Book Details</Label>
                            <Textarea
                                id="pasteDetails"
                                value={pastedDetails}
                                onChange={(e) => setPastedDetails(e.target.value)}
                                placeholder="Title: Astrology Research Collection - Vol 1&#10;Author: Sunil John&#10;Category: Astrology / Spiritual Studies&#10;Pages: 299&#10;Language: English&#10;Published Date: 2022&#10;Publisher: Saptarishis Publications&#10;Genre: Vedic Astrology / Research"
                                className="h-40 font-mono text-sm"
                            />
                            <Button
                                type="button"
                                onClick={handlePasteFill}
                                className="w-full md:w-auto"
                            >
                                Auto Fill
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t('admin.products.form.title')}</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter book title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">{t('admin.products.form.author')}</Label>
                                <Input
                                    id="author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Enter author name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">{t('admin.products.form.price')} (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                <Input
                                    id="originalPrice"
                                    type="number"
                                    value={originalPrice}
                                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">{t('admin.products.form.stock')}</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>



                        {/* File Upload Section */}
                        <div className="space-y-2 border-t pt-4">
                            <Label htmlFor="imageFile">{t('admin.products.form.uploadTitle')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="imageFile"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileSelect}
                                    className="flex-1"
                                />
                                {selectedFile && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setImagePreview('');
                                            const fileInput = document.getElementById('imageFile') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('admin.products.form.uploadHint')}
                            </p>
                            {imagePreview && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium mb-2">{t('admin.products.form.preview')}</p>
                                    <img
                                        src={imagePreview}
                                        alt="Upload Preview"
                                        className="w-32 h-48 object-cover rounded border"
                                    />
                                </div>
                            )}
                            {uploadingImage && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('admin.products.form.uploading')}
                                </div>
                            )}
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="category">{t('admin.products.form.category')}</Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pages">{t('admin.products.form.pages')}</Label>
                            <Input
                                id="pages"
                                type="number"
                                value={pages}
                                onChange={(e) => setPages(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">{t('admin.products.form.language')}</Label>
                                <Input
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="publishedDate">{t('admin.products.form.publishedDate')}</Label>
                                <Input
                                    id="publishedDate"
                                    type="date"
                                    value={publishedDate}
                                    onChange={(e) => setPublishedDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="publisher">Publisher</Label>
                                <Input
                                    id="publisher"
                                    value={publisher}
                                    onChange={(e) => setPublisher(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="genre">{t('admin.products.form.genre')}</Label>
                                <Input
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">{t('admin.products.form.description')}</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-32"
                                required
                            />
                        </div>

                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="featured"
                                    checked={featured}
                                    onCheckedChange={(checked) => setFeatured(checked as boolean)}
                                />
                                <Label htmlFor="featured">{t('admin.products.form.featuredProduct')}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="bestseller"
                                    checked={bestseller}
                                    onCheckedChange={(checked) => setBestseller(checked as boolean)}
                                />
                                <Label htmlFor="bestseller">{t('admin.products.form.isBestseller')}</Label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loadingUpdate}>
                            {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('admin.products.update')}
                        </Button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductEdit;
