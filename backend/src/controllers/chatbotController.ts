import { Request, Response } from 'express';
import axios from 'axios';

/**
 * Built-in banking assistant - provides helpful responses without external API
 */
function getLocalResponse(message: string): string {
    const msg = message.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|howdy)/.test(msg)) {
        return "Hello! Welcome to VaultBank. I'm your virtual banking assistant. I can help you with:\n\n• Account information & balance inquiries\n• Fund transfers & payments\n• Card management (virtual cards)\n• Fixed deposits\n• CIBIL score information\n• General banking queries\n\nHow can I assist you today?";
    }

    // Offers / promotions
    if (/offer|promotion|deal|discount|cashback|reward/.test(msg)) {
        return "🎉 Here are VaultBank's current offers:\n\n1. **Zero Balance Savings Account** - No minimum balance required\n2. **7.5% FD Rate** - On fixed deposits of 1 year or more\n3. **Free Virtual Cards** - Create unlimited virtual debit/credit cards\n4. **Instant Transfers** - Free NEFT/IMPS/UPI transfers\n5. **Cashback Rewards** - Up to 5% cashback on card transactions\n\nWould you like to know more about any of these offers?";
    }

    // Account related
    if (/account|balance|savings|current|open.*account/.test(msg)) {
        return "📊 **Account Services at VaultBank:**\n\n• **Check Balance** - View your account balance on the Dashboard\n• **Account Types** - We offer Savings and Current accounts\n• **Mini Statement** - View recent transactions in the Transactions section\n• **Account Details** - Find your account number, IFSC code in Account settings\n\nYou can view all your account details from the Dashboard. Is there anything specific about your account you'd like help with?";
    }

    // Transfer related
    if (/transfer|send money|pay|payment|neft|imps|upi|rtgs/.test(msg)) {
        return "💸 **Fund Transfer Guide:**\n\n1. Go to **Dashboard** → Click **Transfer**\n2. Enter the recipient's account number\n3. Enter the amount and add a description\n4. Confirm the transfer\n\n**Transfer Limits:**\n• Daily limit: ₹5,00,000\n• Per transaction: ₹1,00,000 (auto-approved)\n• Above ₹1,00,000 requires admin approval\n\nTransfers are processed instantly. Need help with a specific transfer?";
    }

    // Card related
    if (/card|virtual card|debit|credit|freeze|block/.test(msg)) {
        return "💳 **Virtual Card Services:**\n\n• **Create Card** - Go to Cards section → Create New Card\n• **Card Types** - Debit and Credit cards available\n• **Freeze/Unfreeze** - Temporarily freeze your card for security\n• **Set Limits** - Customize spending and daily limits\n• **Delete Card** - Remove cards you no longer need\n\nAll virtual cards are created instantly with a 3-year validity. How can I help with your cards?";
    }

    // Deposit / FD related
    if (/deposit|fixed deposit|fd|interest|maturity|invest/.test(msg)) {
        return "🏦 **Fixed Deposit Services:**\n\n• **Interest Rate** - Up to 7.5% per annum\n• **Tenure** - 3 months to 60 months\n• **Min Amount** - ₹10,000\n• **Max Amount** - ₹1,00,00,000\n• **Compounding** - Quarterly compounding\n\nTo create a new FD, go to the **Deposits** section from the sidebar. Would you like to calculate returns on a specific amount?";
    }

    // CIBIL / Credit score
    if (/cibil|credit.*score|loan|eligib/.test(msg)) {
        return "📈 **CIBIL Score Information:**\n\nYour CIBIL score is displayed on your Dashboard. Here's what the ranges mean:\n\n• **750-900** - Excellent (Best loan rates)\n• **700-749** - Good (Favorable terms)\n• **650-699** - Fair (Standard terms)\n• **Below 650** - Needs improvement\n\n**Tips to improve your score:**\n1. Pay bills on time\n2. Keep credit utilization below 30%\n3. Maintain a healthy credit mix\n4. Don't apply for too many loans\n\nYour score is updated regularly. Check the Dashboard for your latest score!";
    }

    // Withdrawal
    if (/withdraw|withdrawal|cash|atm/.test(msg)) {
        return "🏧 **Withdrawal Services:**\n\n1. Go to **Dashboard** → Click **Deposit/Withdraw**\n2. Select your account\n3. Choose **Withdraw** and enter the amount\n4. Confirm the transaction\n\n**Important:** Withdrawals are subject to available balance. Minimum withdrawal: ₹100.";
    }

    // Security
    if (/security|password|hack|fraud|otp|protect/.test(msg)) {
        return "🔒 **Security Features at VaultBank:**\n\n• **OTP Verification** - All logins require email OTP\n• **Card Freeze** - Instantly freeze cards if suspicious activity\n• **Transaction Limits** - Daily limits protect against large unauthorized transactions\n• **Session Management** - Auto-logout on inactivity\n\n**Security Tips:**\n1. Never share your OTP with anyone\n2. Use a strong password\n3. Freeze your card immediately if lost\n4. Report suspicious transactions to support\n\nFor security concerns, contact support@vaultbank.com";
    }

    // Profile
    if (/profile|kyc|update.*detail|personal|name|email|phone/.test(msg)) {
        return "👤 **Profile & KYC:**\n\n• View and update your profile from the **Profile** section\n• KYC verification is required for full account access\n• Required documents: PAN Card, Aadhaar\n• KYC approval is processed by our admin team\n\nGo to **Profile** from the sidebar to view or update your details.";
    }

    // Help / support
    if (/help|support|contact|complaint|issue|problem/.test(msg)) {
        return "📞 **Customer Support:**\n\n• **Email:** support@vaultbank.com\n• **Chat:** You're already connected to our assistant!\n• **Working Hours:** 24/7 digital support\n\n**Common Solutions:**\n1. Login issues → Reset password via email\n2. Transaction failed → Check balance and try again\n3. Card issues → Freeze/unfreeze from Cards section\n4. KYC pending → Upload documents in Profile\n\nHow else can I help you?";
    }

    // Thank you
    if (/thank|thanks|thx|appreciate/.test(msg)) {
        return "You're welcome! 😊 I'm always here to help. If you have any more questions about VaultBank services, feel free to ask anytime. Have a great day!";
    }

    // Goodbye
    if (/bye|goodbye|see you|take care/.test(msg)) {
        return "Goodbye! 👋 Thank you for banking with VaultBank. Have a wonderful day! Remember, I'm available 24/7 whenever you need assistance.";
    }

    // Default response
    return "Thank you for your question! Here are some things I can help you with:\n\n• 💰 **Account & Balance** - Check balances, account details\n• 💸 **Transfers** - Send money, payment queries\n• 💳 **Cards** - Virtual card management\n• 🏦 **Deposits** - Fixed deposit information\n• 📈 **CIBIL Score** - Credit score details\n• 🎉 **Offers** - Current promotions\n• 🔒 **Security** - Account safety tips\n• 📞 **Support** - Contact information\n\nPlease try asking about any of these topics, or contact support@vaultbank.com for specialized assistance!";
}

/**
 * @desc    Chat with AI assistant
 * @route   POST /api/chatbot/chat
 * @access  Public
 */
export const chat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Message is required',
            });
            return;
        }

        // Try OpenRouter API first
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (apiKey && apiKey !== 'your_openrouter_api_key_here') {
            try {
                const response = await axios.post(
                    process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful banking assistant for VaultBank, an Indian digital bank. You help customers with their banking queries, account information, transactions, cards, deposits, and general banking advice. Be professional, friendly, and concise. Use relevant emojis. If you don\'t know something, admit it and suggest contacting customer support at support@vaultbank.com.',
                            },
                            {
                                role: 'user',
                                content: message,
                            },
                        ],
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://vault-bank-silk.vercel.app',
                            'X-Title': 'VaultBank Assistant',
                        },
                        timeout: 15000, // 15 second timeout
                    }
                );

                const aiResponse = response.data.choices[0]?.message?.content;
                if (aiResponse) {
                    res.status(200).json({
                        success: true,
                        response: aiResponse,
                    });
                    return;
                }
            } catch (apiError: any) {
                console.warn('OpenRouter API failed, using local fallback:', apiError.message);
                // Fall through to local response
            }
        }

        // Fallback to local banking assistant
        const localResponse = getLocalResponse(message);
        res.status(200).json({
            success: true,
            response: localResponse,
        });
    } catch (error: any) {
        console.error('Chatbot error:', error.message);
        // Even in catastrophic failure, return a helpful response
        res.status(200).json({
            success: true,
            response: "I'm here to help! You can ask me about accounts, transfers, cards, deposits, CIBIL scores, or any banking query. If you need immediate assistance, please email support@vaultbank.com.",
        });
    }
};

export default { chat };

