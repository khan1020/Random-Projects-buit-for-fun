const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
  status: {
        type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'orders'
});



module.exports = Order;