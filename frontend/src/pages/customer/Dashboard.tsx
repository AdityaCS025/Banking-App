import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Send,
    Download,
    PlusCircle,
    Eye,
    Loader2,
    PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TransferMoneyModal } from "@/components/modals/TransferMoneyModal";
import { DepositWithdrawModal } from "@/components/modals/DepositWithdrawModal";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { API_ENDPOINTS } from "@/config/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [cibilScore, setCibilScore] = useState<number | null>(null);

    // Modal states
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [depositWithdrawModalOpen, setDepositWithdrawModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }

            // Fetch user profile
            const profileResponse = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const profileData = await profileResponse.json();
            if (profileResponse.ok) {
                setUser(profileData.data.user);
            }

            // Fetch accounts
            const accountsResponse = await fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const accountsData = await accountsResponse.json();
            if (accountsResponse.ok) {
                setAccounts(accountsData.data.accounts || []);
                const total = (accountsData.data.accounts || []).reduce(
                    (sum: number, acc: any) => sum + parseFloat(acc.balance || 0),
                    0
                );
                setTotalBalance(total);
            }

            // Fetch CIBIL score
            const cibilResponse = await fetch(API_ENDPOINTS.CIBIL, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const cibilData = await cibilResponse.json();
            if (cibilResponse.ok) {
                setCibilScore(cibilData.data.cibil.score || null);
            }

            setLoading(false);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load dashboard data',
            });
            setLoading(false);
        }
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
                    <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                        Welcome back, {user?.full_name || 'User'}!
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Here's what's happening with your accounts today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Total Balance */}
                    <motion.div
                        className="md:col-span-2 p-4 sm:p-6 rounded-2xl gradient-primary text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div>
                                <p className="text-white/70 text-xs sm:text-sm mb-1">Total Balance</p>
                                <h2 className="font-display text-2xl sm:text-4xl font-bold">
                                    ₹{totalBalance.toLocaleString('en-IN')}
                                </h2>
                                <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2">
                                    Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setTransferModalOpen(true)}
                            >
                                <Send className="w-4 h-4 mr-1 sm:mr-2" />
                                Transfer
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setDepositWithdrawModalOpen(true)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Deposit/Withdraw
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/customer/accounts')}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View All
                            </Button>
                        </div>
                    </motion.div>

                    {/* CIBIL Score */}
                    <motion.div
                        className="p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-muted-foreground text-sm">CIBIL Score</p>
                            <TrendingUp className={`w-5 h-5 ${cibilScore && cibilScore >= 700 ? 'text-success' : 'text-warning'}`} />
                        </div>
                        {cibilScore !== null ? (
                            <>
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-muted opacity-20"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray={`${(cibilScore / 900) * 251.2} 251.2`}
                                            className={
                                                cibilScore >= 750 ? 'text-success' :
                                                    cibilScore >= 650 ? 'text-info' :
                                                        cibilScore >= 550 ? 'text-warning' :
                                                            'text-destructive'
                                            }
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">{cibilScore}</span>
                                    </div>
                                </div>
                                <p className={`text-center text-sm font-medium ${cibilScore >= 750 ? 'text-success' :
                                    cibilScore >= 650 ? 'text-info' :
                                        cibilScore >= 550 ? 'text-warning' :
                                            'text-destructive'
                                    }`}>
                                    {cibilScore >= 750 ? 'Excellent' :
                                        cibilScore >= 650 ? 'Good' :
                                            cibilScore >= 550 ? 'Fair' :
                                                'Poor'}
                                </p>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground">Loading...</p>
                        )}
                    </motion.div>
                </div>

                {/* Accounts Grid - Enhanced */}
                <div>
                    <div className="flex justify-between items-center mb-4 gap-2">
                        <h3 className="font-display text-lg sm:text-xl font-bold">Your Accounts</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/customer/accounts')}
                            className="text-xs sm:text-sm"
                        >
                            Manage Accounts
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map((account, index) => (
                            <motion.div
                                key={account.id}
                                className="p-6 rounded-xl bg-gradient-to-br from-card to-secondary border border-border hover:border-accent/50 transition-all cursor-pointer group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate('/customer/accounts')}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                        <CreditCard className="w-6 h-6 text-accent" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                                        }`}>
                                        {account.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1 capitalize">{account.account_type} Account</p>
                                <p className="text-xs text-muted-foreground mb-3 font-mono">
                                    ****{account.account_number.slice(-4)}
                                </p>
                                <p className="text-2xl font-bold mb-1">
                                    ₹{parseFloat(account.balance || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-muted-foreground">Available Balance</p>
                            </motion.div>
                        ))}

                        {/* Add Account Card */}
                        <motion.div
                            className="p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[180px] group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: accounts.length * 0.1 }}
                            onClick={() => navigate('/customer/accounts')}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                                <PlusCircle className="w-6 h-6 text-accent" />
                            </div>
                            <p className="font-medium text-sm">Create New Account</p>
                            <p className="text-xs text-muted-foreground mt-1">Savings or Current</p>
                        </motion.div>
                    </div>
                </div>

                {/* Quick Actions - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50"
                >
                    <h3 className="font-display text-lg sm:text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex-col gap-3 hover:bg-accent/10 hover:border-accent transition-all"
                            onClick={() => navigate('/customer/cards')}
                        >
                            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-accent" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Virtual Cards</p>
                                <p className="text-xs text-muted-foreground mt-1">Manage cards</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex-col gap-3 hover:bg-accent/10 hover:border-accent transition-all"
                            onClick={() => navigate('/customer/deposits')}
                        >
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                <Download className="w-6 h-6 text-success" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Fixed Deposits</p>
                                <p className="text-xs text-muted-foreground mt-1">Earn interest</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex-col gap-3 hover:bg-accent/10 hover:border-accent transition-all"
                            onClick={() => navigate('/customer/transactions')}
                        >
                            <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                                <Send className="w-6 h-6 text-info" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Transactions</p>
                                <p className="text-xs text-muted-foreground mt-1">View history</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex-col gap-3 hover:bg-accent/10 hover:border-accent transition-all"
                            onClick={() => navigate('/customer/profile')}
                        >
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-warning" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Profile</p>
                                <p className="text-xs text-muted-foreground mt-1">Settings & KYC</p>
                            </div>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            <TransferMoneyModal
                open={transferModalOpen}
                onOpenChange={setTransferModalOpen}
                accounts={accounts}
                onSuccess={fetchDashboardData}
            />

            <DepositWithdrawModal
                open={depositWithdrawModalOpen}
                onOpenChange={setDepositWithdrawModalOpen}
                accounts={accounts}
                onSuccess={fetchDashboardData}
            />

            {/* Chatbot Widget */}
            <ChatbotWidget />
        </CustomerLayout>
    );
}
