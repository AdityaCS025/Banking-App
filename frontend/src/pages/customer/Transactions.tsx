import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Download,
    CheckCircle,
    Loader2,
    PackageOpen,
    ArrowLeftRight,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

export default function Transactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch transactions
            const txResponse = await fetch(API_ENDPOINTS.TRANSACTIONS.BASE, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const txData = await txResponse.json();

            // Fetch accounts
            const accResponse = await fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const accData = await accResponse.json();

            if (txResponse.ok && accResponse.ok) {
                setTransactions(txData.data.transactions || []);
                setAccounts(accData.data.accounts || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load transactions",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAccount =
            selectedAccount === "all" || tx.account_id === selectedAccount;
        const matchesType =
            selectedType === "all" || tx.type === selectedType;
        return matchesSearch && matchesAccount && matchesType;
    });

    const totalCredit = transactions
        .filter((tx) => tx.type === "deposit")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const totalDebit = transactions
        .filter((tx) => tx.type === "withdrawal" || tx.type === "transfer")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "deposit":
                return <ArrowDownLeft className="w-6 h-6 text-success" />;
            case "withdrawal":
                return <ArrowUpRight className="w-6 h-6 text-destructive" />;
            case "transfer":
                return <ArrowLeftRight className="w-6 h-6 text-primary" />;
            default:
                return <Wallet className="w-6 h-6 text-muted-foreground" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case "deposit":
                return "bg-success/20";
            case "withdrawal":
                return "bg-destructive/20";
            case "transfer":
                return "bg-primary/20";
            default:
                return "bg-secondary";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
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

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-display text-3xl font-bold mb-2">Transactions</h1>
                    <p className="text-muted-foreground">
                        View and manage all your transactions
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        className="p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                <ArrowDownLeft className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Credit</p>
                                <p className="font-display text-2xl font-bold text-success">
                                    +₹{totalCredit.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Debit</p>
                                <p className="font-display text-2xl font-bold text-destructive">
                                    -₹{totalDebit.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-6 rounded-2xl gradient-primary text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-white/70">Net Flow</p>
                                <p className="font-display text-2xl font-bold">
                                    ₹{(totalCredit - totalDebit).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="p-6 rounded-xl bg-card border border-border">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Accounts</SelectItem>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.account_type} - ****{account.account_number.slice(-4)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="deposit">Deposit</SelectItem>
                                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" size="sm" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            Export (Coming Soon)
                        </Button>
                    </div>
                </div>

                {/* Transactions List */}
                {filteredTransactions.length === 0 ? (
                    <div className="p-12 rounded-xl bg-card border border-border text-center">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Transactions Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start making deposits, withdrawals, or transfers to see your transaction history
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">
                                {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
                            </h3>
                        </div>

                        {filteredTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                                            {getTransactionIcon(tx.type)}
                                        </div>

                                        <div>
                                            <p className="font-medium">{tx.description || 'Transaction'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(tx.created_at)} • {formatTime(tx.created_at)}
                                                </p>
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground capitalize">
                                                    {tx.type}
                                                </span>
                                            </div>
                                            {tx.recipient_account && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    To: {tx.recipient_account} {tx.recipient_name && `(${tx.recipient_name})`}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-display text-xl font-bold ${tx.type === "deposit" ? "text-success" : "text-foreground"}`}>
                                            {tx.type === "deposit" ? "+" : "-"}₹
                                            {parseFloat(tx.amount).toLocaleString("en-IN")}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                            <CheckCircle className="w-3 h-3 text-success" />
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
