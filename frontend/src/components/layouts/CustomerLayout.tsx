import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    ArrowLeftRight,
    PiggyBank,
    User,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

interface CustomerLayoutProps {
    children: ReactNode;
}

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/customer/dashboard" },
    { icon: Wallet, label: "Accounts", path: "/customer/accounts" },
    { icon: ArrowLeftRight, label: "Transactions", path: "/customer/transactions" },
    { icon: CreditCard, label: "Cards", path: "/customer/cards" },
    { icon: PiggyBank, label: "Deposits", path: "/customer/deposits" },
    { icon: User, label: "Profile", path: "/customer/profile" },
];

export function CustomerLayout({ children }: CustomerLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="font-display font-bold">VaultBank</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6">
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-lg">VaultBank</h1>
                            <p className="text-xs text-muted-foreground">Customer Portal</p>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0">
                <div className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
