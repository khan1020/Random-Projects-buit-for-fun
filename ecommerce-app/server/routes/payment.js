const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem, Product } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get Stripe configuration - MOVED TO TOP
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Create payment intent - FIXED ENDPOINT NAME
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body; // REMOVED items - not needed for payment intent
        
        // Validate amount
        if (!amount || amount < 1) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: req.user.userId.toString()
                // REMOVED: items: JSON.stringify(items) - too large for metadata
            }
        });

        res.json({ 
            clientSecret: paymentIntent.client_secret 
        });

    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(500).json({ 
            message: 'Payment processing error',
            error: error.message 
        });
    }
});

// Create order after successful payment - FIXED CART CLEARING
router.post('/create-order', authMiddleware, async (req, res) => {
    const transaction = await require('../config/database').transaction();
    
    try {
        const { items, total, shippingAddress, paymentIntentId } = req.body;
        
        // Validate required fields
        if (!items || !total || !shippingAddress || !paymentIntentId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create order - FIXED: Remove JSON.stringify for shippingAddress
        const order = await Order.create({
            userId: req.user.userId,
            totalAmount: total,
            status: 'paid',
            shippingAddress: shippingAddress, // Already an object
            stripePaymentIntentId: paymentIntentId
        }, { transaction });

        // Create order items and update product stock
        for (const item of items) {
            // Validate product exists and has sufficient stock
            const product = await Product.findByPk(item.product.id, { transaction });
            if (!product) {
                throw new Error(`Product not found: ${item.product.id}`);
            }
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            await OrderItem.create({
                orderId: order.id,
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.product.price
            }, { transaction });

            // Update product stock
            await Product.decrement('stock_quantity', {
                by: item.quantity,
                where: { id: item.product.id },
                transaction
            });
        }

        await transaction.commit();
        
        // REMOVED: Cart clearing from backend - handled by frontend
        // Return consistent response
        res.status(201).json({
            orderId: order.id,
            message: 'Order created successfully!'
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Order creation failed',
            error: error.message 
        });
    }
});

// Get payment intent status
router.get('/intent/:id', authMiddleware, async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        res.json(paymentIntent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mock webhook handler (for development)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    console.log('💰 Payment webhook received');
    res.json({received: true});
});

module.exports = router;