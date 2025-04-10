import HeroSection from "@/components/home/hero-section";
import FeaturedCategories from "@/components/home/featured-categories";
import NewArrivals from "@/components/home/new-arrivals";
import BrandStory from "@/components/home/brand-story";
import FeaturedCollection from "@/components/home/featured-collection";
import InstagramFeed from "@/components/home/instagram-feed";
import Newsletter from "@/components/home/newsletter";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>@byaimymmdoh | Minimal Fashion Brand</title>
        <meta name="description" content="Discover timeless, minimalist fashion pieces at @byaimymmdoh. Shop our latest collections of elegant clothing and accessories." />
      </Helmet>
      
      <HeroSection />
      <FeaturedCategories />
      <NewArrivals />
      <BrandStory />
      <FeaturedCollection />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
