import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Send,
    User,
    Building2,
    Smartphone,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { accountsAPI, transactionsAPI } from "@/lib/api";

const transferModes = [
    {
        id: "imps",
        name: "IMPS",
        description: "Instant transfer (24x7)",
        limit: "₹5,00,000",
        icon: Send,
        fee: "₹5",
    },
    {
        id: "neft",
        name: "NEFT",
        description: "National Electronic Fund Transfer",
        limit: "No limit",
        icon: Building2,
        fee: "Free",
    },
    {
        id: "rtgs",
        name: "RTGS",
        description: "Real Time Gross Settlement",
        limit: "Min ₹2,00,000",
        icon: Building2,
        fee: "₹25",
    },
    {
        id: "upi",
        name: "UPI",
        description: "Unified Payments Interface",
        limit: "₹1,00,000",
        icon: Smartphone,
        fee: "Free",
    },
];

interface Account {
    id: string;
    account_number: string;
    account_type: string;
    balance: string;
    status: string;
}

export default function Transfer() {
    const [selectedMode, setSelectedMode] = useState("imps");
    const [transferType, setTransferType] = useState<"account" | "new">("account");
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(true);
    const { toast } = useToast();

    // New beneficiary fields
    const [beneficiaryName, setBeneficiaryName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [upiId, setUpiId] = useState("");

    // Fetch user accounts on mount
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setIsFetchingAccounts(true);
            const response = await accountsAPI.getAll();
            if (response.success && response.data?.accounts) {
                setAccounts(response.data.accounts);
                // Auto-select first account as source
                if (response.data.accounts.length > 0) {
                    setFromAccount(response.data.accounts[0].id);
                }
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to fetch accounts",
            });
        } finally {
            setIsFetchingAccounts(false);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validation
            if (!amount || parseFloat(amount) <= 0) {
                toast({
                    variant: "destructive",
                    title: "Invalid Amount",
                    description: "Please enter a valid amount",
                });
                setIsLoading(false);
                return;
            }

            if (!fromAccount) {
                toast({
                    variant: "destructive",
                    title: "Invalid Source",
                    description: "Please select a source account",
                });
                setIsLoading(false);
                return;
            }

            if (transferType === "account" && !toAccount) {
                toast({
                    variant: "destructive",
                    title: "Invalid Destination",
                    description: "Please select a destination account",
                });
                setIsLoading(false);
                return;
            }

            // Mode-specific validation
            if (selectedMode === "rtgs" && parseFloat(amount) < 200000) {
                toast({
                    variant: "destructive",
                    title: "Invalid Amount",
                    description: "RTGS requires minimum ₹2,00,000",
                });
                setIsLoading(false);
                return;
            }

            if (selectedMode === "upi" && parseFloat(amount) > 100000) {
                toast({
                    variant: "destructive",
                    title: "Limit Exceeded",
                    description: "UPI limit is ₹1,00,000 per transaction",
                });
                setIsLoading(false);
                return;
            }

            if (selectedMode === "imps" && parseFloat(amount) > 500000) {
                toast({
                    variant: "destructive",
                    title: "Limit Exceeded",
                    description: "IMPS limit is ₹5,00,000 per transaction",
                });
                setIsLoading(false);
                return;
            }

            // Perform transfer
            const response = await transactionsAPI.transfer(
                fromAccount,
                toAccount,
                parseFloat(amount),
                remarks || `${selectedMode.toUpperCase()} Transfer`
            );

            if (response.success) {
                toast({
                    title: "Transfer Successful!",
                    description: `₹${parseFloat(amount).toLocaleString("en-IN")} transferred successfully`,
                });
                setAmount("");
                setRemarks("");
                setToAccount("");
                // Refresh accounts to update balances
                fetchAccounts();
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Transfer Failed",
                description: error.message || "Failed to process transfer",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedModeData = transferModes.find((mode) => mode.id === selectedMode);
    const selectedFromAccount = accounts.find(acc => acc.id === fromAccount);
    const availableToAccounts = accounts.filter(acc => acc.id !== fromAccount);

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl font-bold mb-2">Transfer Money</h1>
                    <p className="text-muted-foreground">
                        Send money via NEFT, RTGS, IMPS, or UPI
                    </p>
                </div>

                {/* Transfer Mode Selection */}
                <div>
                    <h3 className="font-semibold mb-4">Select Transfer Mode</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                        {transferModes.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <motion.button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`p-4 rounded-xl text-left transition-all ${selectedMode === mode.id
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-card border border-border hover:border-accent/50"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon className="w-6 h-6 mb-3" />
                                    <p className="font-semibold mb-1">{mode.name}</p>
                                    <p className="text-xs opacity-80 mb-2">{mode.description}</p>
                                    <div className="flex justify-between text-xs">
                                        <span>Limit: {mode.limit}</span>
                                        <span>Fee: {mode.fee}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Transfer Form */}
                    <div className="lg:col-span-2">
                        <div className="p-6 rounded-xl bg-card border border-border">
                            <h3 className="font-semibold mb-4">Transfer Details</h3>

                            <form onSubmit={handleTransfer} className="space-y-6">
                                {/* Loading State */}
                                {isFetchingAccounts ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <span className="ml-2">Loading accounts...</span>
                                    </div>
                                ) : accounts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No accounts found. Please create an account first.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* From Account Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="fromAccount">From Account</Label>
                                            <Select value={fromAccount} onValueChange={setFromAccount}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map((acc) => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            {acc.account_type.toUpperCase()} - {acc.account_number} (₹{parseFloat(acc.balance).toLocaleString("en-IN")})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedFromAccount && (
                                                <p className="text-xs text-muted-foreground">
                                                    Available Balance: ₹{parseFloat(selectedFromAccount.balance).toLocaleString("en-IN")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Transfer Type Toggle */}
                                        {selectedMode !== "upi" && (
                                            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setTransferType("account")}
                                                    className={`flex-1 py-2 rounded-md transition-colors ${transferType === "account"
                                                        ? "bg-background shadow-sm"
                                                        : "hover:bg-background/50"
                                                        }`}
                                                >
                                                    My Accounts
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTransferType("new")}
                                                    className={`flex-1 py-2 rounded-md transition-colors ${transferType === "new"
                                                        ? "bg-background shadow-sm"
                                                        : "hover:bg-background/50"
                                                        }`}
                                                >
                                                    Other Account
                                                </button>
                                            </div>
                                        )}

                                        {/* To Account Selection */}
                                        {selectedMode === "upi" ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="upiId">UPI ID</Label>
                                                <Input
                                                    id="upiId"
                                                    placeholder="username@upi"
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ) : transferType === "account" ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="toAccount">To Account</Label>
                                                <Select value={toAccount} onValueChange={setToAccount}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select destination account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map((acc) => (
                                                            <SelectItem key={acc.id} value={acc.id}>
                                                                {acc.account_type.toUpperCase()} - {acc.account_number} (₹{parseFloat(acc.balance).toLocaleString("en-IN")})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    You can transfer to any of your accounts
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                                                    <Input
                                                        id="beneficiaryName"
                                                        placeholder="John Doe"
                                                        value={beneficiaryName}
                                                        onChange={(e) => setBeneficiaryName(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="accountNumber">Account Number</Label>
                                                        <Input
                                                            id="accountNumber"
                                                            placeholder="1234567890"
                                                            value={accountNumber}
                                                            onChange={(e) => setAccountNumber(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="ifscCode">IFSC Code</Label>
                                                        <Input
                                                            id="ifscCode"
                                                            placeholder="VBNK0001234"
                                                            value={ifscCode}
                                                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Amount */}
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (₹)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="10000"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                            {selectedModeData && (
                                                <p className="text-xs text-muted-foreground">
                                                    Limit: {selectedModeData.limit} • Fee: {selectedModeData.fee}
                                                </p>
                                            )}
                                        </div>

                                        {/* Remarks */}
                                        <div className="space-y-2">
                                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                                            <Input
                                                id="remarks"
                                                placeholder="Payment for services"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="hero"
                                            size="lg"
                                            className="w-full"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Transfer Money
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Info Sidebar */}
                    <div className="space-y-4">
                        {/* Transaction Limits */}
                        <div className="p-6 rounded-xl bg-card border border-border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-info" />
                                Transaction Limits
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">IMPS</p>
                                    <p className="font-medium">₹5,00,000 per transaction</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">NEFT</p>
                                    <p className="font-medium">No limit</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">RTGS</p>
                                    <p className="font-medium">Min ₹2,00,000</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">UPI</p>
                                    <p className="font-medium">₹1,00,000 per transaction</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="p-6 rounded-xl gradient-primary text-white">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Security Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-white/90">
                                <li>• Verify beneficiary details before transfer</li>
                                <li>• Never share OTP with anyone</li>
                                <li>• Check transaction limits</li>
                                <li>• Save beneficiary for future use</li>
                            </ul>
                        </div>

                        {/* My Accounts */}
                        <div className="p-6 rounded-xl bg-card border border-border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                My Accounts
                            </h3>
                            <div className="space-y-2">
                                {accounts.length > 0 ? (
                                    accounts.map((acc) => (
                                        <div
                                            key={acc.id}
                                            className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                                            onClick={() => {
                                                setFromAccount(acc.id);
                                                setTransferType("account");
                                            }}
                                        >
                                            <p className="font-medium text-sm">{acc.account_type.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {acc.account_number} • ₹{parseFloat(acc.balance).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No accounts available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
