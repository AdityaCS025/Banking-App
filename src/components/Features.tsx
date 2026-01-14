import { motion } from "framer-motion";
import { 
  CreditCard, 
  ArrowRightLeft, 
  BarChart3, 
  Shield, 
  PiggyBank, 
  MessageSquare,
  Bell,
  Lock
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Virtual Cards",
    description: "Apply for and manage virtual cards with instant issuance and complete control over spending limits.",
    gradient: "from-accent to-info",
  },
  {
    icon: ArrowRightLeft,
    title: "Real-Time Transactions",
    description: "Track every transaction in real-time with detailed insights and automatic categorization.",
    gradient: "from-info to-accent",
  },
  {
    icon: BarChart3,
    title: "CIBIL Integration",
    description: "Check your credit score anytime with our seamless CIBIL integration for creditworthiness assessment.",
    gradient: "from-warning to-destructive",
  },
  {
    icon: PiggyBank,
    title: "Deposit Management",
    description: "Create and manage deposits with competitive interest rates and flexible terms.",
    gradient: "from-success to-accent",
  },
  {
    icon: Lock,
    title: "OTP Authentication",
    description: "Secure every transaction with OTP verification and multi-factor authentication.",
    gradient: "from-accent to-success",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot Support",
    description: "Get instant help 24/7 with our intelligent AI-powered chatbot for all your banking queries.",
    gradient: "from-info to-warning",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description: "Stay informed with instant email alerts for all account activities and security updates.",
    gradient: "from-destructive to-warning",
  },
  {
    icon: Shield,
    title: "JWT Security",
    description: "Enterprise-grade security with JWT authentication and encrypted data transmission.",
    gradient: "from-accent to-info",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need for{" "}
            <span className="gradient-text">Modern Banking</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform brings together all essential banking services 
            with cutting-edge technology for a seamless financial experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 card-shine">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
