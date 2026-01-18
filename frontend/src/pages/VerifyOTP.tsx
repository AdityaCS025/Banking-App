import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { CreditCard, ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

export default function VerifyOTP() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const email = location.state?.email;
    const password = location.state?.password;

    useEffect(() => {
        // Redirect if no email in state
        if (!email) {
            toast({
                variant: "destructive",
                title: "Session expired",
                description: "Please login again.",
            });
            navigate("/login");
        }
    }, [email, navigate, toast]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verify the OTP
            const verifyResponse = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                    purpose: "login",
                }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                toast({
                    variant: "destructive",
                    title: "Invalid OTP",
                    description: verifyData.message || "Please check your OTP and try again.",
                });
                return;
            }

            // OTP is valid, proceed with login
            const loginResponse = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                // Store tokens
                localStorage.setItem("accessToken", loginData.data.accessToken);
                localStorage.setItem("refreshToken", loginData.data.refreshToken);
                localStorage.setItem("user", JSON.stringify(loginData.data.user));

                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });

                // Navigate based on user role
                const userRole = loginData.data.user.role;
                if (userRole === "banker") {
                    navigate("/banker/dashboard");
                } else if (userRole === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/customer/dashboard");
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Login failed",
                    description: loginData.message || "Please try again.",
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

    const handleResendOTP = async () => {
        setIsResending(true);

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    purpose: "login",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "OTP Resent",
                    description: "A new OTP has been sent to your email.",
                });
                setCountdown(60); // 60 seconds cooldown
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to resend OTP",
                    description: data.message || "Please try again later.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to resend OTP. Please try again.",
            });
        } finally {
            setIsResending(false);
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
                {/* Back to login */}
                <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>

                {/* Card */}
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl">VaultBank</h1>
                            <p className="text-sm text-muted-foreground">Verify your identity</p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium mb-1">OTP sent to your email</p>
                                <p className="text-xs text-muted-foreground">
                                    We've sent a 6-digit code to <span className="font-medium">{email}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    if (value.length <= 6) {
                                        setOtp(value);
                                    }
                                }}
                                required
                                maxLength={6}
                                className="h-12 text-center text-2xl tracking-widest"
                                autoComplete="one-time-code"
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? "Verifying..." : "Verify & Sign In"}
                        </Button>
                    </form>

                    {/* Resend OTP */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                            Didn't receive the code?
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleResendOTP}
                            disabled={isResending || countdown > 0}
                        >
                            {isResending
                                ? "Sending..."
                                : countdown > 0
                                    ? `Resend in ${countdown} s`
                                    : "Resend OTP"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
