import { Instagram } from "lucide-react";

const instagramPosts = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1566206091558-7f218b696731?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1516763296043-f676c1105999?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1509631179407-329207048ce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    link: "https://instagram.com/byaimymmdoh"
  }
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl mb-6 text-center">Follow Our Style</h2>
        <p className="text-gray-700 text-center max-w-2xl mx-auto mb-12">
          Follow us on Instagram <span className="font-medium">@byaimymmdoh</span> for daily inspiration and style updates.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href={post.link} 
              target="_blank" 
              rel="noreferrer" 
              className="block relative overflow-hidden group"
            >
              <img 
                src={post.imageUrl} 
                alt="Instagram post" 
                className="w-full h-40 md:h-48 object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <Instagram className="text-white opacity-0 group-hover:opacity-100 h-6 w-6" />
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <a 
            href="https://instagram.com/byaimymmdoh" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors"
          >
            View More on Instagram <Instagram className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
