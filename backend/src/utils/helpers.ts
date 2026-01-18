// Utility functions for the banking application

/**
 * Generate a unique account number
 * Format: 16 digits
 */
export const generateAccountNumber = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return (timestamp + random).slice(-16);
};

/**
 * Generate a unique card number
 * Format: 16 digits (Luhn algorithm compliant)
 */
export const generateCardNumber = (): string => {
    // Start with a valid BIN (Bank Identification Number)
    const bin = '4242'; // Visa test BIN
    let cardNumber = bin;

    // Generate random digits
    for (let i = 0; i < 11; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }

    // Calculate Luhn check digit
    const checkDigit = calculateLuhnCheckDigit(cardNumber);
    return cardNumber + checkDigit;
};

/**
 * Calculate Luhn check digit
 */
const calculateLuhnCheckDigit = (number: string): number => {
    let sum = 0;
    let isEven = true;

    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return (10 - (sum % 10)) % 10;
};

/**
 * Generate CVV
 */
export const generateCVV = (): string => {
    return Math.floor(Math.random() * 900 + 100).toString();
};

/**
 * Generate 6-digit OTP
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Generate transaction reference number
 */
export const generateTransactionReference = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TXN${timestamp}${random}`;
};

/**
 * Calculate card expiry date (3 years from now)
 */
export const calculateCardExpiry = (years: number = 3): Date => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + years);
    expiryDate.setDate(1); // Set to first day of month
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Move to next month
    expiryDate.setDate(0); // Set to last day of previous month
    return expiryDate;
};

/**
 * Mask sensitive data
 */
export const maskCardNumber = (cardNumber: string): string => {
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '****-****-****-$4');
};

export const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone: string): string => {
    return phone.replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3');
};

/**
 * Sleep utility for testing
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Parse pagination parameters
 */
export const parsePagination = (page?: string, limit?: string) => {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');

    return {
        page: pageNum > 0 ? pageNum : 1,
        limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10,
        offset: (pageNum - 1) * limitNum,
    };
};

/**
 * Calculate compound interest
 */
export const calculateCompoundInterest = (
    principal: number,
    rate: number,
    tenureMonths: number,
    compoundingFrequency: number = 4 // Quarterly
): number => {
    const t = tenureMonths / 12;
    const amount = principal * Math.pow(1 + rate / (100 * compoundingFrequency), compoundingFrequency * t);
    return Math.round(amount * 100) / 100;
};
