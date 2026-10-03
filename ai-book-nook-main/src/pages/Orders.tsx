import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, Clock, IndianRupee, AlertTriangle, FileDown, CheckCircle2, Phone } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from 'sonner';
import RefundPreviewModal from '@/components/orders/RefundPreviewModal';
import CODCancelModal from '@/components/orders/CODCancelModal';
import CancellationChargePaymentModal from '@/components/orders/CancellationChargePaymentModal';
import { useTranslation } from 'react-i18next';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
    _id: string;
    title: string;
    qty: number;
    price: number;
}

interface Order {
    _id: string;
    status: string;
    paymentMethod: string;
    totalPrice: number;
    createdAt: string;
    cancelledAt?: string;
    orderItems: OrderItem[];
    refundStatus?: string;
    refundDetails?: {
        refundAmount?: number;
        refundMethod?: string;
        estimatedDays?: string;
        transactionId?: string;
        adminNotes?: string;
    };
    shippingPrice: number;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
        deliveryContactNumber?: string;
    };
    // COD Cancellation fields
    cancellationType?: string;
    cancellationCharge?: number | null;
    cancellationChargeStatus?: string;
    cancellationPaymentMethod?: string;
    cancellationDueDate?: string;
    cancellationRequestedAt?: string;
    chargeRemarks?: string;
    // Payment fields
    isPaid?: boolean;
    paidAt?: string;
    cancellationPaidAt?: string;
}

interface RefundPreview {
    originalAmount: number;
    cancellationFee: number;
    refundAmount: number;
    refundMethod: string;
    estimatedDays: string;
    message: string;
}

interface CODPreview {
    paymentType: 'COD';
    orderTotal: number;
    codHandlingCharge: number;
    cancellationCharge: number;
    totalCharges: number;
    message: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const isCOD = (order: Order) =>
    ['cod', 'cash', 'COD', 'Cash on Delivery'].some(
        (v) => order.paymentMethod?.toLowerCase().includes(v.toLowerCase())
    );

// Payment status: COD = paid only on Delivered; Razorpay = use isPaid flag
const getPaymentStatus = (order: Order): { label: string; paid: boolean } => {
    if (isCOD(order)) {
        const paid = order.status === 'Delivered';
        return { label: paid ? 'Paid (COD)' : 'Pay on Delivery', paid };
    }
    return {
        label: order.isPaid
            ? `Paid${order.paidAt ? ' · ' + new Date(order.paidAt).toLocaleDateString() : ''}`
            : 'Unpaid',
        paid: !!order.isPaid,
    };
};

const canCancel = (order: Order) => {
    const nonCancellable = ['Shipped', 'Delivered', 'Cancelled', 'Cancellation Pending'];
    if (nonCancellable.includes(order.status)) return false;
    if (order.cancellationChargeStatus === 'Paid') return false;
    return true;
};

function dueDateLabel(iso?: string): string {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return 'Due date passed';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m remaining`;
}

// ── Component ──────────────────────────────────────────────────────────────────
const Orders = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Prepaid Refund modal state ──
    const [refundPreview, setRefundPreview] = useState<RefundPreview | null>(null);
    const [prepaidModalOpen, setPrepaidModalOpen] = useState(false);
    const [prepaidLoadingId, setPrepaidLoadingId] = useState<string | null>(null);
    const [selectedPrepaidId, setSelectedPrepaidId] = useState<string | null>(null);

    // ── COD Cancel modal state ──
    const [codPreview, setCodPreview] = useState<CODPreview | null>(null);
    const [codModalOpen, setCodModalOpen] = useState(false);
    const [codLoadingId, setCodLoadingId] = useState<string | null>(null);
    const [selectedCodOrderId, setSelectedCodOrderId] = useState<string | null>(null);

    // ── Cancellation Charge Payment modal state ──
    const [chargePayModalOpen, setChargePayModalOpen] = useState(false);
    const [payModalOrderId, setPayModalOrderId] = useState<string | null>(null);
    const [payModalCharge, setPayModalCharge] = useState(0);
    const [payModalDueDate, setPayModalDueDate] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await api.get('/api/orders/myorders', config);
            setOrders(data);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // ── Cancel Click ──────────────────────────────────────────────────────────
    const handleCancelClick = async (order: Order) => {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };

        if (isCOD(order)) {
            setCodLoadingId(order._id);
            setCodModalOpen(true);
            setSelectedCodOrderId(order._id);
            try {
                const { data } = await api.get(`/api/orders/${order._id}/cod-cancel-preview`, config);
                setCodPreview(data);
            } catch {
                toast.error('Failed to load cancellation preview');
                setCodModalOpen(false);
            } finally {
                setCodLoadingId(null);
            }
        } else {
            setPrepaidLoadingId(order._id);
            setPrepaidModalOpen(true);
            setSelectedPrepaidId(order._id);
            try {
                const { data } = await api.get(`/api/orders/${order._id}/refund-preview`, config);
                setRefundPreview(data);
            } catch {
                toast.error('Failed to load refund preview');
                setPrepaidModalOpen(false);
            } finally {
                setPrepaidLoadingId(null);
            }
        }
    };

    // ── Prepaid Confirm Cancel ─────────────────────────────────────────────────
    const handleConfirmPrepaidCancel = async () => {
        if (!selectedPrepaidId) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${selectedPrepaidId}/confirm-cancel`, {}, config);
            toast.success('Order cancelled successfully');
            setPrepaidModalOpen(false);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Cancellation failed');
        }
    };

    // ── COD Initiation callback → open payment modal ──────────────────────────
    const handleCODInitiated = (chargeAmount: number, dueDate: string) => {
        setCodModalOpen(false);
        setPayModalOrderId(selectedCodOrderId);
        setPayModalCharge(chargeAmount);
        setPayModalDueDate(dueDate);
        setChargePayModalOpen(true);
        fetchOrders();
    };

    // ── Payment modal success / revert ────────────────────────────────────────
    const handlePaySuccess = () => {
        setChargePayModalOpen(false);
        fetchOrders();
    };

    const handlePayRevert = () => {
        setChargePayModalOpen(false);
        fetchOrders();
    };

    // ── "Pay Now" shortcut on Cancellation Pending order card ─────────────────
    const openPayModalForPendingOrder = (order: Order) => {
        setPayModalOrderId(order._id);
        setPayModalCharge(order.cancellationCharge ?? 0);
        setPayModalDueDate(order.cancellationDueDate ?? '');
        setChargePayModalOpen(true);
    };

    // ── Status badge ────────────────────────────────────────────────────────────
    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Processing: 'bg-blue-100 text-blue-700',
            Shipped: 'bg-purple-100 text-purple-700',
            Delivered: 'bg-green-100 text-green-700',
            Cancelled: 'bg-red-100 text-red-700',
            'Cancellation Pending': 'bg-amber-100 text-amber-700',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {status}
            </span>
        );
    };

    // ── Charge status badge ─────────────────────────────────────────────────────
    const chargeBadge = (status?: string) => {
        if (!status) return null;
        const map: Record<string, string> = {
            Pending: 'bg-orange-100 text-orange-700',
            Paid: 'bg-green-100 text-green-700',
            Waived: 'bg-gray-100 text-gray-500',
            Expired: 'bg-gray-100 text-gray-400 line-through',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? ''}`}>
                {status}
            </span>
        );
    };

    // ── Invoice opener ─────────────────────────────────────────────────────────
    const openInvoice = (orderId: string) => {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const url = `${base}/api/orders/${orderId}/invoice`;
        fetch(url, { headers: { Authorization: `Bearer ${user?.token}` } })
            .then((r) => r.text())
            .then((html) => {
                const w = window.open('', '_blank');
                if (w) { w.document.write(html); w.document.close(); }
            })
            .catch(() => toast.error('Failed to load invoice'));
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <Layout>
            <Helmet>
                <title>My Orders | Sri Chola Book Shop</title>
            </Helmet>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold mb-6">My Orders</h1>

                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No orders found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                            >
                                {/* ── Header ── */}
                                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-secondary/20">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Order ID</p>
                                        <p className="font-mono text-sm font-semibold">{order._id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="font-semibold text-sm">₹{order.totalPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="w-full sm:w-auto flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                                        {/* Order status */}
                                        {statusBadge(order.status)}

                                        {/* Payment status */}
                                        {(() => {
                                            const ps = getPaymentStatus(order);
                                            return (
                                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ps.paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    <CheckCircle2 className={`h-3 w-3 ${ps.paid ? 'text-green-600' : 'text-gray-400'}`} />
                                                    {ps.label}
                                                </span>
                                            );
                                        })()}

                                        {/* Cancel button */}
                                        {canCancel(order) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-300 hover:bg-red-50"
                                                onClick={() => handleCancelClick(order)}
                                            >
                                                Cancel
                                            </Button>
                                        )}

                                        {/* Invoice button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 text-muted-foreground hover:text-foreground"
                                            onClick={() => openInvoice(order._id)}
                                        >
                                            <FileDown className="h-4 w-4" />
                                            Invoice
                                        </Button>
                                    </div>
                                </div>

                                {/* ── Items ── */}
                                <div className="px-5 py-3 space-y-2">
                                    {order.orderItems.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{item.title} × {item.qty}</span>
                                            <span>₹{(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    
                                    {/* Delivery Info Section */}
                                    <div className="pt-3 mt-3 border-t border-border/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Delivery Price</p>
                                                <p className="text-sm font-medium text-foreground">₹{order.shippingPrice.toFixed(2)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Delivery Contact</p>
                                                <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" />
                                                    {order.shippingAddress?.deliveryContactNumber || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Cancellation Pending Banner ── */}
                                {order.status === 'Cancellation Pending' && (
                                    <div className="mx-5 mb-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                                    Cancellation Pending — {order.cancellationCharge != null ? "Payment Required" : "Awaiting Verification"}
                                                </p>
                                                {order.cancellationCharge != null ? (
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                                        Charge: <strong>₹{order.cancellationCharge?.toFixed(2)}</strong>
                                                        {order.cancellationDueDate && (
                                                            <> &nbsp;·&nbsp; <Clock className="h-3 w-3 inline-block mb-0.5" /> {dueDateLabel(order.cancellationDueDate)}</>
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                                        Admin will review your request and update the cancellation charge amount shortly.
                                                    </p>
                                                )}
                                                {order.cancellationCharge != null && (
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        If not paid in time, your order will automatically resume delivery.
                                                    </p>
                                                )}
                                            </div>
                                            {order.cancellationCharge != null && (
                                                <div className="flex flex-col gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                                                        onClick={() => openPayModalForPendingOrder(order)}
                                                    >
                                                        Pay Now
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── COD Charge Info (after cancellation/expiry) ── */}
                                {(order.status === 'Cancelled' || order.cancellationChargeStatus === 'Expired') && order.cancellationType === 'COD' && order.cancellationCharge != null && (
                                    <div className="mx-5 mb-3 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 px-4 py-3 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                                            <IndianRupee className="h-3.5 w-3.5" />
                                            {t('orders.codCharge.title')}
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                            <span className="text-muted-foreground">{t('orders.codCharge.amount')}</span>
                                            <span className="font-bold text-orange-700 dark:text-orange-300">₹{order.cancellationCharge.toFixed(2)}</span>

                                            <span className="text-muted-foreground">{t('orders.codCharge.status')}</span>
                                            <span>{chargeBadge(order.cancellationChargeStatus)}</span>

                                            {order.cancellationPaymentMethod && (
                                                <>
                                                    <span className="text-muted-foreground">{t('orders.codCharge.via')}</span>
                                                    <span className="font-medium">{order.cancellationPaymentMethod}</span>
                                                </>
                                            )}

                                            {order.cancellationDueDate && (
                                                <>
                                                    <span className="text-muted-foreground">{t('orders.codCharge.payBy')}</span>
                                                    <span className="font-medium text-orange-700 dark:text-orange-300">
                                                        {new Date(order.cancellationDueDate).toLocaleString(i18n.language === 'ta' ? 'ta-IN' : 'en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </span>
                                                </>
                                            )}

                                            {order.cancellationPaidAt && (
                                                <>
                                                    <span className="text-muted-foreground">{t('orders.codCharge.paidOn')}</span>
                                                    <span className="font-medium text-green-700 dark:text-green-400">
                                                        {new Date(order.cancellationPaidAt).toLocaleString(i18n.language === 'ta' ? 'ta-IN' : 'en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </span>
                                                </>
                                            )}

                                            {order.cancelledAt && (
                                                <>
                                                    <span className="text-muted-foreground">{t('orders.codCharge.cancelledOn')}</span>
                                                    <span>{new Date(order.cancelledAt).toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </>
                                            )}

                                            {order.chargeRemarks && (
                                                <>
                                                    <span className="text-muted-foreground">{t('orders.codCharge.remarks')}</span>
                                                    <span className="text-muted-foreground italic">{order.chargeRemarks}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Contextual status note */}
                                        {order.cancellationChargeStatus === 'Pending' && (
                                            <p className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg px-3 py-2">
                                                ⚠️ {t('orders.codCharge.pendingNote', {
                                                    amount: order.cancellationCharge.toFixed(2),
                                                    date: order.cancellationDueDate
                                                        ? new Date(order.cancellationDueDate).toLocaleString(i18n.language === 'ta' ? 'ta-IN' : 'en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : '—'
                                                })}
                                            </p>
                                        )}
                                        {order.cancellationChargeStatus === 'Paid' && (
                                            <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                                                {t('orders.codCharge.paidNote')}
                                            </p>
                                        )}
                                        {order.cancellationChargeStatus === 'Expired' && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                                {t('orders.codCharge.expiredNote')}
                                            </p>
                                        )}
                                        {order.cancellationChargeStatus === 'Waived' && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                                {t('orders.codCharge.waivedNote')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ── Prepaid Refund Info ── */}
                                {order.status === 'Cancelled' && order.cancellationType !== 'COD' && order.refundStatus && (
                                    <div className="mx-5 mb-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Refund Details
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                            {order.refundDetails?.refundAmount != null && (
                                                <>
                                                    <span className="text-muted-foreground">Refund Amount</span>
                                                    <span className="font-bold text-green-700 dark:text-green-400">₹{order.refundDetails.refundAmount.toFixed(2)}</span>
                                                </>
                                            )}

                                            <span className="text-muted-foreground">Refund Status</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${order.refundStatus === 'Processed' ? 'bg-green-100 text-green-700' :
                                                order.refundStatus === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>{order.refundStatus}</span>

                                            {order.refundDetails?.refundMethod && (
                                                <>
                                                    <span className="text-muted-foreground">Refund Via</span>
                                                    <span className="font-medium capitalize">{order.refundDetails.refundMethod}</span>
                                                </>
                                            )}

                                            {order.refundDetails?.estimatedDays && (
                                                <>
                                                    <span className="text-muted-foreground">Est. Days</span>
                                                    <span>{order.refundDetails.estimatedDays}</span>
                                                </>
                                            )}

                                            {order.refundDetails?.transactionId && (
                                                <>
                                                    <span className="text-muted-foreground">Transaction ID</span>
                                                    <span className="font-mono text-xs break-all">{order.refundDetails.transactionId}</span>
                                                </>
                                            )}

                                            {order.refundDetails?.adminNotes && (
                                                <>
                                                    <span className="text-muted-foreground">Note</span>
                                                    <span className="italic text-muted-foreground">{order.refundDetails.adminNotes}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Prepaid Refund Preview Modal ── */}
            <RefundPreviewModal
                open={prepaidModalOpen}
                preview={refundPreview}
                loading={prepaidLoadingId !== null}
                onConfirm={handleConfirmPrepaidCancel}
                onKeep={() => { setPrepaidModalOpen(false); setRefundPreview(null); }}
            />

            {/* ── COD Cancel Preview Modal ── */}
            {selectedCodOrderId && (
                <CODCancelModal
                    open={codModalOpen}
                    orderId={selectedCodOrderId}
                    preview={codPreview}
                    loading={codLoadingId !== null}
                    userToken={user?.token ?? ''}
                    onInitiated={handleCODInitiated}
                    onKeep={() => { setCodModalOpen(false); setCodPreview(null); }}
                />
            )}

            {/* ── Cancellation Charge Payment Modal ── */}
            {payModalOrderId && (
                <CancellationChargePaymentModal
                    open={chargePayModalOpen}
                    orderId={payModalOrderId}
                    chargeAmount={payModalCharge}
                    dueDate={payModalDueDate}
                    userToken={user?.token ?? ''}
                    onSuccess={handlePaySuccess}
                    onRevert={handlePayRevert}
                    onClose={() => setChargePayModalOpen(false)}
                />
            )}
        </Layout>
    );
};

export default Orders;
