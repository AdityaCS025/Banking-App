import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ArrowLeft, Eye, EyeOff, Building2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

export default function Login() {
    const [searchParams] = useSearchParams();
    const isBankerLogin = searchParams.get('type') === 'banker';

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Step 1: Validate credentials first
            const loginResponse = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                toast({
                    variant: "destructive",
                    title: "Login failed",
                    description: loginData.message || "Invalid email or password",
                });
                return;
            }

            // For banker login, skip OTP and login directly
            if (isBankerLogin) {
                const userRole = loginData.data.user.role;

                // Verify user is actually a banker
                if (userRole !== 'banker' && userRole !== 'admin') {
                    toast({
                        variant: "destructive",
                        title: "Access Denied",
                        description: "This portal is only for bank employees.",
                    });
                    return;
                }

                // Store tokens and user data
                localStorage.setItem("accessToken", loginData.data.accessToken);
                localStorage.setItem("refreshToken", loginData.data.refreshToken);
                localStorage.setItem("user", JSON.stringify(loginData.data.user));

                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });

                // Navigate to banker dashboard
                navigate("/banker/dashboard");
                return;
            }

            // Step 2: For customers, send OTP
            const otpResponse = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    purpose: "login",
                }),
            });

            const otpData = await otpResponse.json();

            if (otpResponse.ok) {
                toast({
                    title: "OTP Sent",
                    description: "Please check your email for the verification code.",
                });

                // Navigate to OTP verification page with validated credentials
                navigate("/verify-otp", {
                    state: { email, password, preValidated: true },
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to send OTP",
                    description: otpData.message || "Please try again.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to connect to server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Back to home */}
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                {/* Card */}
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBankerLogin ? 'bg-blue-600' : 'bg-accent'}`}>
                            {isBankerLogin ? (
                                <Building2 className="w-6 h-6 text-white" />
                            ) : (
                                <CreditCard className="w-6 h-6 text-accent-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl">VaultBank</h1>
                            <p className="text-sm text-muted-foreground">
                                {isBankerLogin ? 'Banker Portal Sign In' : 'Sign in to your account'}
                            </p>
                        </div>
                    </div>

                    {/* Banker Login Badge */}
                    {isBankerLogin && (
                        <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-400 text-center">
                                🏦 This is the Banker Portal Login
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-card text-muted-foreground">
                                {isBankerLogin ? 'Customer?' : "Don't have an account?"}
                            </span>
                        </div>
                    </div>

                    {/* Sign up link / Switch to customer */}
                    {isBankerLogin ? (
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="w-full">
                                Customer Login
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/signup">
                                <Button variant="outline" size="lg" className="w-full">
                                    Create Account
                                </Button>
                            </Link>
                            <div className="mt-4 text-center">
                                <Link
                                    to="/login?type=banker"
                                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                                >
                                    <Building2 className="w-4 h-4 inline mr-1" />
                                    Banker Portal Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
