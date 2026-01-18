import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

interface CreateCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateCardModal({ open, onOpenChange, onSuccess }: CreateCardModalProps) {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [accountId, setAccountId] = useState("");
    const [cardType, setCardType] = useState<"debit" | "credit">("debit");
    const [cardholderName, setCardholderName] = useState("");
    const [spendingLimit, setSpendingLimit] = useState("50000");
    const [dailyLimit, setDailyLimit] = useState("10000");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchAccountsAndProfile();
        }
    }, [open]);

    const fetchAccountsAndProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch accounts
            const accountsResponse = await fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const accountsData = await accountsResponse.json();
            if (accountsResponse.ok) {
                setAccounts(accountsData.data.accounts || []);
                if (accountsData.data.accounts && accountsData.data.accounts.length > 0) {
                    setAccountId(accountsData.data.accounts[0].id);
                }
            }

            // Fetch user profile for name
            const profileResponse = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const profileData = await profileResponse.json();
            if (profileResponse.ok) {
                const fullName = `${profileData.data.user.first_name} ${profileData.data.user.last_name}`;
                setCardholderName(fullName);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleCreateCard = async () => {
        if (!accountId || !cardholderName) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill all required fields",
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.CARDS.BASE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_id: accountId,
                    card_type: cardType,
                    cardholder_name: cardholderName,
                    spending_limit: parseFloat(spendingLimit),
                    daily_limit: parseFloat(dailyLimit),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Card Created!",
                    description: `Your ${cardType} card has been created successfully`,
                });
                onOpenChange(false);
                onSuccess();
                // Reset form
                setCardType("debit");
                setSpendingLimit("50000");
                setDailyLimit("10000");
            } else {
                toast({
                    variant: "destructive",
                    title: "Creation Failed",
                    description: data.message || "Failed to create card",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create card",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Virtual Card</DialogTitle>
                    <DialogDescription>
                        Create a new virtual card with custom spending limits
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="account">Account</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger id="account">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.account_type} - ****{account.account_number.slice(-4)} (₹{parseFloat(account.balance).toLocaleString('en-IN')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardType">Card Type</Label>
                        <Select value={cardType} onValueChange={(value: any) => setCardType(value)}>
                            <SelectTrigger id="cardType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="debit">Debit Card</SelectItem>
                                <SelectItem value="credit">Credit Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                            id="cardholderName"
                            placeholder="Your full name"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="spendingLimit">Monthly Spending Limit (₹)</Label>
                        <Input
                            id="spendingLimit"
                            type="number"
                            placeholder="50000"
                            value={spendingLimit}
                            onChange={(e) => setSpendingLimit(e.target.value)}
                        />
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
                    </div>

                    <Button
                        onClick={handleCreateCard}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Card"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
