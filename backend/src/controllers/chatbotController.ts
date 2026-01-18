import { Request, Response } from 'express';
import axios from 'axios';

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

        // Call OpenRouter API
        const response = await axios.post(
            process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
            {
                model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful banking assistant for VaultBank. You help customers with their banking queries, account information, transactions, and general banking advice. Be professional, friendly, and concise. If you don\'t know something, admit it and suggest contacting customer support.',
                    },
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const aiResponse = response.data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

        res.status(200).json({
            success: true,
            response: aiResponse,
        });
    } catch (error: any) {
        console.error('Chatbot error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get response from AI assistant',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

export default { chat };
