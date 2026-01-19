import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    PiggyBank,
    Plus,
    TrendingUp,
    Calendar,
    IndianRupee,
    Loader2,
    PackageOpen,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/config/api";

export default function Deposits() {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [depositType, setDepositType] = useState<"fixed" | "recurring">("fixed");
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [tenure, setTenure] = useState("12");
    const [calculating, setCalculating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const [depositsRes, accountsRes] = await Promise.all([
                fetch(API_ENDPOINTS.DEPOSITS.BASE, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            const depositsData = await depositsRes.json();
            const accountsData = await accountsRes.json();

            if (depositsRes.ok && accountsRes.ok) {
                setDeposits(depositsData.data.deposits || []);
                setAccounts(accountsData.data.accounts || []);
                if (accountsData.data.accounts && accountsData.data.accounts.length > 0) {
                    setAccountId(accountsData.data.accounts[0].id);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInterestRate = (months: number, type: 'fixed' | 'recurring'): number => {
        if (type === 'fixed') {
            if (months >= 60) return 7.5;
            if (months >= 36) return 7.0;
            if (months >= 24) return 6.5;
            if (months >= 12) return 6.0;
            return 5.5;
        } else {
            if (months >= 60) return 7.0;
            if (months >= 36) return 6.5;
            if (months >= 24) return 6.0;
            if (months >= 12) return 5.5;
            return 5.0;
        }
    };

    const calculateMaturity = () => {
        const principal = parseFloat(amount);
        const months = parseInt(tenure);
        const rate = getInterestRate(months, depositType);

        if (depositType === 'fixed') {
            const years = months / 12;
            const n = 4; // Quarterly compounding
            const r = rate / 100;
            return principal * Math.pow(1 + r / n, n * years);
        } else {
            const r = rate / 100;
            return principal * months * (1 + (r / 4) * ((months + 1) / 24));
        }
    };

    const handleCreateDeposit = async () => {
        if (!accountId || !amount || !tenure) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill all fields",
            });
            return;
        }

        setCalculating(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.DEPOSITS.BASE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_id: accountId,
                    deposit_type: depositType,
                    amount: parseFloat(amount),
                    tenure_months: parseInt(tenure),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Deposit Created!",
                    description: `Your ${depositType === 'fixed' ? 'Fixed' : 'Recurring'} Deposit has been created successfully`,
                });
                setCreateModalOpen(false);
                setAmount("");
                setTenure("12");
                fetchData();
            } else {
                toast({
                    variant: "destructive",
                    title: "Creation Failed",
                    description: data.message || "Failed to create deposit",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create deposit",
            });
        } finally {
            setCalculating(false);
        }
    };

    const handleBreakDeposit = async (depositId: string) => {
        if (!confirm('Are you sure you want to break this deposit early? You may lose interest.')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.DEPOSITS.BREAK(depositId), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Deposit Broken",
                    description: "Deposit has been broken successfully",
                });
                fetchData();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to break deposit",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to break deposit",
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getDaysRemaining = (maturityDate: string) => {
        const today = new Date();
        const maturity = new Date(maturityDate);
        const diff = maturity.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </CustomerLayout>
        );
    }

    const activeDeposits = deposits.filter(d => d.status === 'active');
    const totalInvested = activeDeposits.reduce((sum, d) => sum + parseFloat(d.principal_amount || 0), 0);
    const totalMaturity = activeDeposits.reduce((sum, d) => sum + parseFloat(d.maturity_amount || 0), 0);

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Deposits</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Fixed and Recurring deposits with attractive interest rates
                        </p>
                    </div>

                    <Button onClick={() => setCreateModalOpen(true)} size="lg" className="w-full sm:w-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Deposit
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <motion.div
                        className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">
                                    ₹{totalInvested.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-muted-foreground">Maturity Value</p>
                                <p className="font-display text-xl sm:text-2xl font-bold text-success">
                                    ₹{totalMaturity.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-4 sm:p-6 rounded-2xl gradient-primary text-white sm:col-span-2 md:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-white/70">Total Interest</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">
                                    ₹{(totalMaturity - totalInvested).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Deposits List */}
                {deposits.length === 0 ? (
                    <div className="p-12 rounded-xl bg-card border border-border text-center">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Deposits Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start investing with Fixed or Recurring Deposits and earn attractive interest
                        </p>
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Deposit
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h3 className="font-semibold">My Deposits ({deposits.length})</h3>
                        {deposits.map((deposit, index) => (
                            <motion.div
                                key={deposit.id}
                                className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20`}>
                                                <PiggyBank className={`w-5 h-5 sm:w-6 sm:h-6 text-primary`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold capitalize text-sm sm:text-base">
                                                    Deposit
                                                </h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {deposit.tenure_months}mo @ {deposit.interest_rate}%
                                                </p>
                                            </div>
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${deposit.status === 'active' ? 'bg-success/20 text-success' :
                                                deposit.status === 'matured' ? 'bg-primary/20 text-primary' :
                                                    'bg-destructive/20 text-destructive'
                                                }`}>
                                                {deposit.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Principal
                                                </p>
                                                <p className="font-semibold text-sm sm:text-base">
                                                    ₹{parseFloat(deposit.principal_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Maturity</p>
                                                <p className="font-semibold text-success text-sm sm:text-base">
                                                    ₹{parseFloat(deposit.maturity_amount).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                                                <p className="font-semibold text-sm sm:text-base">{formatDate(deposit.maturity_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Days Left</p>
                                                <p className="font-semibold text-sm sm:text-base">
                                                    {deposit.status === 'active' ? getDaysRemaining(deposit.maturity_date) : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {deposit.status === 'active' && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBreakDeposit(deposit.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    Break Deposit
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Deposit Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Deposit</DialogTitle>
                        <DialogDescription>
                            Choose between Fixed Deposit (FD) or Recurring Deposit (RD)
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={depositType} onValueChange={(v: any) => setDepositType(v)} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="fixed">Fixed Deposit</TabsTrigger>
                            <TabsTrigger value="recurring">Recurring Deposit</TabsTrigger>
                        </TabsList>

                        <TabsContent value="fixed" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Account</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <Label>Principal Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="10000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tenure (Months)</Label>
                                <Select value={tenure} onValueChange={setTenure}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6 Months (5.5% p.a.)</SelectItem>
                                        <SelectItem value="12">12 Months (6.0% p.a.)</SelectItem>
                                        <SelectItem value="24">24 Months (6.5% p.a.)</SelectItem>
                                        <SelectItem value="36">36 Months (7.0% p.a.)</SelectItem>
                                        <SelectItem value="60">60 Months (7.5% p.a.)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {amount && tenure && (
                                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-success" />
                                        <p className="font-semibold text-success">Maturity Calculation</p>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p>Interest Rate: <span className="font-semibold">{getInterestRate(parseInt(tenure), 'fixed')}% p.a.</span></p>
                                        <p>Maturity Amount: <span className="font-semibold text-lg">₹{calculateMaturity().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
                                        <p className="text-success">Interest Earned: ₹{(calculateMaturity() - parseFloat(amount)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="recurring" className="space-y-4 mt-4">
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-primary" />
                                    <p className="text-sm text-primary">
                                        For RD, you'll deposit the same amount every month for the selected tenure
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Account</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <Label>Monthly Installment (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tenure (Months)</Label>
                                <Select value={tenure} onValueChange={setTenure}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">6 Months (5.0% p.a.)</SelectItem>
                                        <SelectItem value="12">12 Months (5.5% p.a.)</SelectItem>
                                        <SelectItem value="24">24 Months (6.0% p.a.)</SelectItem>
                                        <SelectItem value="36">36 Months (6.5% p.a.)</SelectItem>
                                        <SelectItem value="60">60 Months (7.0% p.a.)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {amount && tenure && (
                                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-success" />
                                        <p className="font-semibold text-success">Maturity Calculation</p>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p>Interest Rate: <span className="font-semibold">{getInterestRate(parseInt(tenure), 'recurring')}% p.a.</span></p>
                                        <p>Total Investment: <span className="font-semibold">₹{(parseFloat(amount) * parseInt(tenure)).toLocaleString('en-IN')}</span></p>
                                        <p>Maturity Amount: <span className="font-semibold text-lg">₹{calculateMaturity().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
                                        <p className="text-success">Interest Earned: ₹{(calculateMaturity() - (parseFloat(amount) * parseInt(tenure))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <Button
                        onClick={handleCreateDeposit}
                        disabled={calculating}
                        className="w-full mt-4"
                        size="lg"
                    >
                        {calculating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            `Create ${depositType === 'fixed' ? 'Fixed' : 'Recurring'} Deposit`
                        )}
                    </Button>
                </DialogContent>
            </Dialog>
        </CustomerLayout>
    );
}
