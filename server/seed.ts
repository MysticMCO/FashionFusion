import { db } from './db';
import { users, categories, siteSettings } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');
  
  // Seed admin user
  const adminExists = await db.select().from(users).where(eq(users.username, 'admin'));
  
  if (adminExists.length === 0) {
    console.log('Creating admin user...');
    await db.insert(users).values({
      username: 'admin',
      password: await hashPassword('password'), // Will be hashed by the function
      email: 'admin@byaimymmdoh.com',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }
  
  // Seed categories
  const categoriesExist = await db.select().from(categories);
  
  if (categoriesExist.length === 0) {
    console.log('Creating categories...');
    const categoryData = [
      {
        name: "All Women",
        slug: "all-women",
        description: "All women's fashion collections",
        imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Casual",
        slug: "casual",
        description: "Comfortable and stylish casual wear",
        imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Formal",
        slug: "formal",
        description: "Elegant formal attire for professional settings",
        imageUrl: "https://images.unsplash.com/photo-1499971856191-1a420a42b498?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Soiree",
        slug: "soiree",
        description: "Glamorous evening wear for special occasions",
        imageUrl: "https://images.unsplash.com/photo-1529898329131-c84e8007f9c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Designed Wedding Dresses",
        slug: "wedding-dresses",
        description: "Bespoke and luxurious wedding dresses",
        imageUrl: "https://images.unsplash.com/photo-1525257831700-9f6c70677f2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with our accessories",
        imageUrl: "https://images.unsplash.com/photo-1499971856191-1a420a42b498?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ];
    
    await db.insert(categories).values(categoryData);
    console.log('Categories created.');
  } else {
    console.log('Categories already exist.');
  }
  
  // Seed site settings
  const settingsExist = await db.select().from(siteSettings);
  
  // Check if shipping and payment settings exist
  const shippingSettingExists = await db.select().from(siteSettings).where(eq(siteSettings.key, 'shipping_methods'));
  const paymentSettingExists = await db.select().from(siteSettings).where(eq(siteSettings.key, 'payment_methods'));
  
  // Add shipping methods if they don't exist
  if (shippingSettingExists.length === 0) {
    console.log('Adding shipping methods...');
    await db.insert(siteSettings).values({
      key: "shipping_methods",
      value: JSON.stringify([
        { 
          id: "standard", 
          name: "Standard Shipping", 
          description: "3-5 business days", 
          price: 10 
        },
        { 
          id: "express", 
          name: "Express Shipping", 
          description: "1-2 business days", 
          price: 15 
        }
      ]),
      group: "shipping",
      label: "Shipping Methods",
      type: "json"
    });
    console.log('Shipping methods added.');
  }
  
  // Add payment methods if they don't exist
  if (paymentSettingExists.length === 0) {
    console.log('Adding payment methods...');
    await db.insert(siteSettings).values({
      key: "payment_methods",
      value: JSON.stringify([
        {
          id: "cod",
          name: "Cash on Delivery",
          description: "Pay when you receive your order",
          enabled: true
        },
        {
          id: "paymob",
          name: "Credit/Debit Card (Paymob)",
          description: "Secure online payment with Paymob",
          enabled: true
        }
      ]),
      group: "payment",
      label: "Payment Methods",
      type: "json"
    });
    console.log('Payment methods added.');
  }
  
  if (settingsExist.length === 0) {
    console.log('Creating site settings...');
    const settingsData = [
      // SEO settings
      {
        key: "site_title",
        value: "@byaimymmdoh - Luxury Women's Fashion",
        group: "seo",
        label: "Site Title",
        type: "text"
      },
      {
        key: "site_description",
        value: "Discover exclusive women's fashion collections at @byaimymmdoh - Your destination for casual, formal, soiree, and wedding dresses.",
        group: "seo",
        label: "Site Description",
        type: "textarea"
      },
      {
        key: "meta_keywords",
        value: "women's fashion, luxury clothing, dresses, formal wear, wedding dresses, soiree, casual wear",
        group: "seo",
        label: "Meta Keywords",
        type: "textarea"
      },
      
      // Contact settings
      {
        key: "contact_email",
        value: "info@byaimymmdoh.com",
        group: "contact",
        label: "Contact Email",
        type: "email"
      },
      {
        key: "contact_phone",
        value: "+20 1234567890",
        group: "contact",
        label: "Contact Phone",
        type: "text"
      },
      {
        key: "contact_address",
        value: "123 Fashion Avenue, Cairo, Egypt",
        group: "contact",
        label: "Contact Address",
        type: "textarea"
      },
      
      // Social media settings
      {
        key: "social_instagram",
        value: "https://instagram.com/byaimymmdoh",
        group: "social",
        label: "Instagram URL",
        type: "url"
      },
      {
        key: "social_facebook",
        value: "https://facebook.com/byaimymmdoh",
        group: "social",
        label: "Facebook URL",
        type: "url"
      },
      {
        key: "social_twitter",
        value: "https://twitter.com/byaimymmdoh",
        group: "social",
        label: "Twitter URL",
        type: "url"
      },
      
      // Homepage settings
      {
        key: "hero_title",
        value: "Elegance Redefined",
        group: "homepage",
        label: "Hero Title",
        type: "text"
      },
      {
        key: "hero_subtitle",
        value: "Discover our exclusive collection of luxury women's fashion",
        group: "homepage",
        label: "Hero Subtitle",
        type: "text"
      },
      {
        key: "hero_cta_text",
        value: "Shop Now",
        group: "homepage",
        label: "Hero CTA Text",
        type: "text"
      },
      {
        key: "hero_image",
        value: "https://images.unsplash.com/photo-1529898329131-c84e8007f9c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1800&q=80",
        group: "homepage",
        label: "Hero Background Image",
        type: "image"
      },
      
      // Shipping methods
      {
        key: "shipping_methods",
        value: JSON.stringify([
          { 
            id: "standard", 
            name: "Standard Shipping", 
            description: "3-5 business days", 
            price: 10 
          },
          { 
            id: "express", 
            name: "Express Shipping", 
            description: "1-2 business days", 
            price: 15 
          }
        ]),
        group: "shipping",
        label: "Shipping Methods",
        type: "json"
      },
      
      // Payment methods
      {
        key: "payment_methods",
        value: JSON.stringify([
          {
            id: "cod",
            name: "Cash on Delivery",
            description: "Pay when you receive your order",
            enabled: true
          },
          {
            id: "paymob",
            name: "Credit/Debit Card (Paymob)",
            description: "Secure online payment with Paymob",
            enabled: true
          }
        ]),
        group: "payment",
        label: "Payment Methods",
        type: "json"
      },
      
      // About Page Content
      {
        key: "about_title",
        value: "About @byaimymmdoh",
        group: "about",
        label: "About Page Title",
        type: "text"
      },
      {
        key: "about_content",
        value: "<p>Welcome to @byaimymmdoh, a leading brand in women's fashion. We're dedicated to bringing you the finest selection of casual, formal, soiree, and wedding dresses designed with elegance and attention to detail.</p><p>Our mission is to help women express their unique style through our thoughtfully designed collections that blend timeless elegance with contemporary trends.</p><p>Founded with a passion for empowering women through fashion, we've grown into a trusted name in the industry, known for our commitment to quality and customer satisfaction.</p><p>We invite you to explore our collections and discover the perfect pieces to enhance your wardrobe.</p>",
        group: "about",
        label: "About Page Content",
        type: "textarea"
      }
    ];
    
    await db.insert(siteSettings).values(settingsData);
    console.log('Site settings created.');
  } else {
    console.log('Site settings already exist.');
  }
  
  console.log('Database seeding complete.');
}

// ESM doesn't have require.main, so we don't need to check for direct execution
// The seed function will be called directly from index.ts

export { seed };