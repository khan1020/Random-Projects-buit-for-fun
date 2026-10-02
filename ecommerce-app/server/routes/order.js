const express = require('express');
const { Order, OrderItem, Product } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); // FIXED: Added adminMiddleware
const router = express.Router();

// Create new order
router.post('/', authMiddleware, async (req, res) => {
    const transaction = await require('../config/database').transaction();
    
    try {
        const { items, total, shippingAddress } = req.body;
        
        // Create order
        const order = await Order.create({
            userId: req.user.userId,
            totalAmount: total,
            shippingAddress: JSON.stringify(shippingAddress),
            status: 'completed'
        }, { transaction });

        // Create order items and update product stock
        for (const item of items) {
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
        res.status(201).json(order);
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.userId },
            include: ['orderItems'],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: ['orderItems'],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Update order status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        console.log(`🔄 Updating order ${orderId} status to: ${status}`);
        
        // Validate status
        const allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        console.log(`✅ Order ${orderId} status updated to: ${status}`);
        
        res.json({
            message: `Order status updated to ${status}`,
            order: order
        });
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single order details
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{
                model: OrderItem,
                as: 'orderItems',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mock shipping notification endpoint
router.post('/:id/notify-shipping', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // In a real app, you would send an email here
        console.log(`📧 Shipping notification would be sent for order #${order.id}`);
        
        res.json({
            message: 'Shipping notification sent successfully',
            orderId: order.id
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;