import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertSiteSettingSchema,
  type CartItem
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  next();
};

// Generate a session ID for cart if not exists
const getOrCreateSessionId = (req: any) => {
  if (!req.session.cartId) {
    req.session.cartId = nanoid();
  }
  return req.session.cartId;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });
  
  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to get category" });
    }
  });
  
  // Admin category routes
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const parseResult = insertCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const category = await storage.createCategory(parseResult.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parseResult = insertCategorySchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const category = await storage.updateCategory(id, parseResult.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  
  app.get("/api/products/new", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getNewArrivals(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get new arrivals" });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get featured products" });
    }
  });
  
  app.get("/api/products/category/:slug", async (req, res) => {
    try {
      const products = await storage.getProductsByCategorySlug(req.params.slug);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products by category" });
    }
  });
  
  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });
  
  // Admin product routes
  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const parseResult = insertProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const product = await storage.createProduct(parseResult.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parseResult = insertProductSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const product = await storage.updateProduct(id, parseResult.data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      const cart = await storage.getCart(sessionId) || { items: {} };
      res.json(cart.items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart" });
    }
  });
  
  const cartItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    imageUrl: z.string()
  });
  
  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      const userId = req.user?.id;
      
      // Validate cart items
      const parseResult = z.record(z.string(), cartItemSchema).safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const cart = await storage.createOrUpdateCart(sessionId, userId, parseResult.data);
      res.json(cart.items);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart" });
    }
  });
  
  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only admin or the owner can view the order
      if (order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });
  
  // Order tracking (public API that doesn't require authentication)
  app.post("/api/orders/track", async (req, res) => {
    try {
      const { orderId, email } = req.body;
      
      if (!orderId || !email) {
        return res.status(400).json({ message: "Order ID and email are required" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Validate that the email matches the order
      if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ message: "Email doesn't match order record" });
      }
      
      // Include order items in the response
      const orderItems = await storage.getOrderItems(orderId);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to track order" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      const parseResult = insertOrderSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      // Add user ID if authenticated
      let orderData = parseResult.data;
      if (req.isAuthenticated()) {
        orderData = { ...orderData, userId: req.user.id };
      }
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const itemData = {
            orderId: order.id,
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          };
          
          const parseItemResult = insertOrderItemSchema.safeParse(itemData);
          if (parseItemResult.success) {
            await storage.createOrderItem(parseItemResult.data);
          }
        }
      }
      
      // Clear cart after successful order
      const sessionId = getOrCreateSessionId(req);
      await storage.createOrUpdateCart(sessionId, req.user?.id, {});
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Admin order routes
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  app.put("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentStatus } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status, paymentStatus);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // PayMob integration placeholder
  // This would be implemented with the real PayMob API in production
  app.post("/api/payment/paymob/create", async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      
      if (!amount || !orderId) {
        return res.status(400).json({ message: "Amount and orderId are required" });
      }
      
      // In a real implementation, we would call PayMob API here
      // For now, we'll just return a dummy payment intent
      const paymentIntent = {
        id: `pi_${nanoid(16)}`,
        amount,
        currency: "EGP",
        status: "pending"
      };
      
      res.json({ paymentIntent });
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  app.post("/api/payment/paymob/confirm", async (req, res) => {
    try {
      const { paymentIntentId, orderId } = req.body;
      
      if (!paymentIntentId || !orderId) {
        return res.status(400).json({ message: "PaymentIntentId and orderId are required" });
      }
      
      // In a real implementation, we would call PayMob API to confirm the payment
      // For now, just update the order status
      const order = await storage.updateOrderStatus(
        parseInt(orderId), 
        "processing", 
        "paid"
      );
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });
  
  // Site Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });
  
  app.get("/api/settings/group/:group", async (req, res) => {
    try {
      const settings = await storage.getSettingsByGroup(req.params.group);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings by group" });
    }
  });
  
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to get setting" });
    }
  });
  
  // Admin Settings routes
  app.post("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const parseResult = insertSiteSettingSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const setting = await storage.createSetting(parseResult.data);
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to create setting" });
    }
  });
  
  app.put("/api/admin/settings/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parseResult = insertSiteSettingSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.format() });
      }
      
      const setting = await storage.updateSetting(id, parseResult.data);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });
  
  app.delete("/api/admin/settings/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSetting(id);
      if (!success) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
