import { Icon } from "@/components/ui/icon";

export default function Footer() {
  return (
    <footer className="bg-secondary py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold"><span className="text-primary">yaya!</span> Construction Labor Matching</h2>
            <p className="text-gray-400 text-sm">Connecting contractors with skilled workers since 2024</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
              <Icon name="facebook" prefix="fab" className="fa-lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
              <Icon name="twitter" prefix="fab" className="fa-lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
              <Icon name="instagram" prefix="fab" className="fa-lg" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
              <Icon name="linkedin" prefix="fab" className="fa-lg" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 my-6"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 yayaInc. All rights reserved.</p>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-primary text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
