import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    CreditCard,
    Plus,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Trash2,
    Settings,
    Loader2,
    PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreateCardModal } from "@/components/modals/CreateCardModal";
import { SetLimitsModal } from "@/components/modals/SetLimitsModal";
import { API_ENDPOINTS } from "@/config/api";

export default function Cards() {
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [limitsModalOpen, setLimitsModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.CARDS.BASE, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                setCards(data.data.cards || []);
                if (data.data.cards && data.data.cards.length > 0) {
                    setSelectedCard(data.data.cards[0]);
                }
            }
        } catch (error) {
            console.error('Fetch cards error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load cards",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCardStatus = async (cardId: string, currentStatus: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const endpoint = currentStatus === 'active' ? 'freeze' : 'unfreeze';

            const response = await fetch(API_ENDPOINTS.CARDS[endpoint.toUpperCase() as 'FREEZE' | 'UNFREEZE'](cardId), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                toast({
                    title: "Success!",
                    description: `Card ${currentStatus === 'active' ? 'frozen' : 'unfrozen'} successfully`,
                });
                fetchCards();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to update card status",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update card status",
            });
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!confirm('Are you sure you want to delete this card?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.CARDS.BY_ID(cardId), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                toast({
                    title: "Card Deleted",
                    description: "Card deleted successfully",
                });
                fetchCards();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to delete card",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete card",
            });
        }
    };

    const formatCardNumber = (cardNumber: string) => {
        return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${month}/${year}`;
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Virtual Cards
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your virtual cards and set spending limits
                        </p>
                    </div>

                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Card
                    </Button>
                </div>

                {cards.length === 0 ? (
                    <div className="p-12 rounded-xl bg-card border border-border text-center">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Cards Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Create your first virtual card to start making secure online payments
                        </p>
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Card
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Card List */}
                        <div className="lg:col-span-1 space-y-3">
                            <h3 className="font-semibold mb-3">My Cards ({cards.length})</h3>
                            {cards.map((card) => (
                                <motion.button
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    className={`w-full p-4 rounded-xl text-left transition-all ${selectedCard?.id === card.id
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-card border border-border hover:border-accent/50"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <CreditCard className="w-5 h-5" />
                                        <p className="font-medium capitalize">{card.card_type} Card</p>
                                    </div>
                                    <p className="text-sm opacity-80">
                                        ****{card.card_number.slice(-4)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs ${card.status === "active"
                                                ? "bg-success/20 text-success"
                                                : "bg-warning/20 text-warning"
                                                }`}
                                        >
                                            {card.status}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Card Details */}
                        {selectedCard && (
                            <div className="lg:col-span-2 space-y-6">
                                {/* Virtual Card Display with 3D Flip */}
                                <div
                                    className="relative cursor-pointer"
                                    style={{ perspective: "1000px", aspectRatio: "1.586/1" }}
                                    onClick={() => setShowCardDetails(!showCardDetails)}
                                >
                                    <motion.div
                                        className="relative w-full h-full"
                                        style={{ transformStyle: "preserve-3d" }}
                                        animate={{ rotateY: showCardDetails ? 180 : 0 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: [0.4, 0.0, 0.2, 1] // Smooth easing
                                        }}
                                    >
                                        {/* FRONT SIDE */}
                                        <div
                                            className="absolute inset-0 p-8 rounded-3xl gradient-primary text-white overflow-hidden shadow-xl"
                                            style={{ backfaceVisibility: "hidden" }}
                                        >
                                            {/* Card Background Pattern */}
                                            <div className="absolute inset-0 opacity-10">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                                            </div>

                                            <div className="relative z-10 h-full flex flex-col justify-between">
                                                {/* Card Header */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-white/70 text-sm mb-1">VaultBank</p>
                                                        <p className="font-semibold capitalize">{selectedCard.card_type} Card</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCardDetails(!showCardDetails);
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Card Number */}
                                                <div>
                                                    <p className="font-mono text-2xl tracking-wider">
                                                        **** **** **** {selectedCard.card_number.slice(-4)}
                                                    </p>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-white/70 text-xs mb-1">Cardholder</p>
                                                        <p className="font-semibold uppercase text-sm">
                                                            {selectedCard.card_holder_name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-white/70 text-xs mb-1">Valid Thru</p>
                                                        <p className="font-mono">
                                                            {formatDate(selectedCard.expiry_date)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <CreditCard className="w-12 h-12 opacity-50" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK SIDE */}
                                        <div
                                            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white overflow-hidden shadow-xl"
                                            style={{
                                                backfaceVisibility: "hidden",
                                                transform: "rotateY(180deg)"
                                            }}
                                        >
                                            {/* Magnetic Strip */}
                                            <div className="w-full h-12 bg-black mt-6"></div>

                                            {/* Card Details */}
                                            <div className="p-8 space-y-4">
                                                {/* CVV Section */}
                                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-white/70 text-xs mb-1">CVV</p>
                                                            <p className="font-mono text-xl font-bold tracking-wider">
                                                                {selectedCard.cvv}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowCardDetails(false);
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            <EyeOff className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Number (Full) */}
                                                <div>
                                                    <p className="text-white/70 text-xs mb-1">Card Number</p>
                                                    <p className="font-mono text-lg tracking-wider">
                                                        {formatCardNumber(selectedCard.card_number)}
                                                    </p>
                                                </div>

                                                {/* Card Info */}
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/70">Network:</span>
                                                        <span className="font-semibold">RuPay</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white/70">Card Type:</span>
                                                        <span className="font-semibold capitalize">{selectedCard.card_type}</span>
                                                    </div>
                                                </div>

                                                {/* Disclaimer */}
                                                <div className="pt-4 border-t border-white/10">
                                                    <p className="text-white/60 text-xs mb-2 font-semibold">
                                                        Virtual Card – For Online Use Only
                                                    </p>
                                                    <p className="text-white/40 text-[10px] leading-relaxed">
                                                        This is a virtual card issued by VaultBank. For assistance, contact customer care at 1800-XXX-XXXX. Keep your CVV confidential.
                                                    </p>
                                                </div>

                                                {/* VaultBank Logo */}
                                                <div className="flex justify-end">
                                                    <CreditCard className="w-10 h-10 opacity-30" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Card Stats */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-card border border-border">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Current Spent
                                        </p>
                                        <p className="font-display text-2xl font-bold">
                                            ₹{parseFloat(selectedCard.current_spent || 0).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-card border border-border">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Spending Limit
                                        </p>
                                        <p className="font-display text-2xl font-bold">
                                            ₹{parseFloat(selectedCard.spending_limit).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <Button
                                        variant={selectedCard.status === "active" ? "destructive" : "default"}
                                        onClick={() => handleToggleCardStatus(selectedCard.id, selectedCard.status)}
                                        className="h-auto py-4 flex-col gap-2"
                                    >
                                        {selectedCard.status === "active" ? (
                                            <>
                                                <Lock className="w-5 h-5" />
                                                <span className="text-xs">Freeze Card</span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-5 h-5" />
                                                <span className="text-xs">Unfreeze Card</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-auto py-4 flex-col gap-2"
                                        onClick={() => setLimitsModalOpen(true)}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="text-xs">Set Limits</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleDeleteCard(selectedCard.id)}
                                        className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="text-xs">Delete Card</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateCardModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={fetchCards}
            />

            {selectedCard && (
                <SetLimitsModal
                    open={limitsModalOpen}
                    onOpenChange={setLimitsModalOpen}
                    card={selectedCard}
                    onSuccess={fetchCards}
                />
            )}
        </CustomerLayout>
    );
}
