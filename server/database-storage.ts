import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  carts, type Cart, type InsertCart, type CartItem,
  siteSettings, type SiteSetting, type InsertSiteSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

const PostgresStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }
  
  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updatedCategory)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id));
    return !!result.rowCount;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }
  
  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.isNew, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }
  
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(limit);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
  }
  
  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    
    return this.getProductsByCategory(category.id);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }
  
  async updateProduct(id: number, updatedProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updatedProduct)
      .where(eq(products.id, id))
      .returning();
    return product;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return !!result.rowCount;
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }
  
  async updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const updateData: Partial<Order> = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  // Cart methods
  async getCart(sessionId: string): Promise<Cart | undefined> {
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));
    return cart;
  }
  
  async createOrUpdateCart(sessionId: string, userId: number | undefined, items: Record<string, CartItem>): Promise<Cart> {
    const existingCart = await this.getCart(sessionId);
    
    if (existingCart) {
      const [updatedCart] = await db
        .update(carts)
        .set({ userId: userId || null, items })
        .where(eq(carts.sessionId, sessionId))
        .returning();
      return updatedCart;
    } else {
      const [cart] = await db
        .insert(carts)
        .values({ 
          sessionId, 
          userId: userId || null, 
          items 
        })
        .returning();
      return cart;
    }
  }

  // Site settings methods
  async getAllSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }
  
  async getSettingsByGroup(group: string): Promise<SiteSetting[]> {
    return db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.group, group));
  }
  
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    return setting;
  }
  
  async createSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }
  
  async updateSetting(id: number, updatedSetting: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .update(siteSettings)
      .set(updatedSetting)
      .where(eq(siteSettings.id, id))
      .returning();
    return setting;
  }
  
  async deleteSetting(id: number): Promise<boolean> {
    const result = await db
      .delete(siteSettings)
      .where(eq(siteSettings.id, id));
    return !!result.rowCount;
  }
}