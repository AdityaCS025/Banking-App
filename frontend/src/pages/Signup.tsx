import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ArrowLeft, Eye, EyeOff, Shield, FileText, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

const accountTypes = [
    {
        id: "savings",
        name: "Savings Account",
        description: "For individuals to save money with interest",
        minBalance: "₹10,000",
        interest: "3.5% p.a.",
        features: ["Free 5 transactions/month", "ATM card", "Internet banking"],
    },
    {
        id: "current",
        name: "Current Account",
        description: "For businesses with unlimited transactions",
        minBalance: "₹25,000",
        interest: "No interest",
        features: ["Unlimited transactions", "Overdraft facility", "Checkbook"],
    },
    {
        id: "fixed_deposit",
        name: "Fixed Deposit",
        description: "Lock money for fixed tenure with higher interest",
        minBalance: "₹10,000",
        interest: "5.5% - 7.5% p.a.",
        features: ["Fixed tenure", "Guaranteed returns", "Loan against FD"],
    },
];

export default function Signup() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Details
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        panCard: "",
        aadhaarCard: "",

        // Account Selection
        accountType: "savings",

        // Address
        address: "",
        city: "",
        state: "",
        pincode: "",

        // Security
        password: "",
        confirmPassword: "",

        // Agreements
        termsAccepted: false,
        kycConsent: false,
        dicgcAcknowledged: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData({
            ...formData,
            [name]: checked,
        });
    };

    const validateStep1 = () => {
        if (!formData.fullName || !formData.email || !formData.phone || !formData.dateOfBirth) {
            toast({
                variant: "destructive",
                title: "Incomplete Information",
                description: "Please fill all personal details.",
            });
            return false;
        }

        // Validate PAN format (ABCDE1234F) - optional field
        if (formData.panCard) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(formData.panCard)) {
                toast({
                    variant: "destructive",
                    title: "Invalid PAN",
                    description: "Please enter a valid PAN card number (e.g., ABCDE1234F).",
                });
                return false;
            }
        }

        // Validate Aadhaar format (12 digits) - optional field
        if (formData.aadhaarCard) {
            const aadhaarRegex = /^[0-9]{12}$/;
            if (!aadhaarRegex.test(formData.aadhaarCard)) {
                toast({
                    variant: "destructive",
                    title: "Invalid Aadhaar",
                    description: "Please enter a valid 12-digit Aadhaar number.",
                });
                return false;
            }
        }

        return true;
    };

    const validateStep2 = () => {
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
            toast({
                variant: "destructive",
                title: "Incomplete Address",
                description: "Please fill all address fields.",
            });
            return false;
        }

        // Validate pincode (6 digits)
        const pincodeRegex = /^[0-9]{6}$/;
        if (!pincodeRegex.test(formData.pincode)) {
            toast({
                variant: "destructive",
                title: "Invalid Pincode",
                description: "Please enter a valid 6-digit pincode.",
            });
            return false;
        }

        return true;
    };

    const validateStep3 = () => {
        if (formData.password !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords don't match",
                description: "Please make sure your passwords match.",
            });
            return false;
        }

        if (formData.password.length < 8) {
            toast({
                variant: "destructive",
                title: "Weak password",
                description: "Password must be at least 8 characters long.",
            });
            return false;
        }

        if (!formData.termsAccepted || !formData.kycConsent || !formData.dicgcAcknowledged) {
            toast({
                variant: "destructive",
                title: "Agreements Required",
                description: "Please accept all terms and conditions.",
            });
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep3()) return;

        setIsLoading(true);

        try {
            const requestBody: Record<string, string> = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                date_of_birth: formData.dateOfBirth,
                address: JSON.stringify({
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                }),
            };

            // Only include PAN and Aadhaar if provided
            if (formData.panCard) {
                requestBody.pan_number = formData.panCard;
            }
            if (formData.aadhaarCard) {
                requestBody.aadhaar_number = formData.aadhaarCard;
            }

            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Account created successfully!",
                    description: "Please verify your email and complete KYC.",
                });
                navigate("/login");
            } else {
                toast({
                    variant: "destructive",
                    title: "Registration failed",
                    description: data.message || "Please try again.",
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

    const selectedAccount = accountTypes.find(acc => acc.id === formData.accountType);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 gradient-primary opacity-5" />

            <motion.div
                className="w-full max-w-4xl relative z-10"
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
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl">VaultBank</h1>
                            <p className="text-sm text-muted-foreground">Open your account in 3 easy steps</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`flex items - center justify - center w - 10 h - 10 rounded - full border - 2 transition - colors ${step >= s ? "bg-accent border-accent text-accent-foreground" : "border-border text-muted-foreground"
                                    } `}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex - 1 h - 1 mx - 2 transition - colors ${step > s ? "bg-accent" : "bg-border"
                                        } `} />
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Details & Account Type */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="font-display text-xl font-bold mb-4">Personal Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name (as per PAN)</Label>
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Mobile Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="panCard">PAN Card Number <span className="text-muted-foreground text-sm">(Optional)</span></Label>
                                            <Input
                                                id="panCard"
                                                name="panCard"
                                                type="text"
                                                placeholder="ABCDE1234F"
                                                value={formData.panCard}
                                                onChange={handleChange}
                                                maxLength={10}
                                                className="uppercase"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="aadhaarCard">Aadhaar Number <span className="text-muted-foreground text-sm">(Optional)</span></Label>
                                            <Input
                                                id="aadhaarCard"
                                                name="aadhaarCard"
                                                type="text"
                                                placeholder="1234 5678 9012"
                                                value={formData.aadhaarCard}
                                                onChange={handleChange}
                                                maxLength={12}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-display text-xl font-bold mb-4">Select Account Type</h3>
                                    <RadioGroup
                                        value={formData.accountType}
                                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                                    >
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {accountTypes.map((account) => (
                                                <div key={account.id} className="relative">
                                                    <RadioGroupItem
                                                        value={account.id}
                                                        id={account.id}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={account.id}
                                                        className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 hover:border-accent/50"
                                                    >
                                                        <span className="font-semibold mb-1">{account.name}</span>
                                                        <span className="text-sm text-muted-foreground mb-3">{account.description}</span>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Min. Balance:</span>
                                                                <span className="font-medium">{account.minBalance}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Interest:</span>
                                                                <span className="font-medium">{account.interest}</span>
                                                            </div>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button type="button" onClick={handleNext} variant="hero" size="lg" className="w-full">
                                    Continue to Address
                                </Button>
                            </motion.div>
                        )}

                        {/* Step 2: Address Details */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="font-display text-xl font-bold">Address Details</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="address">Street Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            type="text"
                                            placeholder="House No., Building Name, Street"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            type="text"
                                            placeholder="Mumbai"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            type="text"
                                            placeholder="Maharashtra"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            type="text"
                                            placeholder="400001"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">
                                        Back
                                    </Button>
                                    <Button type="button" onClick={handleNext} variant="hero" size="lg" className="flex-1">
                                        Continue to Security
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Security & Agreements */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="font-display text-xl font-bold">Security & Agreements</h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Create Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 8 characters
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Account Summary */}
                                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-accent" />
                                        Account Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Account Type:</span>
                                            <span className="font-medium">{selectedAccount?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Minimum Balance:</span>
                                            <span className="font-medium">{selectedAccount?.minBalance}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Interest Rate:</span>
                                            <span className="font-medium">{selectedAccount?.interest}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimers & Agreements */}
                                <div className="space-y-4 p-4 rounded-xl bg-info/5 border border-info/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    id="termsAccepted"
                                                    checked={formData.termsAccepted}
                                                    onCheckedChange={(checked) => handleCheckboxChange("termsAccepted", checked as boolean)}
                                                />
                                                <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                                                    I accept the{" "}
                                                    <a href="#" className="text-accent hover:underline">Terms & Conditions</a>
                                                    {" "}and{" "}
                                                    <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                                                </Label>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    id="kycConsent"
                                                    checked={formData.kycConsent}
                                                    onCheckedChange={(checked) => handleCheckboxChange("kycConsent", checked as boolean)}
                                                />
                                                <Label htmlFor="kycConsent" className="text-sm cursor-pointer">
                                                    I consent to KYC verification as per RBI guidelines and authorize VaultBank to verify my PAN and Aadhaar details
                                                </Label>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    id="dicgcAcknowledged"
                                                    checked={formData.dicgcAcknowledged}
                                                    onCheckedChange={(checked) => handleCheckboxChange("dicgcAcknowledged", checked as boolean)}
                                                />
                                                <Label htmlFor="dicgcAcknowledged" className="text-sm cursor-pointer">
                                                    I acknowledge that deposits are insured by DICGC up to ₹5,00,000 as per RBI regulations
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" onClick={() => setStep(2)} variant="outline" size="lg" className="flex-1">
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="flex-1"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </form>

                    {/* Sign in link */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-accent hover:underline font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
