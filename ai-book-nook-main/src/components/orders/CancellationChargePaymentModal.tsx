import { useState, useEffect } from 'react';
import { Clock, CreditCard, Wallet, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import api from '@/lib/axios';
import { toast } from 'sonner';

declare global {
    interface Window { Razorpay: any; }
}

interface Props {
    open: boolean;
    orderId: string;
    chargeAmount: number;
    dueDate: string; // ISO string
    userToken: string;
    onSuccess: () => void;   // order cancelled successfully
    onRevert: () => void;    // user cancelled the request → back to Processing
    onClose: () => void;     // just close modal (order still Cancellation Pending)
}

// Format countdown string from now to dueDate
function formatCountdown(dueDate: string): string {
    const ms = new Date(dueDate).getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
}

const CancellationChargePaymentModal = ({
    open,
    orderId,
    chargeAmount,
    dueDate,
    userToken,
    onSuccess,
    onRevert,
    onClose,
}: Props) => {
    const [paymentMode, setPaymentMode] = useState<'Online' | 'COD Recovery'>('Online');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState('');

    // Live countdown
    useEffect(() => {
        if (!open || !dueDate) return;
        setCountdown(formatCountdown(dueDate));
        const id = setInterval(() => setCountdown(formatCountdown(dueDate)), 60_000);
        return () => clearInterval(id);
    }, [open, dueDate]);

    const config = { headers: { Authorization: `Bearer ${userToken}` } };

    // ── Online Payment via Razorpay ───────────────────────────────────────────
    const handlePayOnline = async () => {
        setLoading(true);
        try {
            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const loadRazorpayScript = () => new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }
            }

            const { data: session } = await api.post(
                '/api/payment/cancel-charge-session',
                { orderId },
                config
            );

            const options = {
                key: session.key,
                amount: session.amount,
                currency: session.currency,
                name: 'Sri Chola Book Shop',
                description: 'COD Cancellation Charge',
                image: 'https://cdn-icons-png.flaticon.com/512/2230/2230469.png',
                order_id: session.order_id,
                handler: async (response: any) => {
                    try {
                        await api.post(
                            '/api/payment/verify-cancel-charge',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId,
                            },
                            config
                        );
                        toast.success('Payment successful! Your order has been cancelled.');
                        onSuccess();
                    } catch {
                        toast.error('Payment verification failed. Please try again.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: session.customer_name,
                    email: session.customer_email,
                },
                theme: { color: '#f97316' }, // orange for cancellation context
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        toast('Payment cancelled. Your order is still pending cancellation.');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment session');
            setLoading(false);
        }
    };

    // ── COD Recovery ─────────────────────────────────────────────────────────
    const handleCODRecovery = async () => {
        setLoading(true);
        try {
            await api.put(`/api/orders/${orderId}/cod-recovery-cancel`, {}, config);
            toast.success('Order cancelled. Charge will be recovered on your next COD order.');
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to process COD recovery');
            setLoading(false);
        }
    };

    // ── Revert Request ───────────────────────────────────────────────────────
    const handleCancelRequest = async () => {
        setLoading(true);
        try {
            await api.put(`/api/orders/${orderId}/revert-cod-cancel`, {}, config);
            toast.success('Cancellation request removed. Your order will continue for delivery.');
            onRevert();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revert cancellation');
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (paymentMode === 'Online') handlePayOnline();
        else handleCODRecovery();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Pay Cancellation Charge
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-1">
                    {/* Charge Summary */}
                    <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                Cancellation Charge
                            </p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-0.5">
                                ₹{chargeAmount?.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                Due in
                            </div>
                            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                                {countdown || '48 hours'}
                            </p>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="rounded-lg bg-secondary/30 border border-border px-3 py-2.5 text-sm text-muted-foreground">
                        If you do not pay within 48 hours, your cancellation request will be <strong>automatically cancelled</strong> and your order will resume delivery.
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Choose Payment Method</p>
                        <RadioGroup
                            value={paymentMode}
                            onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}
                            className="space-y-2"
                        >
                            <label className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${paymentMode === 'Online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                <RadioGroupItem value="Online" id="pm-online" />
                                <CreditCard className="h-4 w-4 text-primary shrink-0" />
                                <div className="flex-1">
                                    <Label htmlFor="pm-online" className="font-medium cursor-pointer">
                                        Online Payment
                                    </Label>
                                    <p className="text-xs text-muted-foreground">UPI · Card · Net Banking via Razorpay</p>
                                </div>
                                <CheckCircle2 className={`h-4 w-4 shrink-0 transition-opacity ${paymentMode === 'Online' ? 'text-primary opacity-100' : 'opacity-0'}`} />
                            </label>

                            <label className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${paymentMode === 'COD Recovery' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-border hover:border-amber-400/50'}`}>
                                <RadioGroupItem value="COD Recovery" id="pm-cod" />
                                <Wallet className="h-4 w-4 text-amber-600 shrink-0" />
                                <div className="flex-1">
                                    <Label htmlFor="pm-cod" className="font-medium cursor-pointer">
                                        Recover via Next COD Order
                                    </Label>
                                    <p className="text-xs text-muted-foreground">We'll add ₹{chargeAmount?.toFixed(2)} to your next Cash on Delivery order</p>
                                </div>
                                <CheckCircle2 className={`h-4 w-4 text-amber-500 shrink-0 transition-opacity ${paymentMode === 'COD Recovery' ? 'opacity-100' : 'opacity-0'}`} />
                            </label>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground hover:text-red-600 order-last sm:order-first"
                        onClick={handleCancelRequest}
                        disabled={loading}
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel Request
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Close
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={paymentMode === 'COD Recovery' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                    >
                        {loading
                            ? 'Processing…'
                            : paymentMode === 'Online'
                                ? 'Pay Now →'
                                : 'Confirm Recovery'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CancellationChargePaymentModal;
