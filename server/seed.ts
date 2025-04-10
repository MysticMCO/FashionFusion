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