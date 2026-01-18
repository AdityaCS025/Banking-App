import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Shield,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    Lock,
    Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS } from "@/config/api";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                const userData = data.data.user;
                setUser(userData);
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords Don't Match",
                description: "New password and confirm password must match",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                variant: "destructive",
                title: "Password Too Short",
                description: "Password must be at least 8 characters",
            });
            return;
        }

        setChangingPassword(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Password Changed!",
                    description: "Your password has been changed successfully",
                });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Change Failed",
                    description: data.message || "Failed to change password",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to change password",
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const parseAddress = (addressData: string) => {
        if (!addressData) return 'Not available';
        if (addressData.startsWith('{')) {
            try {
                const addressObj = JSON.parse(addressData);
                return `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.state || ''}, ${addressObj.pincode || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
            } catch (e) {
                return addressData;
            }
        }
        return addressData;
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
                {/* Hero Header with Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl gradient-primary p-4 sm:p-8 text-white"
                >
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                                    <User className="w-8 h-8 sm:w-12 sm:h-12" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="font-display text-xl sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2 truncate">{user.full_name || 'User'}</h1>
                                    <p className="text-white/80 flex items-center gap-2 text-sm sm:text-base truncate">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm whitespace-nowrap ${user.kyc_status === 'approved' ? 'bg-success/30 border border-success/50' :
                                            user.kyc_status === 'pending' ? 'bg-warning/30 border border-warning/50' :
                                                'bg-destructive/30 border border-destructive/50'
                                            }`}>
                                            {user.kyc_status === 'approved' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                            {user.kyc_status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                                            {user.kyc_status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                                            KYC {user.kyc_status}
                                        </span>
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm whitespace-nowrap ${user.is_active ? 'bg-success/30 border border-success/50' : 'bg-destructive/30 border border-destructive/50'
                                            }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                                <p className="text-white/60 text-xs sm:text-sm mb-1">Member Since</p>
                                <p className="font-semibold text-sm sm:text-base">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative gradient orbs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-info/20 rounded-full blur-3xl"></div>
                </motion.div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-6">
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <h3 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-accent" />
                                Contact Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-sm">Full Name</Label>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                                        <User className="w-5 h-5 text-accent" />
                                        <span className="font-medium">{user.full_name || 'Not available'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-sm">Email Address</Label>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                                        <Mail className="w-5 h-5 text-accent" />
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-sm">Phone Number</Label>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                                        <Phone className="w-5 h-5 text-accent" />
                                        <span className="font-medium">{user.phone || 'Not available'}</span>
                                    </div>
                                </div>

                                {user.date_of_birth && (
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-sm">Date of Birth</Label>
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                                            <Calendar className="w-5 h-5 text-accent" />
                                            <span className="font-medium">{formatDate(user.date_of_birth)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-muted-foreground text-sm">Address</Label>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                                        <MapPin className="w-5 h-5 text-accent mt-0.5" />
                                        <span className="font-medium">{parseAddress(user.address)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* KYC Documents */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <h3 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-accent" />
                                KYC Documents
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {user.pan_number && (
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-sm">PAN Number</Label>
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-info/10 border border-accent/20">
                                            <CreditCard className="w-5 h-5 text-accent" />
                                            <span className="font-mono font-semibold tracking-wider">{user.pan_number}</span>
                                        </div>
                                    </div>
                                )}

                                {user.aadhaar_number && (
                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground text-sm">Aadhaar Number</Label>
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-info/10 border border-accent/20">
                                            <CreditCard className="w-5 h-5 text-accent" />
                                            <span className="font-mono font-semibold tracking-wider">****-****-{user.aadhaar_number.slice(-4)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 rounded-2xl max-w-2xl"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-xl bg-accent/10">
                                    <Lock className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl font-semibold">Change Password</h3>
                                    <p className="text-muted-foreground text-sm">Keep your account secure with a strong password</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Current Password</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            className="pl-11 h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min 8 characters)"
                                            className="pl-11 h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="pl-11 h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                    className="w-full h-12 rounded-xl font-semibold"
                                    size="lg"
                                >
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5 mr-2" />
                                            Change Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </CustomerLayout>
    );
}
