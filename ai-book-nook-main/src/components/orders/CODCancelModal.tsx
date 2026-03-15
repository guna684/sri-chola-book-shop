import { useState } from 'react';
import { AlertTriangle, IndianRupee, Wallet, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface CODPreview {
    paymentType: 'COD';
    orderTotal: number;
    codHandlingCharge: number;
    cancellationCharge: number;
    totalCharges: number;
    message: string;
}

interface CODCancelModalProps {
    open: boolean;
    orderId: string;
    preview: CODPreview | null;
    loading: boolean;
    userToken: string;
    onInitiated: (chargeAmount: number, dueDate: string) => void; // Open payment modal
    onKeep: () => void; // User chose "Continue Delivery"
}

const CODCancelModal = ({
    open,
    orderId,
    preview,
    loading,
    userToken,
    onInitiated,
    onKeep,
}: CODCancelModalProps) => {
    const [confirming, setConfirming] = useState(false);

    const handleConfirmCancellation = async () => {
        if (!orderId) return;
        setConfirming(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userToken}` } };
            const { data } = await api.put(`/api/orders/${orderId}/initiate-cod-cancel`, {}, config);

            toast.success('Cancellation initiated. Please pay the cancellation charge to complete.');
            // Pass charge amount and due date to parent → open payment modal
            onInitiated(data.cancellationCharge, data.cancellationDueDate);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initiate cancellation');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onKeep(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Cancel COD Order
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center text-muted-foreground animate-pulse">
                        Loading cancellation details…
                    </div>
                ) : preview ? (
                    <div className="space-y-4 py-2">
                        {/* Warning Banner */}
                        <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4">
                            <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                                {preview.message}
                            </p>
                        </div>

                        {/* Charge Breakdown */}
                        <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                Charge Breakdown
                            </p>

                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    Order Total
                                </span>
                                <span className="font-semibold">₹{preview.orderTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Wallet className="h-3.5 w-3.5" />
                                    COD Handling Charge
                                </span>
                                <span className="font-semibold text-orange-600">₹{preview.codHandlingCharge.toFixed(2)}</span>
                            </div>

                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <span className="font-bold text-base">Cancellation Charge to Pay</span>
                                <span className="font-bold text-lg text-red-600">
                                    ₹{preview.cancellationCharge.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            You will have <strong>48 hours</strong> to pay this charge. If unpaid, your order will automatically resume delivery.
                        </p>
                    </div>
                ) : (
                    <div className="py-8 text-center text-red-500 text-sm">
                        Failed to load cancellation details. Please try again.
                    </div>
                )}

                <DialogFooter className="flex gap-2 sm:flex-row flex-col">
                    <Button
                        variant="outline"
                        onClick={onKeep}
                        className="flex-1"
                        disabled={loading || confirming}
                    >
                        Continue Delivery
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmCancellation}
                        className="flex-1 gap-2"
                        disabled={loading || !preview || confirming}
                    >
                        {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
                        {confirming ? 'Initiating…' : 'Confirm Cancellation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CODCancelModal;
