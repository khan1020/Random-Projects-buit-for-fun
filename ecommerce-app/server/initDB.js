const { sequelize, User, Product, Order, OrderItem } = require('./models');

async function initializeDatabase() {
    try {
        // Test connection first
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync all models with database
        await sequelize.sync({ force: true });
        console.log('Database synchronized successfully');
        
        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin user created:', adminUser.email);
        
        // Create regular user
        const regularUser = await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: 'user123',
            role: 'customer'
        });
        console.log('Regular user created:', regularUser.email);
        
        // Create sample products
        const sampleProducts = [
            {
                name: 'Wireless Bluetooth Headphones',
                description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
                price: 99.99,
                image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop',
                stock_quantity: 50
            },
            {
                name: 'Smartphone Stand',
                description: 'Adjustable smartphone stand compatible with all phone sizes. Perfect for desk use.',
                price: 24.99,
                image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=300&fit=crop',
                stock_quantity: 100
            },
            {
                name: 'Mechanical Keyboard',
                description: 'RGB mechanical keyboard with cherry MX switches and programmable keys.',
                price: 129.99,
                image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=300&fit=crop',
                stock_quantity: 25
            },
            {
                name: 'Laptop Backpack',
                description: 'Water-resistant laptop backpack with multiple compartments and USB charging port.',
                price: 59.99,
                image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=300&fit=crop',
                stock_quantity: 75
            }
        ];
        
        const createdProducts = await Product.bulkCreate(sampleProducts);
        console.log(`Created ${createdProducts.length} sample products`);
        
        console.log('Database initialization completed successfully!');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Setup completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;