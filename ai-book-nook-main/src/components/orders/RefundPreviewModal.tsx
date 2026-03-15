import { AlertTriangle, CreditCard, Clock, IndianRupee, Percent } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RefundPreview {
    originalAmount: number;
    cancellationFee: number;
    refundAmount: number;
    refundMethod: string;
    estimatedDays: string;
}

interface RefundPreviewModalProps {
    open: boolean;
    preview: RefundPreview | null;
    loading: boolean;
    onConfirm: () => void;
    onKeep: () => void;
}

const RefundPreviewModal = ({
    open,
    preview,
    loading,
    onConfirm,
    onKeep,
}: RefundPreviewModalProps) => {
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onKeep(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Cancel Order
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-muted-foreground animate-pulse">
                        Calculating refund details…
                    </div>
                ) : preview ? (
                    <div className="space-y-4 py-2">
                        {/* Refund breakdown */}
                        <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <IndianRupee className="h-4 w-4" />
                                    Original Order Amount
                                </span>
                                <span className="font-semibold">₹{preview.originalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Percent className="h-4 w-4" />
                                    Cancellation Fee
                                </span>
                                <span className="font-semibold text-red-500">
                                    − ₹{preview.cancellationFee.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <span className="font-bold text-base">Final Refund Amount</span>
                                <span className="font-bold text-lg text-green-600">
                                    ₹{preview.refundAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Refund method & timeline */}
                        <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Refund Method
                                </span>
                                <Badge variant="outline" className="capitalize">
                                    {preview.refundMethod}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Estimated Refund Time
                                </span>
                                <span className="font-medium">{preview.estimatedDays}</span>
                            </div>
                        </div>

                        <p className="text-sm text-center text-muted-foreground">
                            Are you sure you want to cancel this order?
                        </p>
                    </div>
                ) : (
                    <div className="py-8 text-center text-red-500 text-sm">
                        Failed to load refund preview. Please try again.
                    </div>
                )}

                <DialogFooter className="flex gap-2 sm:flex-row flex-col">
                    <Button
                        variant="outline"
                        onClick={onKeep}
                        className="flex-1"
                        disabled={loading}
                    >
                        Keep Order
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1"
                        disabled={loading || !preview}
                    >
                        Confirm Cancellation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RefundPreviewModal;
