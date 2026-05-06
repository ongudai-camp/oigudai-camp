import Hero from "@/components/home/Hero";
import FeaturedSection from "@/components/home/FeaturedSection";

export default function Home() {
  return (
    <div className="bg-[#F0F9FF] min-h-screen pb-20">
      <Hero />
      
      <div className="container mx-auto px-4 space-y-10">
        <FeaturedSection type="hotel" titleKey="hotels" />
        <FeaturedSection type="tour" titleKey="tours" />
        <FeaturedSection type="activity" titleKey="activities" />
      </div>
    </div>
  );
}
