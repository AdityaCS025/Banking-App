import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Plus, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Accounts() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
    const { toast } = useToast();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setAccounts(data.data.accounts || []);
                if (data.data.accounts.length > 0) {
                    setSelectedAccount(data.data.accounts[0]);
                }
            }
        } catch (error) {
            console.error('Fetch accounts error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        setCreating(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.ACCOUNTS.BASE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account_type: accountType }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Account Created!",
                    description: `Your ${accountType} account has been created successfully.`,
                });
                setDialogOpen(false);
                fetchAccounts();
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to create account",
                    description: data.message || "Please try again.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create account. Please try again.",
            });
        } finally {
            setCreating(false);
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

    if (accounts.length === 0) {
        return (
            <CustomerLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="font-display text-3xl font-bold mb-2">My Accounts</h1>
                        <p className="text-muted-foreground">
                            Manage your accounts and download statements
                        </p>
                    </div>

                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center max-w-md">
                            <PackageOpen className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                            <h2 className="font-display text-2xl font-bold mb-2">No Accounts Yet</h2>
                            <p className="text-muted-foreground mb-6">
                                Create your first bank account to start managing your finances with VaultBank
                            </p>

                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" variant="hero">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Your First Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Account</DialogTitle>
                                        <DialogDescription>
                                            Choose the type of account you want to create
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        <RadioGroup value={accountType} onValueChange={(value: any) => setAccountType(value)}>
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                                                    <RadioGroupItem value="savings" id="savings" />
                                                    <Label htmlFor="savings" className="flex-1 cursor-pointer">
                                                        <div>
                                                            <p className="font-semibold">Savings Account</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Earn interest on your deposits
                                                            </p>
                                                        </div>
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                                                    <RadioGroupItem value="current" id="current" />
                                                    <Label htmlFor="current" className="flex-1 cursor-pointer">
                                                        <div>
                                                            <p className="font-semibold">Current Account</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                For business and frequent transactions
                                                            </p>
                                                        </div>
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>

                                        <Button
                                            onClick={handleCreateAccount}
                                            disabled={creating}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {creating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Account
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-display text-3xl font-bold mb-2">My Accounts</h1>
                        <p className="text-muted-foreground">
                            Manage your accounts and download statements
                        </p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <Plus className="w-4 h-4 mr-2" />
                                New Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Account</DialogTitle>
                                <DialogDescription>
                                    Choose the type of account you want to create
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <RadioGroup value={accountType} onValueChange={(value: any) => setAccountType(value)}>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                                            <RadioGroupItem value="savings" id="savings" />
                                            <Label htmlFor="savings" className="flex-1 cursor-pointer">
                                                <div>
                                                    <p className="font-semibold">Savings Account</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Earn interest on your deposits
                                                    </p>
                                                </div>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-accent transition-colors cursor-pointer">
                                            <RadioGroupItem value="current" id="current" />
                                            <Label htmlFor="current" className="flex-1 cursor-pointer">
                                                <div>
                                                    <p className="font-semibold">Current Account</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        For business and frequent transactions
                                                    </p>
                                                </div>
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>

                                <Button
                                    onClick={handleCreateAccount}
                                    disabled={creating}
                                    className="w-full"
                                    size="lg"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    {accounts.map((account) => (
                        <motion.div
                            key={account.id}
                            className="p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg capitalize">{account.account_type} Account</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {showAccountNumber ? account.account_number : `****${account.account_number.slice(-4)}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                    {showAccountNumber ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-bold">
                                        ₹{parseFloat(account.balance).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                                        {account.status}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </CustomerLayout>
    );
}
