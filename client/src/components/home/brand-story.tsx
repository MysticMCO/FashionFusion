import { Link } from "wouter";

export default function BrandStory() {
  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1464069668014-9a2e9fa69833?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="Designer workspace" 
              className="w-full h-[500px] object-cover" 
            />
          </div>
          <div className="md:w-1/2 md:pl-16">
            <h2 className="font-serif text-3xl mb-6">Our Brand Story</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              @byaimymmdoh was founded with a simple vision: to create timeless, minimalist pieces that celebrate the essence of modern fashion. Each collection is thoughtfully designed to embrace individuality while maintaining a clean, sophisticated aesthetic.
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Our commitment to sustainable practices and ethical production reflects our belief that fashion should not only look good but do good. From sourcing materials to final production, we prioritize quality and responsibility.
            </p>
            <Link 
              href="/about" 
              className="inline-block border border-primary text-primary px-8 py-3 font-medium text-sm tracking-wide hover:bg-primary hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
