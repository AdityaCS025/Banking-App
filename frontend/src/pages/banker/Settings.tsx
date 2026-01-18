import { BankerLayout } from "@/components/layouts/BankerLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    LogOut,
    Save,
    Loader2,
    Moon,
    Sun,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function BankerSettings() {
    const [saving, setSaving] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        kycAlerts: true,
        transactionAlerts: false,
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSaveSettings = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated",
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast({
            title: "Logged Out",
            description: "You have been logged out successfully",
        });
        navigate('/login');
    };

    return (
        <BankerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Settings</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Manage your account and preferences
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full max-w-lg grid-cols-3">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <motion.div
                            className="p-6 rounded-xl bg-card border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-accent" />
                                Profile Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue="Banker User" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue="banker@vaultbank.com" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input defaultValue="+91 9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employee ID</Label>
                                    <Input defaultValue="EMP001" disabled />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="p-6 rounded-xl bg-card border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-accent" />
                                Security
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                                    </div>
                                    <Button variant="outline" size="sm">Change</Button>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add extra security</p>
                                    </div>
                                    <Button variant="outline" size="sm">Enable</Button>
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <motion.div
                            className="p-6 rounded-xl bg-card border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-accent" />
                                Notification Preferences
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                                    </div>
                                    <Switch
                                        checked={notifications.email}
                                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                                    />
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-muted-foreground">Browser notifications</p>
                                    </div>
                                    <Switch
                                        checked={notifications.push}
                                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                                    />
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">KYC Alerts</p>
                                        <p className="text-sm text-muted-foreground">New KYC verification requests</p>
                                    </div>
                                    <Switch
                                        checked={notifications.kycAlerts}
                                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, kycAlerts: checked }))}
                                    />
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="font-medium">Transaction Alerts</p>
                                        <p className="text-sm text-muted-foreground">Large transaction notifications</p>
                                    </div>
                                    <Switch
                                        checked={notifications.transactionAlerts}
                                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, transactionAlerts: checked }))}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <motion.div
                            className="p-6 rounded-xl bg-card border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-accent" />
                                Appearance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-3">
                                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                        <div>
                                            <p className="font-medium">Dark Mode</p>
                                            <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={darkMode}
                                        onCheckedChange={setDarkMode}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="p-6 rounded-xl bg-card border border-border"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-accent" />
                                Regional
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-1">Language</p>
                                    <p className="font-medium">English (India)</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-1">Currency</p>
                                    <p className="font-medium">INR (₹)</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-1">Time Zone</p>
                                    <p className="font-medium">IST (UTC+5:30)</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-1">Date Format</p>
                                    <p className="font-medium">DD/MM/YYYY</p>
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleSaveSettings} disabled={saving} className="flex-1 sm:flex-none">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="flex-1 sm:flex-none">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </BankerLayout>
    );
}
