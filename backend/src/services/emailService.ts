import transporter from '../config/email';
import logger from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    /**
     * Send an email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'VaultBank <noreply@vaultbank.com>',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${options.to}`);
            return true;
        } catch (error) {
            logger.error('Failed to send email:', error);
            return false;
        }
    }

    /**
     * Send OTP email
     */
    async sendOTP(email: string, otp: string, purpose: string = 'verification'): Promise<boolean> {
        const purposeText = purpose === 'login' ? 'Sign In' : 'Verification';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 40px;
                        text-align: center;
                    }
                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        color: white;
                        margin-bottom: 20px;
                    }
                    .content {
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }
                    .otp-code {
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #667eea;
                        background: #f7f7f7;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .warning {
                        color: #666;
                        font-size: 14px;
                        margin-top: 20px;
                    }
                    .footer {
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 12px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🏦 VaultBank</div>
                    <div class="content">
                        <h2>Your ${purposeText} Code</h2>
                        <p>Use this code to complete your ${purposeText.toLowerCase()}:</p>
                        <div class="otp-code">${otp}</div>
                        <p class="warning">
                            ⚠️ This code will expire in 5 minutes.<br>
                            Never share this code with anyone.
                        </p>
                    </div>
                    <div class="footer">
                        If you didn't request this code, please ignore this email.
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
VaultBank - Your ${purposeText} Code

Your OTP code is: ${otp}

This code will expire in 5 minutes.
Never share this code with anyone.

If you didn't request this code, please ignore this email.
        `;

        return this.sendEmail({
            to: email,
            subject: `VaultBank - Your ${purposeText} Code`,
            html,
            text,
        });
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 40px;
                    }
                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        color: white;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .content {
                        background: white;
                        border-radius: 8px;
                        padding: 30px;
                        margin-top: 20px;
                    }
                    .button {
                        display: inline-block;
                        background: #667eea;
                        color: white;
                        padding: 12px 30px;
                        border-radius: 6px;
                        text-decoration: none;
                        margin-top: 20px;
                    }
                    .footer {
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 12px;
                        margin-top: 20px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🏦 VaultBank</div>
                    <div class="content">
                        <h2>Welcome to VaultBank, ${name}! 🎉</h2>
                        <p>Thank you for choosing VaultBank for your banking needs.</p>
                        <p>Your account has been successfully created. You can now:</p>
                        <ul>
                            <li>View your account balance</li>
                            <li>Make transactions</li>
                            <li>Apply for cards</li>
                            <li>Create fixed deposits</li>
                        </ul>
                        <p>Get started by logging into your account:</p>
                        <a href="http://localhost:5173/login" class="button">Login to VaultBank</a>
                    </div>
                    <div class="footer">
                        © 2026 VaultBank. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: email,
            subject: 'Welcome to VaultBank! 🎉',
            html,
        });
    }
}

export default new EmailService();
