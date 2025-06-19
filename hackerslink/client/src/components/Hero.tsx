import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-cover bg-center h-[500px]" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-white">Find workers.</span><br />
            <span className="text-primary">Get hired.</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8">Connect contractors with skilled construction workers in real-time using USSD and SMS.</p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/contractor">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md text-base">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
