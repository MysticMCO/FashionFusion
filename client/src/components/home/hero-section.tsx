import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative h-screen max-h-[800px] overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Fashion hero" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-primary bg-opacity-20"></div>
      </div>
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            The New Collection
          </h1>
          <p className="text-white text-lg md:text-xl mb-8 max-w-lg">
            Discover timeless pieces that embrace minimalism and elegance for the modern aesthetic.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/products/category/all-women" 
              className="bg-white text-primary px-8 py-3 font-medium text-sm tracking-wide hover:bg-accent hover:text-white transition-colors inline-block text-center"
            >
              Shop All Women
            </Link>
            <Link 
              href="/products/category/new-arrivals" 
              className="bg-transparent border border-white text-white px-8 py-3 font-medium text-sm tracking-wide hover:bg-white hover:text-primary transition-colors inline-block text-center"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
