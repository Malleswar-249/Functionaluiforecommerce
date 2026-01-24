import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { initDemoAccounts } from './init-demo.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify user from token
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ========== AUTH ROUTES ==========

app.post('/make-server-fe618f6f/signup', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, role: 'user' },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      phone,
      role: 'user',
      address: '',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup server error: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

app.post('/make-server-fe618f6f/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(`Login error: ${error.message}`);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user:${data.user.id}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        role: data.user.user_metadata?.role || 'user'
      }
    });
  } catch (error) {
    console.log(`Login server error: ${error}`);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ========== PRODUCT ROUTES ==========

app.get('/make-server-fe618f6f/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.log(`Get products error: ${error}`);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

app.get('/make-server-fe618f6f/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log(`Get product error: ${error}`);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

app.post('/make-server-fe618f6f/products', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const productData = await c.req.json();
    const productId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const product = {
      id: productId,
      ...productData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`product:${productId}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Create product error: ${error}`);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

app.put('/make-server-fe618f6f/products/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`product:${id}`, product);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Update product error: ${error}`);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

app.delete('/make-server-fe618f6f/products/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete product error: ${error}`);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ========== CATEGORY ROUTES ==========

app.get('/make-server-fe618f6f/categories', async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    return c.json({ categories });
  } catch (error) {
    console.log(`Get categories error: ${error}`);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

app.post('/make-server-fe618f6f/categories', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { name, description } = await c.req.json();
    const categoryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const category = {
      id: categoryId,
      name,
      description,
      createdAt: new Date().toISOString()
    };

    await kv.set(`category:${categoryId}`, category);
    return c.json({ success: true, category });
  } catch (error) {
    console.log(`Create category error: ${error}`);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// ========== CART ROUTES ==========

app.get('/make-server-fe618f6f/cart', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    // Populate cart with product details
    const populatedItems = [];
    for (const item of cart.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        populatedItems.push({
          ...item,
          product
        });
      }
    }

    return c.json({ cart: { items: populatedItems } });
  } catch (error) {
    console.log(`Get cart error: ${error}`);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

app.post('/make-server-fe618f6f/cart', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productId, quantity } = await c.req.json();
    
    // Verify product exists
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, addedAt: new Date().toISOString() });
    }

    await kv.set(`cart:${user.id}`, cart);
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Add to cart error: ${error}`);
    return c.json({ error: 'Failed to add to cart' }, 500);
  }
});

app.delete('/make-server-fe618f6f/cart/:productId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    cart.items = cart.items.filter((item: any) => item.productId !== productId);
    await kv.set(`cart:${user.id}`, cart);
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Remove from cart error: ${error}`);
    return c.json({ error: 'Failed to remove from cart' }, 500);
  }
});

app.put('/make-server-fe618f6f/cart/:productId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const { quantity } = await c.req.json();
    
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await kv.set(`cart:${user.id}`, cart);
    }
    
    return c.json({ success: true, cart });
  } catch (error) {
    console.log(`Update cart error: ${error}`);
    return c.json({ error: 'Failed to update cart' }, 500);
  }
});

// ========== ORDER ROUTES ==========

app.get('/make-server-fe618f6f/orders', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    // Admin can see all orders, users see only their own
    if (profile?.role === 'admin') {
      const allOrders = await kv.getByPrefix('order:');
      return c.json({ orders: allOrders });
    } else {
      const userOrderKeys = await kv.getByPrefix(`order-user:${user.id}:`);
      const orders = [];
      for (const key of userOrderKeys) {
        const order = await kv.get(`order:${key}`);
        if (order) orders.push(order);
      }
      return c.json({ orders });
    }
  } catch (error) {
    console.log(`Get orders error: ${error}`);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

app.get('/make-server-fe618f6f/orders/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    // Users can only view their own orders, admins can view all
    if (order.userId !== user.id && profile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ order });
  } catch (error) {
    console.log(`Get order error: ${error}`);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

app.post('/make-server-fe618f6f/orders', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { shippingAddress, paymentMethod } = await c.req.json();
    
    // Get user's cart
    const cart = await kv.get(`cart:${user.id}`);
    if (!cart || !cart.items || cart.items.length === 0) {
      return c.json({ error: 'Cart is empty' }, 400);
    }

    // Calculate total
    let total = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        orderItems.push({
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: itemTotal
        });
      }
    }

    const orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = {
      id: orderId,
      userId: user.id,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);
    await kv.set(`order-user:${user.id}:${orderId}`, orderId);
    
    // Clear cart
    await kv.set(`cart:${user.id}`, { items: [] });

    return c.json({ success: true, order });
  } catch (error) {
    console.log(`Create order error: ${error}`);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.put('/make-server-fe618f6f/orders/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const updates = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    // Users can only cancel their own orders, admins can update any order
    if (order.userId !== user.id && profile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Users can only cancel, admins can change status
    if (profile?.role !== 'admin' && updates.status && updates.status !== 'cancelled') {
      return c.json({ error: 'Users can only cancel orders' }, 403);
    }

    const updatedOrder = {
      ...order,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log(`Update order error: ${error}`);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// ========== PAYMENT ROUTES ==========

app.post('/make-server-fe618f6f/payments', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { orderId, paymentDetails } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Simulate payment processing
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = {
      id: paymentId,
      orderId,
      userId: user.id,
      amount: order.total,
      status: 'completed',
      paymentDetails: { ...paymentDetails, cardNumber: '****' }, // Don't store sensitive data
      createdAt: new Date().toISOString()
    };

    await kv.set(`payment:${paymentId}`, payment);
    
    // Update order payment status
    order.paymentStatus = 'completed';
    order.status = 'processing';
    await kv.set(`order:${orderId}`, order);

    return c.json({ success: true, payment, order });
  } catch (error) {
    console.log(`Payment error: ${error}`);
    return c.json({ error: 'Payment failed' }, 500);
  }
});

app.post('/make-server-fe618f6f/payments/verify', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { paymentId } = await c.req.json();
    const payment = await kv.get(`payment:${paymentId}`);
    
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }

    if (payment.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ payment });
  } catch (error) {
    console.log(`Verify payment error: ${error}`);
    return c.json({ error: 'Failed to verify payment' }, 500);
  }
});

// ========== PROFILE ROUTES ==========

app.get('/make-server-fe618f6f/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      // Create profile from auth metadata
      const newProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        role: user.user_metadata?.role || 'user',
        address: '',
        createdAt: new Date().toISOString()
      };
      await kv.set(`user:${user.id}`, newProfile);
      return c.json({ profile: newProfile });
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put('/make-server-fe618f6f/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}`) || {};
    
    // Don't allow role changes via this endpoint
    delete updates.role;
    delete updates.id;
    
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedProfile);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ========== ADMIN STATS ==========

app.get('/make-server-fe618f6f/admin/stats', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const orders = await kv.getByPrefix('order:');
    const products = await kv.getByPrefix('product:');

    const totalRevenue = orders.reduce((sum: number, order: any) => {
      if (order.paymentStatus === 'completed') {
        return sum + (order.total || 0);
      }
      return sum;
    }, 0);

    const stats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length
    };

    return c.json({ stats });
  } catch (error) {
    console.log(`Get stats error: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ========== SEED DATA ENDPOINT (for demo) ==========

app.post('/make-server-fe618f6f/seed', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Check if already seeded
    const existingProducts = await kv.getByPrefix('product:');
    if (existingProducts.length > 0) {
      return c.json({ message: 'Database already seeded' });
    }

    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Home & Garden', description: 'Home improvement and gardening' },
      { name: 'Sports', description: 'Sports equipment and accessories' }
    ];

    const categoryIds: string[] = [];
    for (const cat of categories) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(`category:${id}`, { id, ...cat, createdAt: new Date().toISOString() });
      categoryIds.push(id);
    }

    // Create sample products
    const products = [
      { name: 'Wireless Headphones', description: 'Premium noise-canceling headphones', price: 299.99, category: categoryIds[0], rating: 4.5, stock: 50 },
      { name: 'Smartphone', description: 'Latest model smartphone', price: 899.99, category: categoryIds[0], rating: 4.8, stock: 30 },
      { name: 'Laptop', description: 'High-performance laptop', price: 1299.99, category: categoryIds[0], rating: 4.7, stock: 20 },
      { name: 'T-Shirt', description: 'Cotton casual t-shirt', price: 29.99, category: categoryIds[1], rating: 4.2, stock: 100 },
      { name: 'Jeans', description: 'Classic blue jeans', price: 79.99, category: categoryIds[1], rating: 4.4, stock: 75 },
      { name: 'Running Shoes', description: 'Comfortable running shoes', price: 129.99, category: categoryIds[3], rating: 4.6, stock: 60 },
      { name: 'Yoga Mat', description: 'Non-slip yoga mat', price: 39.99, category: categoryIds[3], rating: 4.3, stock: 80 },
      { name: 'Garden Tools Set', description: 'Complete gardening toolkit', price: 89.99, category: categoryIds[2], rating: 4.5, stock: 40 }
    ];

    for (const prod of products) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(`product:${id}`, { id, ...prod, imageUrl: '', createdAt: new Date().toISOString() });
    }

    return c.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.log(`Seed error: ${error}`);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});

// ========== INIT DEMO ACCOUNTS ENDPOINT ==========

app.post('/make-server-fe618f6f/init-demo', async (c) => {
  try {
    const result = await initDemoAccounts();
    return c.json(result);
  } catch (error) {
    console.log(`Init demo error: ${error}`);
    return c.json({ error: 'Failed to initialize demo accounts' }, 500);
  }
});

Deno.serve(app.fetch);