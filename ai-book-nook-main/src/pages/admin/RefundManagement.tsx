import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Edit, Lock, IndianRupee, CheckCircle2, XCircle, RotateCcw, Search, RefreshCw, Copy } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// ── Constants ──────────────────────────────────────────────────────────────────
const REFUND_BADGE: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Processed: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const COD_BADGE: Record<string, string> = {
    Pending: 'bg-orange-100 text-orange-700',
    Paid: 'bg-green-100 text-green-700',
    Waived: 'bg-gray-100 text-gray-600',
    Expired: 'bg-gray-100 text-gray-400',
    'COD Recovery': 'bg-amber-100 text-amber-700',
};

const fmt = (d?: string | Date | null) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDate = (d?: string | Date | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Component ──────────────────────────────────────────────────────────────────
const RefundManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'prepaid' | 'cod'>('prepaid');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Prepaid dialog ──
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isPrepaidDlgOpen, setIsPrepaidDlgOpen] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundStatus, setRefundStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [saving, setSaving] = useState(false);

    // ── COD dialog ──
    const [codOrder, setCodOrder] = useState<any>(null);
    const [isCodDlgOpen, setIsCodDlgOpen] = useState(false);
    const [codChargeStatus, setCodChargeStatus] = useState('');
    const [codRemarks, setCodRemarks] = useState('');
    const [codChargeAmt, setCodChargeAmt] = useState('');
    const [codPaidAt, setCodPaidAt] = useState('');
    const [codDueDate, setCodDueDate] = useState('');
    const [savingCod, setSavingCod] = useState(false);

    // ── Admin Override ──
    const [adminOverriding, setAdminOverriding] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.isAdmin) { navigate('/login'); return; }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await api.get('/api/orders', config);
            const relevant = data.filter((o: any) =>
                o.status === 'Cancelled' ||
                o.status === 'Cancellation Pending' ||
                (o.status === 'Processing' && o.cancellationChargeStatus === 'Expired')
            );
            setAllOrders(relevant);
        } catch {
            toast.error(t('refunds.messages.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    // ── Derived lists ──────────────────────────────────────────────────────────
    const prepaidRaw = allOrders.filter(
        (o) => o.cancellationType !== 'COD' && o.status === 'Cancelled'
    );
    const codRaw = allOrders.filter(
        (o) => o.cancellationType === 'COD' ||
            o.status === 'Cancellation Pending' ||
            o.cancellationChargeStatus === 'Expired'
    );

    const applyFilters = (list: any[]) => {
        let out = list;
        if (search.trim()) {
            const s = search.toLowerCase();
            out = out.filter(
                (o) =>
                    o._id.toLowerCase().includes(s) ||
                    o.user?.name?.toLowerCase().includes(s) ||
                    o.user?.email?.toLowerCase().includes(s)
            );
        }
        if (statusFilter !== 'all') {
            out = out.filter((o) =>
                activeTab === 'prepaid'
                    ? o.refundStatus === statusFilter
                    : (o.cancellationChargeStatus ?? 'Pending') === statusFilter
            );
        }
        return out;
    };

    const prepaidOrders = applyFilters(prepaidRaw);
    const codOrders = applyFilters(codRaw);

    // ── Prepaid handlers ──────────────────────────────────────────────────────
    const openPrepaid = (order: any) => {
        setSelectedOrder(order);
        setRefundAmount(String(order.refundDetails?.refundAmount ?? order.totalPrice));
        setRefundStatus(order.refundStatus ?? 'Pending');
        setAdminNotes(order.refundDetails?.adminNotes ?? '');
        setTransactionId(order.refundDetails?.transactionId ?? '');
        setIsPrepaidDlgOpen(true);
    };

    const savePrepaid = async () => {
        if (!selectedOrder) return;
        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${selectedOrder._id}/refund`, {
                refundAmount: parseFloat(refundAmount),
                refundStatus,
                adminNotes,
                transactionId,
            }, config);
            toast.success(t('refunds.messages.prepaidSuccess'));
            setIsPrepaidDlgOpen(false);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('refunds.messages.prepaidError'));
        } finally {
            setSaving(false);
        }
    };

    const isLocked = selectedOrder?.refundStatus === 'Processed';

    // ── COD handlers ──────────────────────────────────────────────────────────
    const openCod = (order: any) => {
        setCodOrder(order);
        setCodChargeStatus(order.cancellationChargeStatus ?? 'Pending');
        setCodRemarks(order.chargeRemarks ?? '');
        setCodChargeAmt(String(order.cancellationCharge ?? ''));
        setCodPaidAt(order.cancellationPaidAt ? new Date(order.cancellationPaidAt).toISOString().slice(0, 16) : '');
        setCodDueDate(order.cancellationDueDate ? new Date(order.cancellationDueDate).toISOString().slice(0, 16) : '');
        setIsCodDlgOpen(true);
    };

    const saveCod = async () => {
        if (!codOrder) return;
        setSavingCod(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${codOrder._id}/cod-charge`, {
                cancellationChargeStatus: codChargeStatus,
                chargeRemarks: codRemarks,
                cancellationCharge: parseFloat(codChargeAmt) || undefined,
                cancellationPaidAt: codPaidAt || undefined,
                cancellationDueDate: codDueDate || undefined,
            }, config);
            toast.success(t('refunds.messages.codSuccess'));
            setIsCodDlgOpen(false);
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('refunds.messages.codError'));
        } finally {
            setSavingCod(false);
        }
    };

    // ── Admin overrides ───────────────────────────────────────────────────────
    const adminOverride = async (orderId: string, action: 'force-cancel' | 'force-continue') => {
        setAdminOverriding(orderId + action);
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${orderId}/admin-cod-override`, { action }, config);
            toast.success(action === 'force-cancel' ? t('refunds.messages.overrideCancel') : t('refunds.messages.overrideContinue'));
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('refunds.messages.overrideError'));
        } finally {
            setAdminOverriding(null);
        }
    };

    // ── Quick action buttons for COD: mark Paid / Waived directly ──────────────
    const quickMarkCod = async (orderId: string, status: 'Paid' | 'Waived') => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await api.put(`/api/orders/${orderId}/cod-charge`, {
                cancellationChargeStatus: status,
            }, config);
            toast.success(status === 'Paid' ? t('refunds.messages.markPaidSuccess') : t('refunds.messages.markWaivedSuccess'));
            fetchOrders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || t('refunds.messages.codError'));
        }
    };

    // ── Filter status options based on tab ─────────────────────────────────────
    const filterOptions = activeTab === 'prepaid'
        ? ['all', 'Pending', 'Processed', 'Rejected']
        : ['all', 'Pending', 'Paid', 'Waived', 'Expired'];

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <Helmet>
                <title>{t('refunds.title')} | Admin</title>
            </Helmet>

            <div className="w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold font-serif">{t('refunds.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t('refunds.subtitle')}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5">
                        <RefreshCw className="h-4 w-4" /> {t('refunds.refresh')}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    {(['prepaid', 'cod'] as const).map((tab) => {
                        const count = tab === 'prepaid' ? prepaidRaw.length : codRaw.length;
                        const label = tab === 'prepaid' ? t('refunds.prepaidTab') : t('refunds.codTab');
                        const badgeColor = tab === 'prepaid' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700';
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setStatusFilter('all'); setSearch(''); }}
                                className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                {label}
                                {count > 0 && (
                                    <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${badgeColor}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('refunds.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder={t('refunds.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.map((s) => (
                                <SelectItem key={s} value={s}>{s === 'all' ? t('refunds.allStatus') : s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="text-muted-foreground py-8">{t('common.loading')}</div>
                ) : activeTab === 'prepaid' ? (
                    /* ── Prepaid Refunds Tab ─── */
                    prepaidOrders.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">{t('refunds.messages.noPrepaid')}</div>
                    ) : (
                        <div className="bg-card rounded-xl shadow-sm border border-border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('refunds.table.orderId')}</TableHead>
                                        <TableHead>{t('refunds.table.orderAmt')}</TableHead>
                                        <TableHead>{t('refunds.table.refundAmt')}</TableHead>
                                        <TableHead>{t('refunds.dialogs.razorpayId')}</TableHead>
                                        <TableHead>{t('refunds.table.status')}</TableHead>
                                        <TableHead>{t('refunds.table.cancelledOn')}</TableHead>
                                        <TableHead>{t('refunds.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prepaidOrders.map((order: any) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-mono text-xs">{order._id.slice(-10)}</TableCell>
                                            <TableCell>₹{order.totalPrice?.toFixed(2)}</TableCell>
                                            <TableCell className="font-semibold text-green-700 dark:text-green-400">
                                                {order.refundDetails?.refundAmount != null
                                                    ? `₹${order.refundDetails.refundAmount.toFixed(2)}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {order.paymentResult?.id || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {order.refundStatus ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${REFUND_BADGE[order.refundStatus] ?? ''}`}>
                                                        {order.refundStatus}
                                                    </span>
                                                ) : <span className="text-muted-foreground text-xs">—</span>}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {fmtDate(order.cancelledAt ?? order.updatedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1"
                                                    onClick={() => openPrepaid(order)}
                                                >
                                                    {order.refundStatus === 'Processed'
                                                        ? <><Lock className="h-4 w-4" /> {t('refunds.table.view')}</>
                                                        : <><Edit className="h-4 w-4" /> {t('refunds.table.edit')}</>}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                ) : (
                    /* ── COD Charges Tab ─── */
                    codOrders.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">{t('refunds.messages.noCod')}</div>
                    ) : (
                        <div className="bg-card rounded-xl shadow-sm border border-border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('refunds.table.orderId')}</TableHead>

                                        <TableHead>{t('refunds.table.orderStatus')}</TableHead>
                                        <TableHead>{t('refunds.table.chargeAmt')}</TableHead>
                                        <TableHead>{t('refunds.table.chargeStatus')}</TableHead>

                                        <TableHead>{t('refunds.table.dueDate')}</TableHead>
                                        <TableHead>{t('refunds.table.cancelledOn')}</TableHead>
                                        <TableHead>{t('refunds.table.paidOn')}</TableHead>
                                        <TableHead>{t('refunds.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {codOrders.map((order: any) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-mono text-xs">{order._id.slice(-10)}</TableCell>

                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Cancellation Pending' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>{order.status}</span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-orange-700 dark:text-orange-400">
                                                {order.cancellationCharge != null ? `₹${order.cancellationCharge.toFixed(2)}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${COD_BADGE[order.cancellationChargeStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {order.cancellationChargeStatus ?? 'Pending'}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-xs">
                                                {order.cancellationDueDate ? (
                                                    <span className="text-amber-600 font-semibold">{fmt(order.cancellationDueDate)}</span>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {fmtDate(order.cancelledAt)}
                                            </TableCell>
                                            <TableCell className="text-xs text-green-700 dark:text-green-400 font-medium">
                                                {order.cancellationPaidAt ? fmt(order.cancellationPaidAt) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 flex-wrap min-w-[260px]">
                                                    {/* Manage button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1 text-orange-700 border-orange-300 hover:bg-orange-50 text-xs"
                                                        onClick={() => openCod(order)}
                                                    >
                                                        <IndianRupee className="h-3.5 w-3.5" /> {t('refunds.table.manage')}
                                                    </Button>

                                                    {/* Quick: Mark Paid */}
                                                    {order.cancellationChargeStatus === 'Pending' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-700 border-green-300 hover:bg-green-50 text-xs gap-1"
                                                            onClick={() => quickMarkCod(order._id, 'Paid')}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" /> {t('refunds.table.markPaid')}
                                                        </Button>
                                                    )}

                                                    {/* Quick: Waive */}
                                                    {(order.cancellationChargeStatus === 'Pending') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-gray-600 border-gray-300 hover:bg-gray-50 text-xs gap-1"
                                                            onClick={() => quickMarkCod(order._id, 'Waived')}
                                                        >
                                                            <XCircle className="h-3 w-3" /> {t('refunds.table.waive')}
                                                        </Button>
                                                    )}

                                                    {/* Admin overrides for Cancellation Pending */}
                                                    {order.status === 'Cancellation Pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                                                                disabled={adminOverriding !== null}
                                                                onClick={() => adminOverride(order._id, 'force-cancel')}
                                                            >
                                                                {adminOverriding === order._id + 'force-cancel' ? '…' : t('refunds.table.forceCancel')}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs gap-1"
                                                                disabled={adminOverriding !== null}
                                                                onClick={() => adminOverride(order._id, 'force-continue')}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                {adminOverriding === order._id + 'force-continue' ? '…' : t('refunds.table.forceContinue')}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                )}
            </div>

            {/* ── Prepaid Refund Edit Dialog ── */}
            <Dialog open={isPrepaidDlgOpen} onOpenChange={setIsPrepaidDlgOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Edit className="h-4 w-4" />}
                            {isLocked ? t('refunds.dialogs.prepaidTitleLocked') : t('refunds.dialogs.prepaidTitle')}
                        </DialogTitle>
                    </DialogHeader>

                    {isLocked && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 px-4 py-2 text-sm text-amber-700">
                            {t('refunds.dialogs.lockedNote')}
                        </div>
                    )}

                    <div className="space-y-4 py-2">
                        {selectedOrder && (
                            <div className="rounded-lg border border-border bg-secondary/20 p-3 text-sm space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.customer')}</span>
                                    <span className="font-semibold">{selectedOrder.user?.name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.dialogs.originalAmt')}</span>
                                    <span className="font-semibold">₹{(selectedOrder.refundDetails?.originalAmount ?? selectedOrder.totalPrice)?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.dialogs.cancelFee')}</span>
                                    <span className="text-red-500">₹{Math.max(0, (selectedOrder.refundDetails?.originalAmount ?? selectedOrder.totalPrice) - parseFloat(refundAmount || '0')).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.paymentVia')}</span>
                                    <span className="capitalize">{selectedOrder.refundDetails?.refundMethod ?? selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-muted-foreground">{t('refunds.dialogs.razorpayId')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs">{selectedOrder.paymentResult?.id || '—'}</span>
                                        {selectedOrder.paymentResult?.id && (
                                            <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedOrder.paymentResult.id);
                                                    toast.success(t('bookDetail.linkCopied'));
                                                }}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.cancelledOn')}</span>
                                    <span>{fmtDate(selectedOrder.cancelledAt)}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="refundAmount">{t('refunds.dialogs.refundAmtLabel')}</Label>
                            <Input id="refundAmount" type="number" value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)} disabled={isLocked} min={0} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="refundStatus">{t('refunds.table.status')}</Label>
                            <Select value={refundStatus} onValueChange={setRefundStatus} disabled={isLocked}>
                                <SelectTrigger id="refundStatus"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['Pending', 'Processed', 'Rejected'].map((s) => (
                                        <SelectItem key={s} value={s}>{t(`refunds.table.${s.toLowerCase()}`)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transactionId">{t('refunds.dialogs.txnId')}</Label>
                            <Input id="transactionId" placeholder="e.g. pay_XXXX or TXN12345"
                                value={transactionId} onChange={(e) => setTransactionId(e.target.value)} disabled={isLocked} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminNotes">{t('refunds.dialogs.adminNotes')}</Label>
                            <Textarea id="adminNotes" placeholder={t('refunds.dialogs.notesPlaceholder')}
                                value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} disabled={isLocked} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsPrepaidDlgOpen(false)} disabled={saving}>{t('refunds.dialogs.close')}</Button>
                        {!isLocked && (
                            <Button onClick={savePrepaid} disabled={saving}>
                                {saving ? t('refunds.dialogs.saving') : t('refunds.dialogs.save')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── COD Charge Management Dialog ── */}
            <Dialog open={isCodDlgOpen} onOpenChange={setIsCodDlgOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-orange-500" />
                            {t('refunds.dialogs.codTitle')}
                        </DialogTitle>
                    </DialogHeader>

                    {codOrder && (
                        <div className="space-y-4 py-2">
                            {/* Order summary */}
                            <div className="rounded-lg border border-border bg-secondary/20 p-3 text-sm space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.customer')}</span>
                                    <span className="font-semibold">{codOrder.user?.name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.dialogs.email')}</span>
                                    <span className="text-xs">{codOrder.user?.email ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.dialogs.orderTotal')}</span>
                                    <span className="font-semibold">₹{codOrder.totalPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.orderStatus')}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${codOrder.status === 'Cancellation Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {codOrder.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('refunds.table.cancelledOn')}</span>
                                    <span>{fmtDate(codOrder.cancelledAt)}</span>
                                </div>
                                {codOrder.cancellationDueDate && codOrder.status === 'Cancellation Pending' && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('refunds.table.dueDate')}</span>
                                        <span className="text-amber-600 font-semibold text-xs">{fmt(codOrder.cancellationDueDate)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codAmt">{t('refunds.table.chargeAmt')} (₹)</Label>
                                <Input id="codAmt" type="number" min={0}
                                    value={codChargeAmt} onChange={(e) => setCodChargeAmt(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codStatus">{t('refunds.table.chargeStatus')}</Label>
                                <Select value={codChargeStatus} onValueChange={setCodChargeStatus}>
                                    <SelectTrigger id="codStatus"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">{t('refunds.table.pending')}</SelectItem>
                                        <SelectItem value="Paid">{t('refunds.table.paid')}</SelectItem>
                                        <SelectItem value="Waived">{t('refunds.table.waived')}</SelectItem>
                                        <SelectItem value="Expired">{t('refunds.table.expired')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {codChargeStatus === 'Paid' && (
                                <div className="space-y-2">
                                    <Label htmlFor="codPaidAt">{t('refunds.dialogs.paidOnLabel')}</Label>
                                    <Input id="codPaidAt" type="datetime-local"
                                        value={codPaidAt} onChange={(e) => setCodPaidAt(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">{t('refunds.dialogs.autoSetNote')}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="codDueDate">{t('refunds.dialogs.dueDateLabel')}</Label>
                                <Input id="codDueDate" type="datetime-local"
                                    value={codDueDate} onChange={(e) => setCodDueDate(e.target.value)} />
                                <p className="text-xs text-muted-foreground">{t('refunds.dialogs.dueNote')}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codRemarks">{t('refunds.dialogs.remarks')}</Label>
                                <Textarea id="codRemarks" placeholder={t('refunds.dialogs.remarksPlaceholder')}
                                    value={codRemarks} onChange={(e) => setCodRemarks(e.target.value)} rows={3} />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsCodDlgOpen(false)} disabled={savingCod}>{t('refunds.dialogs.close')}</Button>
                        <Button onClick={saveCod} disabled={savingCod}>
                            {savingCod ? t('refunds.dialogs.saving') : t('refunds.dialogs.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default RefundManagement;
