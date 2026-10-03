import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Edit, IndianRupee, Search, Trash2, Eye, Loader2, Package, Calendar, RotateCcw, Filter } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const COD_CHARGE_BADGE: Record<string, string> = {
    Pending: 'bg-orange-100 text-orange-700',
    Paid: 'bg-green-100 text-green-700',
    Waived: 'bg-gray-100 text-gray-600',
};

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Status Update Dialog State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    // COD Charge Management Dialog State
    const [codOrder, setCodOrder] = useState<any>(null);
    const [isCodDialogOpen, setIsCodDialogOpen] = useState(false);
    const [codChargeStatus, setCodChargeStatus] = useState('');
    const [codRemarks, setCodRemarks] = useState('');
    const [codChargeAmount, setCodChargeAmount] = useState('');
    const [codPaidAt, setCodPaidAt] = useState('');
    const [codDueDate, setCodDueDate] = useState('');
    const [savingCod, setSavingCod] = useState(false);

    // Delivery Details Update Dialog State
    const [deliveryOrder, setDeliveryOrder] = useState<any>(null);
    const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
    const [deliveryContact, setDeliveryContact] = useState('');
    const [deliveryPrice, setDeliveryPrice] = useState('');
    const [savingDelivery, setSavingDelivery] = useState(false);

    // View Order Details Dialog State
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    const handleViewDetails = async (orderId: string) => {
        setIsViewDialogOpen(true);
        setViewLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await api.get(`/api/orders/${orderId}`, config);
            setViewOrder(data);
        } catch (error) {
            toast.error('Failed to fetch order details');
            setIsViewDialogOpen(false);
        } finally {
            setViewLoading(false);
        }
    };

    // Open Delivery Details Dialog
    const openDeliveryDialog = (order: any) => {
        setDeliveryOrder(order);
        setDeliveryContact(order.shippingAddress?.deliveryContactNumber || '');
        setDeliveryPrice(order.shippingPrice?.toString() || '');
        setIsDeliveryDialogOpen(true);
    };

    // Save Delivery Details
    const saveDeliveryDetails = async () => {
        if (!deliveryOrder) return;

        setSavingDelivery(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${deliveryOrder._id}/shipping`, {
                shippingPrice: Number(deliveryPrice) || 0,
                deliveryContactNumber: deliveryContact || undefined,
                shippingNote: 'Updated by admin from orders page',
                updatedBy: 'admin'
            }, config);

            toast.success('Delivery details updated successfully');
            setIsDeliveryDialogOpen(false);
            fetchOrders(); // Refresh orders
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update delivery details');
        } finally {
            setSavingDelivery(false);
        }
    };

    // Helper to get translated status
    const getStatusLabel = (status: string) => {
        const key = status.toLowerCase().replace(/\s+/g, '');
        const normalizedKey = key === 'outfordelivery' ? 'outForDelivery' : key;
        const translationKey = `admin.orders.statuses.${normalizedKey}`;
        const translated = t(translationKey);
        return translated === translationKey ? status : translated;
    };

    const STATUS_OPTIONS = [
        'Pending', 'Confirmed', 'Processing', 'Packed',
        'Shipped', 'Out for Delivery', 'Delivered',
        'Cancelled', 'Returned', 'Refunded'
    ];

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchOrders();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await api.get('/api/orders', config);
            setOrders(data);
        } catch (error) {
            toast.error(t('admin.orders.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.delete(`/api/orders/${orderId}`, config);
            toast.success('Order deleted successfully');
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete order');
        }
    };

    // ── Status Update ──────────────────────────────────────────────────────────
    const handleEditStatus = (order: any) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsDialogOpen(true);
    };

    const saveStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${selectedOrder._id}/status`, { status: newStatus }, config);
            toast.success(t('admin.orders.statusUpdated'));
            setIsDialogOpen(false);
            fetchOrders();

            if (newStatus === 'Delivered') {
                window.dispatchEvent(new CustomEvent('orderDelivered', {
                    detail: { orderId: selectedOrder._id, status: newStatus }
                }));
                toast.info(t('admin.orders.codCharge.statusUpdated'));
            }
        } catch (error) {
            toast.error(t('admin.orders.updateError'));
        } finally {
            setUpdating(false);
        }
    };

    // ── COD Charge Management ──────────────────────────────────────────────────
    const handleManageCodCharge = (order: any) => {
        setCodOrder(order);
        setCodChargeStatus(order.cancellationChargeStatus ?? 'Pending');
        setCodRemarks(order.chargeRemarks ?? '');
        setCodChargeAmount(String(order.cancellationCharge ?? ''));
        setCodPaidAt(order.cancellationPaidAt ? new Date(order.cancellationPaidAt).toISOString().slice(0, 16) : '');
        setCodDueDate(order.cancellationDueDate ? new Date(order.cancellationDueDate).toISOString().slice(0, 16) : '');
        setIsCodDialogOpen(true);
    };

    const saveCodCharge = async () => {
        if (!codOrder) return;
        setSavingCod(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${codOrder._id}/cod-charge`, {
                cancellationChargeStatus: codChargeStatus,
                chargeRemarks: codRemarks,
                cancellationCharge: parseFloat(codChargeAmount),
                cancellationPaidAt: codPaidAt || undefined,
                cancellationDueDate: codDueDate || undefined,
            }, config);
            toast.success(t('admin.orders.codCharge.saveSuccess'));
            setIsCodDialogOpen(false);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('admin.orders.codCharge.saveError'));
        } finally {
            setSavingCod(false);
        }
    };

    // Helper to check if two dates are on the same calendar day
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    // Filter orders by search term, status, and date range
    const filteredOrders = orders.filter((order: any) => {
        // 1. Search filter
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            const orderIdMatch = order._id?.toLowerCase().includes(query);
            const userNameMatch = order.user?.name?.toLowerCase().includes(query);
            const userEmailMatch = order.user?.email?.toLowerCase().includes(query);
            const addressMatch = order.shippingAddress?.address?.toLowerCase().includes(query);
            const cityMatch = order.shippingAddress?.city?.toLowerCase().includes(query);
            const postalMatch = order.shippingAddress?.postalCode?.includes(query);
            const contactMatch = order.shippingAddress?.deliveryContactNumber?.includes(query);

            if (!orderIdMatch && !userNameMatch && !userEmailMatch && !addressMatch && !cityMatch && !postalMatch && !contactMatch) {
                return false;
            }
        }

        // 2. Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        // 3. Date filter
        if (!order.createdAt) return true;
        const orderDate = new Date(order.createdAt);
        if (isNaN(orderDate.getTime())) return true;

        const now = new Date();

        if (datePreset === 'today') {
            if (!isSameDay(orderDate, now)) return false;
        } else if (datePreset === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            if (!isSameDay(orderDate, yesterday)) return false;
        } else if (datePreset === 'last7days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            if (orderDate < sevenDaysAgo) return false;
        } else if (datePreset === 'last30days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            if (orderDate < thirtyDaysAgo) return false;
        } else if (datePreset === 'thisMonth') {
            if (orderDate.getFullYear() !== now.getFullYear() || orderDate.getMonth() !== now.getMonth()) {
                return false;
            }
        }

        // Custom Date Range (or if start/end date explicitly provided)
        if (startDate) {
            const [y, m, d] = startDate.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0, 0);
            if (orderDate < start) return false;
        }
        if (endDate) {
            const [y, m, d] = endDate.split('-').map(Number);
            const end = new Date(y, m - 1, d, 23, 59, 59, 999);
            if (orderDate > end) return false;
        }

        return true;
    });

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDatePreset('all');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = Boolean(
        searchTerm.trim() ||
        statusFilter !== 'all' ||
        datePreset !== 'all' ||
        startDate ||
        endDate
    );

    return (
        <AdminLayout>
            <Helmet>
                <title>Admin Orders | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                    <h1 className="text-3xl font-bold">{t('admin.orders.title')}</h1>
                    <div className="text-xs text-muted-foreground">
                        Total Orders: <span className="font-semibold text-foreground">{orders.length}</span>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Order ID, customer, city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {getStatusLabel(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter Dropdown */}
                        <div className="w-full md:w-52">
                            <Select
                                value={datePreset}
                                onValueChange={(val) => {
                                    setDatePreset(val);
                                    if (val !== 'custom') {
                                        setStartDate('');
                                        setEndDate('');
                                    }
                                }}
                            >
                                <SelectTrigger className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Filter by Date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Date: All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                                    <SelectItem value="thisMonth">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Date Range...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Custom Date Range Pickers (shown when 'custom' selected or dates entered) */}
                    {(datePreset === 'custom' || startDate || endDate) && (
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="start-date" className="text-xs text-muted-foreground whitespace-nowrap">From:</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setDatePreset('custom');
                                    }}
                                    className="w-40 h-9 text-xs"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="end-date" className="text-xs text-muted-foreground whitespace-nowrap">To:</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setDatePreset('custom');
                                    }}
                                    className="w-40 h-9 text-xs"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setDatePreset('all');
                                    }}
                                    className="h-9 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5 mr-1" /> Clear Dates
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Filter Summary & Quick Reset */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>
                            Showing <strong className="text-foreground">{filteredOrders.length}</strong> of <strong className="text-foreground">{orders.length}</strong> orders
                        </span>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" /> Reset All Filters
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div>{t('admin.common.loading')}</div>
                ) : (
                    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">{t('admin.orders.table.id')}</TableHead>

                                    <TableHead className="w-[150px]">Delivery Address</TableHead>
                                    <TableHead className="w-[120px]">{t('admin.orders.table.date')}</TableHead>
                                    <TableHead className="w-[120px]">{t('admin.orders.table.total')}</TableHead>
                                    <TableHead className="w-[120px]">{t('admin.orders.table.status')}</TableHead>
                                    <TableHead className="w-[120px]">{t('admin.orders.table.paid')}</TableHead>
                                    <TableHead className="w-[150px]">Delivery Contact</TableHead>
                                    <TableHead className="w-[120px]">{t('admin.orders.table.codCharge')}</TableHead>
                                    <TableHead className="w-[200px]">{t('admin.orders.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                            <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            <p className="font-medium">No orders found matching your filters</p>
                                            <p className="text-xs mt-1">Try adjusting the search query, date range, or status filter.</p>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleResetFilters}
                                                    className="mt-3 text-xs"
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" /> Clear All Filters
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order: any) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-mono text-xs">{order._id}</TableCell>

                                            <TableCell className="text-xs">
                                                {order.shippingAddress ? (
                                                    <div>
                                                        <p>{order.shippingAddress.address}</p>
                                                        <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                                    </div>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell>{order.createdAt.substring(0, 10)}</TableCell>
                                            <TableCell>₹{order.totalPrice}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {order.isPaid ? (
                                                    <div className="text-green-600 flex items-center gap-1">
                                                        <Check className="h-4 w-4" /> {order.paidAt?.substring(0, 10)}
                                                    </div>
                                                ) : (
                                                    <X className="h-4 w-4 text-red-500" />
                                                )}
                                            </TableCell>

                                            {/* Delivery Contact Column */}
                                            <TableCell>
                                                {order.shippingAddress?.deliveryContactNumber ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium text-green-700">{order.shippingAddress.deliveryContactNumber}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Not added</span>
                                                )}
                                            </TableCell>

                                            {/* COD Charge Column */}
                                            <TableCell>
                                                {order.cancellationType === 'COD' && order.cancellationCharge != null ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-sm font-semibold text-orange-700 dark:text-orange-400">
                                                            <IndianRupee className="h-3.5 w-3.5" />
                                                            {order.cancellationCharge.toFixed(2)}
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${COD_CHARGE_BADGE[order.cancellationChargeStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                                                            {order.cancellationChargeStatus}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1 h-8 px-2"
                                                            onClick={() => handleViewDetails(order._id)}
                                                        >
                                                            <Eye className="h-3 w-3" /> View Details
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1 h-8 px-2"
                                                            onClick={() => handleEditStatus(order)}
                                                        >
                                                            <Edit className="h-3 w-3" /> {t('admin.orders.table.update')}
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 h-8 px-2 text-blue-700 border-blue-300 hover:bg-blue-50"
                                                            onClick={() => openDeliveryDialog(order)}
                                                        >
                                                            📦 Delivery
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Delete
                                                        </Button>
                                                    </div>

                                                    {/* Manage COD Charge Button */}
                                                    {order.cancellationType === 'COD' && order.cancellationCharge != null && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 h-8 px-2 text-orange-700 border-orange-300 hover:bg-orange-50 w-full"
                                                            onClick={() => handleManageCodCharge(order)}
                                                        >
                                                            <IndianRupee className="h-3.5 w-3.5" /> {t('admin.orders.codCharge.update')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Status Update Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.orders.updateStatus')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('admin.orders.currentStatus')}: <span className="font-bold">{selectedOrder?.status}</span></Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">{t('admin.orders.newStatus')}</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.orders.selectStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {getStatusLabel(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updating}>{t('admin.common.cancel')}</Button>
                        <Button onClick={saveStatus} disabled={updating}>
                            {updating ? t('admin.orders.updating') : t('admin.orders.saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* COD Charge Management Dialog */}
            <Dialog open={isCodDialogOpen} onOpenChange={setIsCodDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-orange-500" />
                            {t('admin.orders.codCharge.manage')}
                        </DialogTitle>
                    </DialogHeader>

                    {codOrder && (
                        <div className="space-y-4 py-2">
                            {/* Order Summary */}
                            <div className="rounded-lg border border-border bg-secondary/20 p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin.orders.codCharge.summary')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin.orders.codCharge.orderId')}</span>
                                    <span className="font-mono text-xs">{codOrder._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin.orders.codCharge.customer')}</span>
                                    <span className="font-semibold">{codOrder.user?.name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin.orders.codCharge.total')}</span>
                                    <span className="font-semibold">₹{codOrder.totalPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin.orders.codCharge.cancelledOn')}</span>
                                    <span>{codOrder.cancelledAt ? new Date(codOrder.cancelledAt).toLocaleDateString() : '—'}</span>
                                </div>
                            </div>

                            {/* Charge Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="codChargeAmount">{t('admin.orders.codCharge.amount')}</Label>
                                <Input
                                    id="codChargeAmount"
                                    type="number"
                                    min={0}
                                    value={codChargeAmount}
                                    onChange={(e) => setCodChargeAmount(e.target.value)}
                                />
                            </div>

                            {/* Charge Status */}
                            <div className="space-y-2">
                                <Label htmlFor="codChargeStatus">{t('admin.orders.codCharge.status')}</Label>
                                <Select value={codChargeStatus} onValueChange={setCodChargeStatus}>
                                    <SelectTrigger id="codChargeStatus">
                                        <SelectValue placeholder={t('admin.orders.selectStatus')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">{t('admin.orders.statuses.pending')}</SelectItem>
                                        <SelectItem value="Paid">{t('admin.orders.statuses.paid')}</SelectItem>
                                        <SelectItem value="Waived">{t('admin.orders.statuses.waived')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {codChargeStatus === 'Paid' && (
                                <div className="space-y-2">
                                    <Label htmlFor="codPaidAt">{t('admin.orders.codCharge.paidOn')}</Label>
                                    <Input id="codPaidAt" type="datetime-local"
                                        value={codPaidAt} onChange={(e) => setCodPaidAt(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">{t('admin.orders.codCharge.paidOnHint')}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="codDueDate">{t('admin.orders.codCharge.dueDate')}</Label>
                                <Input id="codDueDate" type="datetime-local"
                                    value={codDueDate} onChange={(e) => setCodDueDate(e.target.value)} />
                                <p className="text-xs text-muted-foreground">{t('admin.orders.codCharge.dueDateHint')}</p>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <Label htmlFor="codRemarks">{t('admin.orders.codCharge.adminRemarks')}</Label>
                                <Textarea
                                    id="codRemarks"
                                    placeholder={t('admin.orders.codCharge.remarksPlaceholder')}
                                    value={codRemarks}
                                    onChange={(e) => setCodRemarks(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsCodDialogOpen(false)} disabled={savingCod}>
                            {t('admin.common.close') || 'Close'}
                        </Button>
                        <Button onClick={saveCodCharge} disabled={savingCod}>
                            {savingCod ? t('admin.common.saving') || 'Saving...' : t('admin.orders.saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delivery Details Update Dialog */}
            <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>📦 Update Delivery Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Order Info */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">Order ID: {deliveryOrder?._id?.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                                Customer: {deliveryOrder?.user?.name}
                            </p>
                        </div>

                        {/* Delivery Contact Number */}
                        <div className="space-y-2">
                            <Label htmlFor="deliveryContact">📞 Delivery Contact Number</Label>
                            <Input
                                id="deliveryContact"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={deliveryContact}
                                onChange={(e) => setDeliveryContact(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Contact number for delivery personnel
                            </p>
                        </div>

                        {/* Delivery Price */}
                        <div className="space-y-2">
                            <Label htmlFor="deliveryPrice">💰 Delivery Price (₹)</Label>
                            <Input
                                id="deliveryPrice"
                                type="number"
                                min={0}
                                step={0.01}
                                placeholder="0.00"
                                value={deliveryPrice}
                                onChange={(e) => setDeliveryPrice(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Current price: ₹{deliveryOrder?.shippingPrice || 0}
                            </p>
                        </div>

                        {/* Current Delivery Info */}
                        {(deliveryOrder?.shippingAddress?.deliveryContactNumber || deliveryOrder?.shippingPrice > 0) && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-2">Current Delivery Info:</p>
                                <div className="text-sm text-blue-800 space-y-1">
                                    {deliveryOrder?.shippingAddress?.deliveryContactNumber && (
                                        <p>📞 {deliveryOrder.shippingAddress.deliveryContactNumber}</p>
                                    )}
                                    {deliveryOrder?.shippingPrice > 0 && (
                                        <p>💰 ₹{deliveryOrder.shippingPrice}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)} disabled={savingDelivery}>
                            Cancel
                        </Button>
                        <Button onClick={saveDeliveryDetails} disabled={savingDelivery}>
                            {savingDelivery ? 'Saving...' : 'Update Delivery'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Order Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-serif">
                            <Eye className="h-5 w-5 text-primary" />
                            Order Details
                        </DialogTitle>
                    </DialogHeader>
                    {viewLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : viewOrder ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Order ID</p>
                                    <p className="font-mono font-medium">{viewOrder._id}</p>
                                </div>
                                <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Placed On</p>
                                    <p className="font-medium">{new Date(viewOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{viewOrder.user?.name} ({viewOrder.user?.email})</p>
                                </div>
                                <div className="space-y-1 bg-secondary/30 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block mt-1
                                        ${viewOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            viewOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {getStatusLabel(viewOrder.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden">
                                <div className="bg-muted px-4 py-2 border-b border-border">
                                    <h3 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Order Items</h3>
                                </div>
                                <div className="divide-y divide-border">
                                    {viewOrder.orderItems?.map((item: any, index: number) => (
                                        <div key={index} className="flex gap-4 p-4">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.qty} × ₹{item.price}</p>
                                            </div>
                                            <div className="font-bold">
                                                ₹{(item.qty * item.price).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-muted/30 p-4 border-t border-border space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Items Total:</span>
                                        <span>₹{viewOrder.itemsPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping:</span>
                                        <span>₹{viewOrder.shippingPrice?.toFixed(2)}</span>
                                    </div>
                                    {viewOrder.taxPrice > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax:</span>
                                            <span>₹{viewOrder.taxPrice?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {viewOrder.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>-₹{viewOrder.discountAmount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
                                        <span>Total:</span>
                                        <span className="text-lg">₹{viewOrder.totalPrice?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>{viewOrder.shippingAddress?.address}</p>
                                        <p>{viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.postalCode}</p>
                                        <p>{viewOrder.shippingAddress?.country}</p>
                                        {viewOrder.shippingAddress?.deliveryContactNumber && (
                                            <p className="pt-2 text-foreground">📞 {viewOrder.shippingAddress.deliveryContactNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="border border-border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Payment Info</h3>
                                    <div className="text-sm text-muted-foreground space-y-2">
                                        <p>Method: <span className="font-medium text-foreground">{viewOrder.paymentMethod}</span></p>
                                        <p>
                                            Status: {viewOrder.isPaid ? (
                                                <span className="text-green-600 font-medium">Paid on {viewOrder.paidAt?.substring(0, 10)}</span>
                                            ) : (
                                                <span className="text-red-500 font-medium">Not Paid</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            Order not found
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout >
    );
};

export default OrderList;
