import { Link } from "wouter";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-6">@byaimymmdoh</h3>
            <p className="text-gray-300 mb-6">
              Contemporary fashion for the modern individual, crafted with care and attention to detail.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-white hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" className="text-white hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-white hover:text-accent transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products/category/all-women" className="text-gray-300 hover:text-white transition-colors">
                  All Women
                </Link>
              </li>
              <li>
                <Link href="/products/category/casual" className="text-gray-300 hover:text-white transition-colors">
                  Casual
                </Link>
              </li>
              <li>
                <Link href="/products/category/formal" className="text-gray-300 hover:text-white transition-colors">
                  Formal
                </Link>
              </li>
              <li>
                <Link href="/products/category/soiree" className="text-gray-300 hover:text-white transition-colors">
                  Soiree
                </Link>
              </li>
              <li>
                <Link href="/products/category/wedding" className="text-gray-300 hover:text-white transition-colors">
                  Wedding
                </Link>
              </li>
              <li>
                <Link href="/products/category/new-arrivals" className="text-gray-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-6">Information</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-gray-300 hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5" />
                <span className="text-gray-300">123 Fashion St., Design District, City</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-3 mt-0.5" />
                <span className="text-gray-300">+1 234 567 890</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-3 mt-0.5" />
                <span className="text-gray-300">contact@byaimymmdoh.com</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-3 mt-0.5" />
                <span className="text-gray-300">Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} @byaimymmdoh. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="text-gray-400 text-sm hover:text-white transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
