
import HeroSection from "@/components/home/hero-section";
import FeaturedEquipment from "@/components/home/featured-equipment";
import CategoriesSection from "@/components/home/categories-section";
import WhyChooseUs from "@/components/home/why-choose-us";
import TestimonialsSection from "@/components/home/testimonials-section";
import CTASection from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedEquipment />
      <CategoriesSection />
       <WhyChooseUs />
         <TestimonialsSection />
              <CTASection />
    </>
  );
}
