import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Edit, IndianRupee, Search, Trash2, Eye, Loader2, Package } from 'lucide-react';
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

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

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

    return (
        <AdminLayout>
            <Helmet>
                <title>Admin Orders | Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <h1 className="text-3xl font-bold font-serif mb-6">{t('admin.orders.title')}</h1>

                {/* Search Bar */}
                <div className="relative mb-4 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
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
                                {orders
                                    .filter((order: any) => {
                                        if (!searchTerm.trim()) return true;
                                        return order._id.toLowerCase().includes(searchTerm.toLowerCase());
                                    })
                                    .map((order: any) => (
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
                                    ))}
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
