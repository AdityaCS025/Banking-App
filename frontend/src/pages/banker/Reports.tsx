import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Wallet,
    PiggyBank,
    CreditCard,
    IndianRupee,
    Calendar,
    Download,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

export default function BankerReports() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("month");
    const { toast } = useToast();

    // Stats data
    const [stats, setStats] = useState({
        totalCustomers: 0,
        newCustomers: 0,
        totalAccounts: 0,
        totalBalance: 0,
        totalDeposits: 0,
        activeCards: 0,
        pendingKyc: 0,
        approvedKyc: 0,
    });

    useEffect(() => {
        fetchReportData();
    }, [period]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch users
            const usersRes = await fetch(API_ENDPOINTS.AUTH.USERS, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const usersData = await usersRes.json();

            // Fetch accounts
            const accountsRes = await fetch(API_ENDPOINTS.ACCOUNTS.ALL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const accountsData = await accountsRes.json();

            if (usersRes.ok && accountsRes.ok) {
                const users = usersData.data.users || [];
                const accounts = accountsData.data.accounts || [];
                const customers = users.filter((u: any) => u.role === 'customer');

                // Calculate date threshold based on period
                const now = new Date();
                let threshold = new Date();
                if (period === 'week') {
                    threshold.setDate(now.getDate() - 7);
                } else if (period === 'month') {
                    threshold.setMonth(now.getMonth() - 1);
                } else if (period === 'quarter') {
                    threshold.setMonth(now.getMonth() - 3);
                } else {
                    threshold.setFullYear(now.getFullYear() - 1);
                }

                const newCustomers = customers.filter((c: any) => new Date(c.created_at) >= threshold);

                setStats({
                    totalCustomers: customers.length,
                    newCustomers: newCustomers.length,
                    totalAccounts: accounts.length,
                    totalBalance: accounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || '0'), 0),
                    totalDeposits: 0, // Would need deposits API
                    activeCards: 0, // Would need cards API
                    pendingKyc: customers.filter((c: any) => c.kyc_status === 'pending').length,
                    approvedKyc: customers.filter((c: any) => c.kyc_status === 'approved').length,
                });
            }
        } catch (error) {
            console.error('Fetch report data error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load report data",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        toast({
            title: "Export Started",
            description: "Your report is being generated...",
        });
        // In a real app, this would generate and download a PDF/CSV
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
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Reports</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Analytics and insights for your branch
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[140px]">
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">This Quarter</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExportReport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">{stats.totalCustomers}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-success text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+{stats.newCustomers} new</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Accounts</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">{stats.totalAccounts}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-success text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>Active</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">
                                    ₹{(stats.totalBalance / 100000).toFixed(1)}L
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-success text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12%</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-4 sm:p-6 rounded-xl gradient-primary text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-white/70">KYC Approved</p>
                                <p className="font-display text-xl sm:text-2xl font-bold">
                                    {stats.totalCustomers > 0
                                        ? Math.round((stats.approvedKyc / stats.totalCustomers) * 100)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-white/70">
                            {stats.pendingKyc} pending
                        </div>
                    </motion.div>
                </div>

                {/* Report Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Growth */}
                    <motion.div
                        className="p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-accent" />
                            Customer Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">Total Customers</span>
                                <span className="font-bold">{stats.totalCustomers}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">New This Period</span>
                                <span className="font-bold text-success">+{stats.newCustomers}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">KYC Approved</span>
                                <span className="font-bold text-success">{stats.approvedKyc}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">KYC Pending</span>
                                <span className="font-bold text-warning">{stats.pendingKyc}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Account Stats */}
                    <motion.div
                        className="p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-accent" />
                            Account Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">Total Accounts</span>
                                <span className="font-bold">{stats.totalAccounts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">Total Balance</span>
                                <span className="font-bold">₹{stats.totalBalance.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">Average Balance</span>
                                <span className="font-bold">
                                    ₹{stats.totalAccounts > 0
                                        ? Math.round(stats.totalBalance / stats.totalAccounts).toLocaleString('en-IN')
                                        : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                <span className="text-muted-foreground">Accounts per Customer</span>
                                <span className="font-bold">
                                    {stats.totalCustomers > 0
                                        ? (stats.totalAccounts / stats.totalCustomers).toFixed(1)
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Summary */}
                <motion.div
                    className="p-6 rounded-xl gradient-primary text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="font-display text-xl font-bold mb-4">Quick Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <PiggyBank className="w-8 h-8 mb-2 opacity-70" />
                            <p className="text-sm text-white/70">Deposits</p>
                            <p className="font-display text-xl font-bold">--</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <CreditCard className="w-8 h-8 mb-2 opacity-70" />
                            <p className="text-sm text-white/70">Active Cards</p>
                            <p className="font-display text-xl font-bold">--</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-70" />
                            <p className="text-sm text-white/70">Transactions</p>
                            <p className="font-display text-xl font-bold">--</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                            <BarChart3 className="w-8 h-8 mb-2 opacity-70" />
                            <p className="text-sm text-white/70">Growth Rate</p>
                            <p className="font-display text-xl font-bold">+12%</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </BankerLayout>
    );
}
