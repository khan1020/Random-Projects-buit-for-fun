require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    try {
        console.log('Testing email configuration...');
        console.log('Email User:', process.env.EMAIL_USER);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');

        const result = await transporter.sendMail({
            from: `"MyStore" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'Test Email from MyStore',
            html: `
                <h1>Test Email Successful! 🎉</h1>
                <p>If you can read this, your email configuration is working perfectly!</p>
                <p><strong>Sender:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>Timestamp:</strong> ${new Date().toString()}</p>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
        
    } catch (error) {
        console.error('❌ Failed to send test email:');
        console.error('Error details:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔐 Authentication failed. Please check:');
            console.log('1. Your EMAIL_USER in .env file');
            console.log('2. Your EMAIL_PASS (use App Password, not regular password)');
            console.log('3. Make sure 2-factor authentication is enabled in Google');
        }
    }
}

testEmail();