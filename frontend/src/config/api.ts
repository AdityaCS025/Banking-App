/**
 * API Configuration
 * Centralized API URL management for all backend requests
 */

// Get API URL from environment variable or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
        VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
        REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        PROFILE: `${API_BASE_URL}/api/auth/profile`,
        CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
        USERS: `${API_BASE_URL}/api/auth/users`,
        UPDATE_KYC: (userId: string) => `${API_BASE_URL}/api/auth/users/${userId}/kyc`,
    },
    // Accounts
    ACCOUNTS: {
        BASE: `${API_BASE_URL}/api/accounts`,
        ALL: `${API_BASE_URL}/api/accounts/all`,
        VERIFY: (accountNumber: string) => `${API_BASE_URL}/api/accounts/verify/${accountNumber}`,
    },
    // Transactions
    TRANSACTIONS: {
        BASE: `${API_BASE_URL}/api/transactions`,
        TRANSFER: `${API_BASE_URL}/api/transactions/transfer`,
        DEPOSIT: `${API_BASE_URL}/api/transactions/deposit`,
        WITHDRAW: `${API_BASE_URL}/api/transactions/withdraw`,
    },
    // Cards
    CARDS: {
        BASE: `${API_BASE_URL}/api/cards`,
        BY_ID: (cardId: string) => `${API_BASE_URL}/api/cards/${cardId}`,
        FREEZE: (cardId: string) => `${API_BASE_URL}/api/cards/${cardId}/freeze`,
        UNFREEZE: (cardId: string) => `${API_BASE_URL}/api/cards/${cardId}/unfreeze`,
        LIMITS: (cardId: string) => `${API_BASE_URL}/api/cards/${cardId}/limits`,
    },
    // Deposits
    DEPOSITS: {
        BASE: `${API_BASE_URL}/api/deposits`,
        BREAK: (depositId: string) => `${API_BASE_URL}/api/deposits/${depositId}/break`,
    },
    // CIBIL
    CIBIL: `${API_BASE_URL}/api/cibil`,
    // Chatbot
    CHATBOT: {
        CHAT: `${API_BASE_URL}/api/chatbot/chat`,
    },
};

export default API_BASE_URL;
