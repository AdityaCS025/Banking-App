import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Wallet, 
  TrendingUp,
  MoreHorizontal
} from "lucide-react";

const transactions = [
  { name: "Netflix Subscription", amount: -15.99, type: "subscription", time: "2 hours ago" },
  { name: "Salary Deposit", amount: 4500.00, type: "income", time: "Yesterday" },
  { name: "Amazon Purchase", amount: -89.50, type: "shopping", time: "2 days ago" },
  { name: "Freelance Payment", amount: 850.00, type: "income", time: "3 days ago" },
];

export function Dashboard() {
  return (
    <section id="security" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Dashboard Preview
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Manage Everything from{" "}
            <span className="gradient-text">One Place</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A powerful dashboard for customers and bankers to manage accounts, 
            verify transactions, and track financial activities in real-time.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
            {/* Dashboard header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Welcome back,</p>
                <h3 className="font-display text-xl font-bold">John Doe</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="font-bold text-accent">JD</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 grid md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <motion.div
                className="md:col-span-2 p-6 rounded-2xl gradient-primary text-white"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Total Balance</p>
                    <h2 className="font-display text-4xl font-bold">$24,850.00</h2>
                  </div>
                  <Wallet className="w-10 h-10 opacity-50" />
                </div>
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Income</p>
                      <p className="font-semibold">+$5,350</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Expenses</p>
                      <p className="font-semibold">-$1,280</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CIBIL Score */}
              <motion.div
                className="p-6 rounded-2xl bg-secondary"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-muted-foreground text-sm">CIBIL Score</p>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-border"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="50"
                      className="text-accent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold">780</span>
                  </div>
                </div>
                <p className="text-center text-sm text-success mt-2 font-medium">Excellent</p>
              </motion.div>
            </div>

            {/* Recent transactions */}
            <div className="p-6 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-display font-bold">Recent Transactions</h4>
                <button className="text-accent text-sm font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.name}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? "bg-success/20" : "bg-destructive/20"
                      }`}>
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className={`w-5 h-5 text-success`} />
                        ) : (
                          <ArrowUpRight className={`w-5 h-5 text-destructive`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <p className="text-sm text-muted-foreground">{tx.time}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      tx.amount > 0 ? "text-success" : "text-foreground"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
