import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS } from "@/config/api";

interface DepositWithdrawModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: any[];
    onSuccess: () => void;
}

export function DepositWithdrawModal({ open, onOpenChange, accounts, onSuccess }: DepositWithdrawModalProps) {
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("deposit");
    const { toast } = useToast();

    const handleTransaction = async () => {
        if (!accountId || !amount) {
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
            const endpoint = activeTab === 'deposit' ? 'deposit' : 'withdraw';

            const response = await fetch(API_ENDPOINTS.TRANSACTIONS[endpoint.toUpperCase() as 'DEPOSIT' | 'WITHDRAW'], {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_id: accountId,
                    amount: parseFloat(amount),
                    description,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: `${activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} Successful!`,
                    description: `₹${amount} ${activeTab === 'deposit' ? 'deposited to' : 'withdrawn from'} your account`,
                });
                onOpenChange(false);
                onSuccess();
                // Reset form
                setAccountId("");
                setAmount("");
                setDescription("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Transaction Failed",
                    description: data.message || "Please try again",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process transaction",
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedAccount = accounts.find(acc => acc.id === accountId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Deposit / Withdraw</DialogTitle>
                    <DialogDescription>
                        Add or withdraw money from your account
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="deposit-account">Account</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger id="deposit-account">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.account_type} - ****{account.account_number.slice(-4)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deposit-amount">Amount</Label>
                            <Input
                                id="deposit-amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deposit-description">Description (Optional)</Label>
                            <Input
                                id="deposit-description"
                                placeholder="e.g., Salary credit"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleTransaction}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Deposit ₹${amount || '0'}`
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-account">Account</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger id="withdraw-account">
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
                            <Label htmlFor="withdraw-amount">Amount</Label>
                            <Input
                                id="withdraw-amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                            {selectedAccount && (
                                <p className="text-sm text-muted-foreground">
                                    Available: ₹{parseFloat(selectedAccount.balance).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="withdraw-description">Description (Optional)</Label>
                            <Input
                                id="withdraw-description"
                                placeholder="e.g., ATM withdrawal"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleTransaction}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Withdraw ₹${amount || '0'}`
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
