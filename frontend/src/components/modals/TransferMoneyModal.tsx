import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS } from "@/config/api";

interface TransferMoneyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: any[];
    onSuccess: () => void;
}

export function TransferMoneyModal({ open, onOpenChange, accounts, onSuccess }: TransferMoneyModalProps) {
    const [fromAccountId, setFromAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [externalAccountNumber, setExternalAccountNumber] = useState("");
    const [verifiedAccount, setVerifiedAccount] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [transferType, setTransferType] = useState<"own" | "external">("own");
    const { toast } = useToast();

    const handleVerifyAccount = async () => {
        if (!externalAccountNumber) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please enter an account number",
            });
            return;
        }

        setVerifying(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.ACCOUNTS.VERIFY(externalAccountNumber), {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                setVerifiedAccount(data.data.account);
                toast({
                    title: "Account Verified!",
                    description: `${data.data.account.account_type} account found`,
                });
            } else {
                setVerifiedAccount(null);
                toast({
                    variant: "destructive",
                    title: "Account Not Found",
                    description: data.message || "Please check the account number",
                });
            }
        } catch (error) {
            setVerifiedAccount(null);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to verify account",
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleTransfer = async () => {
        if (!fromAccountId || !amount) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill all required fields",
            });
            return;
        }

        if (transferType === "own" && !toAccountId) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please select destination account",
            });
            return;
        }

        if (transferType === "external" && !verifiedAccount) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please verify the account number first",
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.TRANSACTIONS.TRANSFER, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from_account_id: fromAccountId,
                    to_account_id: transferType === "own" ? toAccountId : verifiedAccount.id,
                    amount: parseFloat(amount),
                    description: description || `Transfer to ${transferType === "own" ? "own account" : externalAccountNumber}`,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Transfer Successful!",
                    description: `₹${amount} transferred successfully`,
                });
                onOpenChange(false);
                onSuccess();
                // Reset form
                setFromAccountId("");
                setToAccountId("");
                setExternalAccountNumber("");
                setVerifiedAccount(null);
                setAmount("");
                setDescription("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Transfer Failed",
                    description: data.message || "Please try again",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process transfer",
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedFromAccount = accounts.find(acc => acc.id === fromAccountId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Transfer Money</DialogTitle>
                    <DialogDescription>
                        Transfer money between accounts
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={transferType} onValueChange={(value: any) => {
                    setTransferType(value);
                    setToAccountId("");
                    setExternalAccountNumber("");
                    setVerifiedAccount(null);
                }}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="own">My Accounts</TabsTrigger>
                        <TabsTrigger value="external">Other Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="own" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-account-own">From Account</Label>
                            <Select value={fromAccountId} onValueChange={setFromAccountId}>
                                <SelectTrigger id="from-account-own">
                                    <SelectValue placeholder="Select source account" />
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
                            <Label htmlFor="to-account-own">To Account</Label>
                            <Select value={toAccountId} onValueChange={setToAccountId}>
                                <SelectTrigger id="to-account-own">
                                    <SelectValue placeholder="Select destination account" />
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
                            <Label htmlFor="amount-own">Amount</Label>
                            <Input
                                id="amount-own"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                            {selectedFromAccount && (
                                <p className="text-sm text-muted-foreground">
                                    Available: ₹{parseFloat(selectedFromAccount.balance).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description-own">Description (Optional)</Label>
                            <Input
                                id="description-own"
                                placeholder="e.g., Monthly savings"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleTransfer}
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
                                `Transfer ₹${amount || '0'}`
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="external" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="from-account-ext">From Account</Label>
                            <Select value={fromAccountId} onValueChange={setFromAccountId}>
                                <SelectTrigger id="from-account-ext">
                                    <SelectValue placeholder="Select source account" />
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
                            <Label htmlFor="external-account">Recipient Account Number</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="external-account"
                                    placeholder="Enter account number"
                                    value={externalAccountNumber}
                                    onChange={(e) => {
                                        setExternalAccountNumber(e.target.value);
                                        setVerifiedAccount(null);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleVerifyAccount}
                                    disabled={verifying || !externalAccountNumber}
                                >
                                    {verifying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            {verifiedAccount && (
                                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                    <p className="text-sm font-medium text-success">✓ Account Verified</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {verifiedAccount.account_type} Account - {verifiedAccount.status}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount-ext">Amount</Label>
                            <Input
                                id="amount-ext"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                            {selectedFromAccount && (
                                <p className="text-sm text-muted-foreground">
                                    Available: ₹{parseFloat(selectedFromAccount.balance).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description-ext">Description (Optional)</Label>
                            <Input
                                id="description-ext"
                                placeholder="e.g., Payment to friend"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleTransfer}
                            disabled={loading || !verifiedAccount}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Transfer ₹${amount || '0'}`
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
