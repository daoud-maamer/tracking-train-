const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store pending registrations in memory (for development/PFE purposes)
const pendingRegistrations = new Map();

// Configure NodeMailer transporter
// Assuming environment variables or simple defaults for demonstration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with valid email
        pass: process.env.EMAIL_PASS || 'your-email-password'     // Replace with app password
    }
});

// Helper to generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Store in memory instead of database
        pendingRegistrations.set(email, {
            passwordHash,
            verificationCode,
            expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins expiry
        });

        // Send email with the verification code
        const mailOptions = {
            from: `"TrainTracker" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`, // Added Sender Name
            to: email,
            subject: 'Train Tracker - Verify your email',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 600px; margin: auto; text-align: center;">
                        <h2 style="color: #4CAF50; margin-bottom: 20px;">Welcome to TrainTracker! 🚆</h2>
                        <p style="font-size: 16px; color: #333333; margin-bottom: 10px;">Please use the verification code below to complete your registration:</p>
                        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; display: inline-block; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; color: #388e3c; letter-spacing: 2px;">${verificationCode}</span>
                        </div>
                        <p style="font-size: 14px; color: #777777; margin-top: 20px;">This code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        // For local development, log the code so the developer can see it
        console.log(`\n=======================================\n`);
        console.log(`🔐 VERIFICATION CODE FOR ${email}: ${verificationCode}`);
        console.log(`\n=======================================\n`);

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending email. User registered but email not sent.', emailError.message);
            // Optionally, we could still return success but notify that email failed.
        }

        res.status(201).json({ message: 'User registered. Please check your email for the verification code.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const pendingUser = pendingRegistrations.get(email);

        if (!pendingUser) {
            // fallback: check if already fully registered
            const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length > 0 && users[0].is_verified) {
                return res.status(400).json({ error: 'User is already verified' });
            }
            return res.status(404).json({ error: 'No pending registration found. Please register again.' });
        }

        if (pendingUser.verificationCode !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (Date.now() > pendingUser.expiresAt) {
            pendingRegistrations.delete(email);
            return res.status(400).json({ error: 'Verification code expired. Please register again.' });
        }

        // Insert into database ONLY after verification
        await pool.query(
            'INSERT INTO users (email, password_hash, is_verified) VALUES (?, ?, TRUE)',
            [email, pendingUser.passwordHash]
        );

        pendingRegistrations.delete(email);

        res.json({ message: 'Email verified successfully. You can now log in.' });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check verification
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email first' });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Hardcoded Admin requirement: ID = 1 is always admin.
        const userRole = user.id === 1 ? 'admin' : user.role;

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: userRole },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: userRole
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = { register, verifyEmail, login };
