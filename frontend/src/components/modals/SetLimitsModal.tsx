import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

interface SetLimitsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: any;
    onSuccess: () => void;
}

export function SetLimitsModal({ open, onOpenChange, card, onSuccess }: SetLimitsModalProps) {
    const [spendingLimit, setSpendingLimit] = useState(card?.spending_limit || "50000");
    const [dailyLimit, setDailyLimit] = useState(card?.daily_limit || "10000");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpdateLimits = async () => {
        if (!spendingLimit || !dailyLimit) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill all fields",
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.CARDS.LIMITS(card.id), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spending_limit: parseFloat(spendingLimit),
                    daily_limit: parseFloat(dailyLimit),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Limits Updated!",
                    description: "Card spending limits updated successfully",
                });
                onOpenChange(false);
                onSuccess();
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: data.message || "Failed to update limits",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update limits",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Spending Limits</DialogTitle>
                    <DialogDescription>
                        Update daily and monthly spending limits for this card
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="spendingLimit">Monthly Spending Limit (₹)</Label>
                        <Input
                            id="spendingLimit"
                            type="number"
                            placeholder="50000"
                            value={spendingLimit}
                            onChange={(e) => setSpendingLimit(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Current: ₹{parseFloat(card?.spending_limit || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyLimit">Daily Spending Limit (₹)</Label>
                        <Input
                            id="dailyLimit"
                            type="number"
                            placeholder="10000"
                            value={dailyLimit}
                            onChange={(e) => setDailyLimit(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Current: ₹{parseFloat(card?.daily_limit || 0).toLocaleString('en-IN')}
                        </p>
                    </div>

                    <Button
                        onClick={handleUpdateLimits}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Limits"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
