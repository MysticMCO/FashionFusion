import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  carts, type Cart, type InsertCart, type CartItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getAllOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart methods
  getCart(sessionId: string): Promise<Cart | undefined>;
  createOrUpdateCart(sessionId: string, userId: number | undefined, items: Record<string, CartItem>): Promise<Cart>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carts: Map<string, Cart>;
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentCategoryId: number;
  currentProductId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentCartId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCartId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with an admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$rQEMwZpfGULCE7Y0xKjq1O2Fy12Uu5YYDJ4mJ8svH1iOLzkkOuLki", // "password"
      email: "admin@byaimymmdoh.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true
    } as any);
    
    // Initialize with sample categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const categories: InsertCategory[] = [
      {
        name: "Dresses",
        slug: "dresses",
        description: "Elegant dresses for all occasions",
        imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Tops",
        slug: "tops",
        description: "Stylish tops and blouses",
        imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with our accessories",
        imageUrl: "https://images.unsplash.com/photo-1499971856191-1a420a42b498?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ];
    
    categories.forEach(category => this.createCategory(category));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: !!insertUser.isAdmin };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updated = { ...category, ...updatedCategory };
    this.categories.set(id, updated);
    return updated;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isNew)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.isFeatured)
      .slice(0, limit);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    
    return this.getProductsByCategory(category.id);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, updatedProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { ...product, ...updatedProduct };
    this.products.set(id, updated);
    return updated;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(),
      status: insertOrder.status || "pending",
      paymentStatus: insertOrder.paymentStatus || "pending"
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updated = { 
      ...order, 
      status,
      ...(paymentStatus ? { paymentStatus } : {})
    };
    this.orders.set(id, updated);
    return updated;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Cart methods
  async getCart(sessionId: string): Promise<Cart | undefined> {
    return this.carts.get(sessionId);
  }
  
  async createOrUpdateCart(sessionId: string, userId: number | undefined, items: Record<string, CartItem>): Promise<Cart> {
    const existingCart = this.carts.get(sessionId);
    
    if (existingCart) {
      const updatedCart = {
        ...existingCart,
        userId,
        items
      };
      this.carts.set(sessionId, updatedCart);
      return updatedCart;
    }
    
    const id = this.currentCartId++;
    const cart: Cart = {
      id,
      userId,
      sessionId,
      items,
      createdAt: new Date()
    };
    this.carts.set(sessionId, cart);
    return cart;
  }
}

export const storage = new MemStorage();
