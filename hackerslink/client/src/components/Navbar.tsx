import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-secondary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/">
          <span className="flex items-center">
            <h1 className="text-2xl font-bold"><span className="text-primary">yaya!</span> Construction Labor Matching</h1>
          </span>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#how-it-works" className="hover:text-primary transition duration-300">How it Works</a>
        </nav>
        
        <Link href="/contractor">
          <Button className="bg-primary hover:bg-yellow-600 text-white hidden md:block">
            Get Started
          </Button>
        </Link>
        
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-secondary border-t border-gray-700 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <a 
              href="#how-it-works" 
              className="py-2 hover:text-primary transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            <Link href="/contractor">
              <Button 
                className="bg-primary hover:bg-yellow-600 text-white w-full mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
