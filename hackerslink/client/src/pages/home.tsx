import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import SimpleFooter from "../components/SimpleFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SimpleFooter />
    </div>
  );
}
