import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Zap, Globe } from "lucide-react";

const cardFeatures = [
  "Instant virtual card issuance",
  "Customizable spending limits",
  "Real-time transaction alerts",
  "Global acceptance",
  "Freeze/unfreeze anytime",
  "No hidden fees",
];

const cardTypes = [
  {
    name: "Basic",
    subtitle: "For everyday use",
    limit: "₹4,00,000",
    color: "from-slate-700 to-slate-900",
  },
  {
    name: "Premium",
    subtitle: "For professionals",
    limit: "₹20,00,000",
    color: "from-accent to-info",
    featured: true,
  },
  {
    name: "Elite",
    subtitle: "For high-net-worth",
    limit: "Unlimited",
    color: "from-amber-500 to-amber-700",
  },
];

export function VirtualCards() {
  return (
    <section id="cards" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary opacity-[0.02]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              Virtual Cards
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Your Card,{" "}
              <span className="gradient-text">Your Rules</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Apply for virtual cards instantly and take complete control over your 
              spending. Perfect for online shopping, subscriptions, and secure transactions.
            </p>

            {/* Features list */}
            <ul className="space-y-4">
              {cardFeatures.map((feature, index) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="hero" size="lg">
              Apply for a Card
            </Button>
          </motion.div>

          {/* Cards showcase */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              {cardTypes.map((card, index) => (
                <motion.div
                  key={card.name}
                  className={`relative p-6 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-2xl ${
                    card.featured ? "scale-105 z-10" : "opacity-80"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ scale: card.featured ? 1.08 : 1.02 }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-white/70 text-sm">{card.subtitle}</p>
                      <h3 className="font-display text-2xl font-bold">{card.name}</h3>
                    </div>
                    <CreditCard className="w-10 h-10 opacity-50" />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white/70 text-xs mb-1">CARD LIMIT</p>
                      <p className="font-bold text-xl">{card.limit}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Card number pattern */}
                  <div className="mt-6 font-mono text-lg tracking-wider opacity-70">
                    •••• •••• •••• 4242
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
