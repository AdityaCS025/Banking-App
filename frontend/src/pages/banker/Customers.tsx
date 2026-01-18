import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Mail,
    Phone,
    Calendar,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

interface Customer {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    date_of_birth?: string;
    pan_number?: string;
    aadhaar_number?: string;
    address?: string;
    role: string;
    kyc_status: 'pending' | 'approved' | 'rejected';
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
}

export default function BankerCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [kycFilter, setKycFilter] = useState<string>("all");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updatingKyc, setUpdatingKyc] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.USERS, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                setCustomers(data.data.users.filter((u: Customer) => u.role === 'customer'));
            }
        } catch (error) {
            console.error('Fetch customers error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load customers",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateKyc = async (customerId: string, status: 'approved' | 'rejected') => {
        setUpdatingKyc(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_KYC(customerId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kyc_status: status }),
            });

            if (response.ok) {
                toast({
                    title: "KYC Updated",
                    description: `Customer KYC status updated to ${status}`,
                });
                fetchCustomers();
                setDetailsOpen(false);
            } else {
                throw new Error('Failed to update KYC');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update KYC status",
            });
        } finally {
            setUpdatingKyc(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);
        const matchesKyc = kycFilter === "all" || customer.kyc_status === kycFilter;
        return matchesSearch && matchesKyc;
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
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Customers</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Manage customer accounts and KYC verification
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <span className="text-sm font-medium text-blue-400">
                                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-secondary/50 border-border/50 focus:border-blue-500/50"
                        />
                    </div>
                    <Select value={kycFilter} onValueChange={setKycFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-secondary/50 border-border/50">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="KYC Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Customers List */}
                <div className="space-y-3">
                    {filteredCustomers.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-card/50 border border-border/50 text-center backdrop-blur-sm">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-10 h-10 text-blue-500/50" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">No Customers Found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || kycFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "No customers registered yet"}
                            </p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer, index) => (
                            <motion.div
                                key={customer.id}
                                className="p-4 sm:p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-blue-500/30 hover:bg-card/80 transition-all duration-200 backdrop-blur-sm group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-semibold">
                                            {customer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors">{customer.full_name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${customer.kyc_status === 'approved'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : customer.kyc_status === 'pending'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {customer.kyc_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                            {customer.kyc_status === 'pending' && <Clock className="w-3 h-3" />}
                                            {customer.kyc_status === 'rejected' && <XCircle className="w-3 h-3" />}
                                            {customer.kyc_status.charAt(0).toUpperCase() + customer.kyc_status.slice(1)}
                                        </span>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${customer.is_active
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                            }`}>
                                            {customer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-1.5" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Customer Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Customer Details</DialogTitle>
                        <DialogDescription>
                            View and manage customer information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCustomer && (
                        <div className="space-y-6 mt-4">
                            {/* Customer Header */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                                    {selectedCustomer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold">{selectedCustomer.full_name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCustomer.kyc_status === 'approved'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : selectedCustomer.kyc_status === 'pending'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            KYC {selectedCustomer.kyc_status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCustomer.is_active
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                            }`}>
                                            {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        {selectedCustomer.email_verified && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                Email Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">Email</span>
                                    </div>
                                    <p className="font-medium">{selectedCustomer.email}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">Phone</span>
                                    </div>
                                    <p className="font-medium">{selectedCustomer.phone}</p>
                                </div>
                                {selectedCustomer.date_of_birth && (
                                    <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">Date of Birth</span>
                                        </div>
                                        <p className="font-medium">{formatDate(selectedCustomer.date_of_birth)}</p>
                                    </div>
                                )}
                                <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Member Since</span>
                                    </div>
                                    <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                                </div>
                            </div>

                            {/* KYC Documents */}
                            <div className="p-5 rounded-xl bg-card/50 border border-border/50">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    KYC Documents
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">PAN Number</p>
                                        <p className="font-mono font-medium text-blue-400">
                                            {selectedCustomer.pan_number || <span className="text-muted-foreground">Not provided</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Aadhaar Number</p>
                                        <p className="font-mono font-medium text-blue-400">
                                            {selectedCustomer.aadhaar_number
                                                ? `****-****-${selectedCustomer.aadhaar_number.slice(-4)}`
                                                : <span className="text-muted-foreground">Not provided</span>}
                                        </p>
                                    </div>
                                    {selectedCustomer.address && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-muted-foreground mb-1">Address</p>
                                            <p className="font-medium">{selectedCustomer.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KYC Actions */}
                            {selectedCustomer.kyc_status === 'pending' && (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
                                        onClick={() => handleUpdateKyc(selectedCustomer.id, 'approved')}
                                        disabled={updatingKyc}
                                    >
                                        {updatingKyc ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Approve KYC
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 shadow-lg shadow-red-500/25"
                                        onClick={() => handleUpdateKyc(selectedCustomer.id, 'rejected')}
                                        disabled={updatingKyc}
                                    >
                                        {updatingKyc ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Reject KYC
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </BankerLayout>
    );
}
