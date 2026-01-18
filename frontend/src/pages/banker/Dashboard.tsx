import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Wallet,
    FileCheck,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    IndianRupee,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/api";

interface Stats {
    totalCustomers: number;
    activeAccounts: number;
    pendingVerifications: number;
    totalDeposits: number;
}

interface PendingUser {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

export default function BankerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalCustomers: 0,
        activeAccounts: 0,
        pendingVerifications: 0,
        totalDeposits: 0,
    });
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [recentUsers, setRecentUsers] = useState<PendingUser[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
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

                // Calculate stats
                const pending = customers.filter((u: any) => u.kyc_status === 'pending');
                const totalBalance = accounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || '0'), 0);

                setStats({
                    totalCustomers: customers.length,
                    activeAccounts: accounts.filter((a: any) => a.status === 'active').length,
                    pendingVerifications: pending.length,
                    totalDeposits: totalBalance,
                });

                setPendingUsers(pending.slice(0, 4));
                setRecentUsers(customers.slice(0, 5));
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const statsConfig = [
        { label: "Total Customers", value: stats.totalCustomers.toString(), icon: Users, color: "text-blue-500" },
        { label: "Active Accounts", value: stats.activeAccounts.toString(), icon: Wallet, color: "text-green-500" },
        { label: "Pending Verifications", value: stats.pendingVerifications.toString(), icon: FileCheck, color: "text-orange-500" },
        { label: "Total Deposits", value: formatCurrency(stats.totalDeposits), icon: IndianRupee, color: "text-purple-500" },
    ];

    if (loading) {
        return (
            <BankerLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </BankerLayout>
        );
    }

    return (
        <BankerLayout>
            <div className="space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
                            Welcome back! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your bank today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        System Online
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: "Total Customers", value: stats.totalCustomers.toString(), icon: Users, gradient: "from-blue-500 to-blue-600", bgGlow: "bg-blue-500/10" },
                        { label: "Active Accounts", value: stats.activeAccounts.toString(), icon: Wallet, gradient: "from-emerald-500 to-emerald-600", bgGlow: "bg-emerald-500/10" },
                        { label: "Pending KYC", value: stats.pendingVerifications.toString(), icon: FileCheck, gradient: "from-amber-500 to-orange-500", bgGlow: "bg-amber-500/10" },
                        { label: "Total Deposits", value: formatCurrency(stats.totalDeposits), icon: IndianRupee, gradient: "from-purple-500 to-purple-600", bgGlow: "bg-purple-500/10" },
                    ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                className={`relative p-4 md:p-6 rounded-2xl border border-border/50 overflow-hidden group hover:border-border transition-all duration-300 ${stat.bgGlow}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                                <div className="relative">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 md:mb-4 shadow-lg`}>
                                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <p className="text-muted-foreground text-xs md:text-sm mb-1">{stat.label}</p>
                                    <p className="font-display text-xl md:text-2xl font-bold">{stat.value}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pending Verifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                    <FileCheck className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">Pending Verifications</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => navigate('/banker/verification')}>
                                View All
                            </Button>
                        </div>
                        <div className="p-4 md:p-6 space-y-3">
                            {pendingUsers.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <p className="text-muted-foreground">All caught up! No pending verifications.</p>
                                </div>
                            ) : (
                                pendingUsers.map((user, idx) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-amber-500/20 transition-all duration-200 group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-500 font-semibold text-sm">
                                                    {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.full_name}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/20">
                                                Pending
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatTimeAgo(user.created_at)}
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 opacity-0 group-hover:opacity-100 transition-opacity border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                onClick={() => navigate('/banker/verification')}
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Customers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-display text-lg font-semibold">Recent Customers</h3>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => navigate('/banker/customers')}>
                                View All
                            </Button>
                        </div>
                        <div className="p-4 md:p-6 space-y-2">
                            {recentUsers.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                    className="p-3 rounded-xl hover:bg-secondary/30 transition-all duration-200 flex items-center gap-3 group cursor-pointer"
                                    onClick={() => navigate('/banker/customers')}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                                        {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate group-hover:text-blue-400 transition-colors">{user.full_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground hidden sm:block">{formatTimeAgo(user.created_at)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyOHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative">
                        <h3 className="font-display text-xl md:text-2xl font-bold mb-2 text-white">Quick Actions</h3>
                        <p className="text-blue-200 text-sm mb-6">Access frequently used features</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { icon: FileCheck, label: "Verify KYC", path: "/banker/verification" },
                                { icon: Users, label: "Customers", path: "/banker/customers" },
                                { icon: Wallet, label: "Accounts", path: "/banker/accounts" },
                                { icon: TrendingUp, label: "Reports", path: "/banker/reports" },
                            ].map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant="secondary"
                                    className="h-auto py-4 md:py-5 flex-col gap-2 bg-white/10 hover:bg-white/20 border-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105"
                                    onClick={() => navigate(action.path)}
                                >
                                    <action.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-xs md:text-sm font-medium">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </BankerLayout>
    );
}
