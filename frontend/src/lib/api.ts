// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// User API
export const userAPI = {
    getProfile: async () => {
        return apiRequest('/auth/profile');
    },
};

// Accounts API
export const accountsAPI = {
    getAll: async () => {
        return apiRequest('/accounts');
    },

    create: async (accountType: 'savings' | 'current') => {
        return apiRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify({ account_type: accountType }),
        });
    },
};

// Transactions API
export const transactionsAPI = {
    getRecent: async (limit: number = 10) => {
        return apiRequest(`/transactions?limit=${limit}`);
    },

    transfer: async (fromAccountId: string, toAccountId: string, amount: number, description?: string) => {
        return apiRequest('/transactions/transfer', {
            method: 'POST',
            body: JSON.stringify({
                from_account_id: fromAccountId,
                to_account_id: toAccountId,
                amount,
                description,
            }),
        });
    },

    deposit: async (accountId: string, amount: number, description?: string) => {
        return apiRequest('/transactions/deposit', {
            method: 'POST',
            body: JSON.stringify({
                account_id: accountId,
                amount,
                description,
            }),
        });
    },

    withdraw: async (accountId: string, amount: number, description?: string) => {
        return apiRequest('/transactions/withdraw', {
            method: 'POST',
            body: JSON.stringify({
                account_id: accountId,
                amount,
                description,
            }),
        });
    },
};

// CIBIL API (placeholder for now)
export const cibilAPI = {
    getScore: async () => {
        // TODO: Implement when CIBIL routes are ready
        return { data: { score: null, status: 'pending' } };
    },
};
