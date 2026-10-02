const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const router = express.Router();

// Generate verification token (6-digit OTP)
function generateVerificationToken() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send verification email
async function sendVerificationEmail(email, otp) {
    let emailSent = false;
    
    try {
        const transporter = createTransporter();
        
        // Verify connection first
        await transporter.verify();
        console.log('✅ SMTP connection verified for:', email);
        
        const mailOptions = {
            from: `"MyStore" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - MyStore',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; background: #007bff; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                        .otp-code { font-size: 32px; font-weight: bold; text-align: center; color: #007bff; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; letter-spacing: 8px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .warning { background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>MyStore Email Verification</h1>
                        </div>
                        <h2>Hello!</h2>
                        <p>Thank you for registering with MyStore. Use the following OTP code to verify your email address:</p>
                        
                        <div class="otp-code">${otp}</div>
                        
                        <div class="warning">
                            <strong>⚠️ This OTP will expire in 60 seconds</strong>
                        </div>
                        
                        <p>Enter this code on the verification page to complete your registration.</p>
                        <p>If you didn't create an account with MyStore, please ignore this email.</p>
                        
                        <div class="footer">
                            <p>&copy; 2024 MyStore. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', email);
        console.log('📧 Message ID:', result.messageId);
        emailSent = true;
        
    } catch (error) {
        console.error('❌ Failed to send email to:', email);
        console.error('Error details:', error.message);
    }
    
    // Always show OTP in console (fallback)
    console.log('\n📧 OTP Verification Details:');
    console.log('════════════════════════════════════════');
    console.log('To:', email);
    console.log('OTP Code:', otp);
    console.log('Email Sent:', emailSent ? '✅ Yes' : '❌ No');
    console.log('Expires in: 60 seconds');
    console.log('════════════════════════════════════════\n');
    
    return emailSent;
}

// Register with email verification
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Create user with verification token (60 seconds expiry)
        const verificationToken = generateVerificationToken();
        user = await User.create({ 
            name, 
            email, 
            password,
            isVerified: false,
            verificationToken,
            verificationExpires: new Date(Date.now() + 60 * 1000) // 60 seconds
        });
        
        console.log(`\n🆕 New user registered: ${email}`);
        console.log(`🔐 OTP stored in database: ${verificationToken}`);
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken);
        
        res.status(201).json({ 
            message: emailSent 
                ? 'Registration successful! Check your email for the 6-digit OTP code.'
                : 'Registration successful! Check the server console for OTP code (email failed).',
            requiresVerification: true
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
});

// Verify email with OTP
router.post('/verify-email', async (req, res) => {
    try {
        const { email, token } = req.body;
        
        const user = await User.findOne({ 
            where: { 
                email,
                verificationToken: token
            }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }
        
        // Check if OTP is expired
        if (user.verificationExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
        
        // Mark user as verified and clear token
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        await user.save();
        
        console.log(`✅ User verified: ${email}`);
        
        // Generate JWT token
        const jwtToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token: jwtToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            message: 'Email verified successfully!'
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ where: { email, isVerified: false } });
        if (!user) {
            return res.status(400).json({ message: 'User not found or already verified' });
        }
        
        // Generate new verification token (60 seconds expiry)
        const verificationToken = generateVerificationToken();
        user.verificationToken = verificationToken;
        user.verificationExpires = new Date(Date.now() + 60 * 1000); // 60 seconds
        await user.save();
        
        console.log(`🔄 Resending OTP to: ${email}`);
        console.log(`🔐 New OTP: ${verificationToken}`);
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken);
        
        res.json({ 
            message: emailSent 
                ? 'New OTP sent successfully! Check your email.'
                : 'New OTP generated! Check server console (email failed).'
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login with verification check
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Check if email is verified
        if (!user.isVerified) {
            return res.status(400).json({ 
                message: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: user.email
            });
        }
        
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;