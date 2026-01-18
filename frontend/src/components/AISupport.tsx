import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";

const sampleConversation = [
  { role: "bot", message: "Hello! I'm your AI banking assistant. How can I help you today?" },
  { role: "user", message: "How can I check my credit score?" },
  { role: "bot", message: "Great question! You can check your CIBIL score by going to Dashboard → Credit Score. Your score is updated monthly and reflects your creditworthiness." },
];

export function AISupport() {
  const [inputValue, setInputValue] = useState("");

  return (
    <section id="support" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Chat mockup */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
              {/* Chat header */}
              <div className="p-4 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">VaultBot</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      Always online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-4 space-y-4 min-h-[300px]">
                {sampleConversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.2 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "bot" ? "bg-accent" : "bg-primary"
                    }`}>
                      {msg.role === "bot" ? (
                        <Bot className="w-4 h-4 text-accent-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      msg.role === "bot" 
                        ? "bg-secondary text-foreground" 
                        : "bg-accent text-accent-foreground"
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chat input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary border-0 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  <Button variant="accent" size="icon" className="w-12 h-12 rounded-xl">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="order-1 lg:order-2 space-y-8"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Support
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Get Instant Help with{" "}
              <span className="gradient-text">VaultBot AI</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our intelligent AI chatbot is available 24/7 to help you with account inquiries, 
              transaction questions, and banking guidance. Powered by advanced language models 
              for natural, helpful conversations.
            </p>

            <ul className="space-y-4">
              {[
                "Instant responses to common banking questions",
                "Account balance and transaction inquiries",
                "Card management and security support",
                "Seamless handoff to human agents when needed",
              ].map((feature, index) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-accent" />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="hero" size="lg">
              Try VaultBot Now
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
