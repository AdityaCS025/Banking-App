import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Wallet,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    CreditCard,
    TrendingUp,
    IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

interface Account {
    id: string;
    user_id: string;
    account_number: string;
    account_type: 'savings' | 'current';
    balance: string;
    status: 'active' | 'inactive' | 'frozen';
    created_at: string;
    user?: {
        full_name: string;
        email: string;
        phone: string;
    };
}

export default function BankerAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { toast } = useToast();

    // Stats
    const [stats, setStats] = useState({
        totalAccounts: 0,
        activeAccounts: 0,
        totalBalance: 0,
        savingsAccounts: 0,
        currentAccounts: 0,
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.ACCOUNTS.ALL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                const accountsList = data.data.accounts || [];
                setAccounts(accountsList);

                // Calculate stats
                setStats({
                    totalAccounts: accountsList.length,
                    activeAccounts: accountsList.filter((a: Account) => a.status === 'active').length,
                    totalBalance: accountsList.reduce((sum: number, a: Account) => sum + parseFloat(a.balance || '0'), 0),
                    savingsAccounts: accountsList.filter((a: Account) => a.account_type === 'savings').length,
                    currentAccounts: accountsList.filter((a: Account) => a.account_type === 'current').length,
                });
            }
        } catch (error) {
            console.error('Fetch accounts error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load accounts",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = account.account_number.includes(searchTerm) ||
            account.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || account.account_type === typeFilter;
        const matchesStatus = statusFilter === "all" || account.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <BankerLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </BankerLayout>
        );
    }

    return (
        <BankerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Accounts</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Manage all customer bank accounts
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                                <p className="font-display text-lg sm:text-2xl font-bold">{stats.totalAccounts}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                                <p className="font-display text-lg sm:text-2xl font-bold">{stats.activeAccounts}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Savings</p>
                                <p className="font-display text-lg sm:text-2xl font-bold">{stats.savingsAccounts}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl gradient-primary text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-white/70">Total Balance</p>
                                <p className="font-display text-lg sm:text-2xl font-bold">
                                    ₹{(stats.totalBalance / 100000).toFixed(1)}L
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by account number, name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="frozen">Frozen</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Accounts List */}
                <div className="space-y-3">
                    {filteredAccounts.length === 0 ? (
                        <div className="p-12 rounded-xl bg-card border border-border text-center">
                            <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">No Accounts Found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "No accounts created yet"}
                            </p>
                        </div>
                    ) : (
                        filteredAccounts.map((account, index) => (
                            <motion.div
                                key={account.id}
                                className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${account.account_type === 'savings' ? 'bg-accent/20' : 'bg-info/20'
                                            }`}>
                                            <CreditCard className={`w-6 h-6 ${account.account_type === 'savings' ? 'text-accent' : 'text-info'
                                                }`} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold capitalize">{account.account_type} Account</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${account.status === 'active' ? 'bg-success/20 text-success' :
                                                    account.status === 'frozen' ? 'bg-destructive/20 text-destructive' :
                                                        'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {account.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-mono">
                                                {account.account_number}
                                            </p>
                                            {account.user && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {account.user.full_name} • {account.user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Balance</p>
                                            <p className="font-display text-xl font-bold">
                                                ₹{parseFloat(account.balance).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedAccount(account);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Account Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Account Details</DialogTitle>
                        <DialogDescription>
                            View account information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAccount && (
                        <div className="space-y-4 mt-4">
                            <div className="p-4 rounded-xl bg-secondary/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {selectedAccount.account_type} Account
                                        </p>
                                        <p className="font-mono text-lg">{selectedAccount.account_number}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedAccount.status === 'active' ? 'bg-success/20 text-success' :
                                        selectedAccount.status === 'frozen' ? 'bg-destructive/20 text-destructive' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {selectedAccount.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl gradient-primary text-white">
                                <p className="text-sm text-white/70">Current Balance</p>
                                <p className="font-display text-3xl font-bold">
                                    ₹{parseFloat(selectedAccount.balance).toLocaleString('en-IN')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <p className="text-xs text-muted-foreground mb-1">Created On</p>
                                    <p className="font-medium">{formatDate(selectedAccount.created_at)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <p className="text-xs text-muted-foreground mb-1">Account Type</p>
                                    <p className="font-medium capitalize">{selectedAccount.account_type}</p>
                                </div>
                            </div>

                            {selectedAccount.user && (
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <p className="text-sm text-muted-foreground mb-2">Account Holder</p>
                                    <p className="font-semibold">{selectedAccount.user.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedAccount.user.email}</p>
                                    <p className="text-sm text-muted-foreground">{selectedAccount.user.phone}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </BankerLayout>
    );
}
