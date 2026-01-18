import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    FileCheck,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    User,
    Shield,
    AlertCircle,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

interface PendingVerification {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    date_of_birth?: string;
    pan_number?: string;
    aadhaar_number?: string;
    address?: string;
    kyc_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function BankerVerification() {
    const [pendingUsers, setPendingUsers] = useState<PendingVerification[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<PendingVerification[]>([]);
    const [rejectedUsers, setRejectedUsers] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<PendingVerification | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updatingKyc, setUpdatingKyc] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.USERS, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                const customers = data.data.users.filter((u: PendingVerification) => u.kyc_status);
                setPendingUsers(customers.filter((u: PendingVerification) => u.kyc_status === 'pending'));
                setApprovedUsers(customers.filter((u: PendingVerification) => u.kyc_status === 'approved'));
                setRejectedUsers(customers.filter((u: PendingVerification) => u.kyc_status === 'rejected'));
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load verification data",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateKyc = async (userId: string, status: 'approved' | 'rejected') => {
        setUpdatingKyc(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_KYC(userId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kyc_status: status,
                    ...(status === 'rejected' && rejectionReason ? { reason: rejectionReason } : {}),
                }),
            });

            if (response.ok) {
                toast({
                    title: status === 'approved' ? "KYC Approved" : "KYC Rejected",
                    description: `Customer KYC has been ${status}`,
                });
                fetchUsers();
                setDetailsOpen(false);
                setRejectionReason("");
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const filterUsers = (users: PendingVerification[]) => {
        return users.filter(user =>
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
        );
    };

    const VerificationCard = ({ user, index }: { user: PendingVerification; index: number }) => (
        <motion.div
            className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-accent" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold truncate">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                            Applied: {formatDate(user.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.kyc_status === 'approved' ? 'bg-success/20 text-success' :
                        user.kyc_status === 'pending' ? 'bg-warning/20 text-warning' :
                            'bg-destructive/20 text-destructive'
                        }`}>
                        {user.kyc_status === 'approved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {user.kyc_status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                        {user.kyc_status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                        {user.kyc_status}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedUser(user);
                            setDetailsOpen(true);
                        }}
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                    </Button>
                </div>
            </div>
        </motion.div>
    );

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
                        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">KYC Verification</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Review and verify customer KYC documents
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-warning/10 border border-warning/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                                <p className="font-display text-xl sm:text-3xl font-bold">{pendingUsers.length}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-success/10 border border-success/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
                                <p className="font-display text-xl sm:text-3xl font-bold">{approvedUsers.length}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="p-4 sm:p-6 rounded-xl bg-destructive/10 border border-destructive/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3">
                            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Rejected</p>
                                <p className="font-display text-xl sm:text-3xl font-bold">{rejectedUsers.length}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="pending" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">Pending</span>
                            <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-full text-xs">
                                {pendingUsers.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="approved" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Approved</span>
                            <span className="bg-success/20 text-success px-2 py-0.5 rounded-full text-xs">
                                {approvedUsers.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="rejected" className="flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Rejected</span>
                            <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded-full text-xs">
                                {rejectedUsers.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-3">
                        {filterUsers(pendingUsers).length === 0 ? (
                            <div className="p-12 rounded-xl bg-card border border-border text-center">
                                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
                                <p className="text-muted-foreground">No pending verifications</p>
                            </div>
                        ) : (
                            filterUsers(pendingUsers).map((user, index) => (
                                <VerificationCard key={user.id} user={user} index={index} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-3">
                        {filterUsers(approvedUsers).length === 0 ? (
                            <div className="p-12 rounded-xl bg-card border border-border text-center">
                                <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">No Approved KYCs</h3>
                                <p className="text-muted-foreground">Approved verifications will appear here</p>
                            </div>
                        ) : (
                            filterUsers(approvedUsers).map((user, index) => (
                                <VerificationCard key={user.id} user={user} index={index} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-3">
                        {filterUsers(rejectedUsers).length === 0 ? (
                            <div className="p-12 rounded-xl bg-card border border-border text-center">
                                <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">No Rejected KYCs</h3>
                                <p className="text-muted-foreground">Rejected verifications will appear here</p>
                            </div>
                        ) : (
                            filterUsers(rejectedUsers).map((user, index) => (
                                <VerificationCard key={user.id} user={user} index={index} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Review Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>KYC Review</DialogTitle>
                        <DialogDescription>
                            Review customer documents and verify identity
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6 mt-4">
                            {/* Customer Info */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                                    <User className="w-8 h-8 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold">{selectedUser.full_name}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                                </div>
                            </div>

                            {/* KYC Documents */}
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-accent" />
                                    KYC Documents
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-secondary/50">
                                        <p className="text-xs text-muted-foreground mb-1">PAN Number</p>
                                        <p className="font-mono font-semibold">
                                            {selectedUser.pan_number || (
                                                <span className="text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Not provided
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-secondary/50">
                                        <p className="text-xs text-muted-foreground mb-1">Aadhaar Number</p>
                                        <p className="font-mono font-semibold">
                                            {selectedUser.aadhaar_number ? (
                                                `****-****-${selectedUser.aadhaar_number.slice(-4)}`
                                            ) : (
                                                <span className="text-destructive flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Not provided
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {selectedUser.date_of_birth && (
                                        <div className="p-3 rounded-lg bg-secondary/50">
                                            <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                                            <p className="font-semibold">{formatDate(selectedUser.date_of_birth)}</p>
                                        </div>
                                    )}
                                    {selectedUser.address && (
                                        <div className="p-3 rounded-lg bg-secondary/50 sm:col-span-2">
                                            <p className="text-xs text-muted-foreground mb-1">Address</p>
                                            <p className="font-semibold">{selectedUser.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions for Pending KYC */}
                            {selectedUser.kyc_status === 'pending' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Rejection Reason (optional)</Label>
                                        <Textarea
                                            placeholder="Enter reason if rejecting..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            className="flex-1"
                                            onClick={() => handleUpdateKyc(selectedUser.id, 'approved')}
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
                                            className="flex-1"
                                            onClick={() => handleUpdateKyc(selectedUser.id, 'rejected')}
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
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </BankerLayout>
    );
}
