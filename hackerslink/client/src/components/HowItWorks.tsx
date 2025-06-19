import { Icon } from "@/components/ui/icon";

const steps = [
  {
    icon: "mobile-alt",
    title: "1. Worker Registration",
    description: "Workers dial *123# and register their skills and location through a simple USSD menu."
  },
  {
    icon: "clipboard-list",
    title: "2. Contractor Posts Job",
    description: "Contractors post jobs via USSD or web, specifying the skill needed and location."
  },
  {
    icon: "search-location",
    title: "3. Smart Matching",
    description: "Our system matches jobs with workers based on skills and location proximity."
  },
  {
    icon: "sms",
    title: "4. SMS Notification",
    description: "Matched workers receive SMS notifications with job details and contractor contact."
  },
  {
    icon: "phone",
    title: "5. Direct Connection",
    description: "Workers call or text the contractor directly to discuss the job opportunity."
  },
  {
    icon: "check-circle",
    title: "6. Job Fulfilled",
    description: "Contractors find skilled workers quickly, and workers secure employment opportunities."
  }
];

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">How <span className="text-primary">yaya!</span> works</h2>
          <p className="text-xl text-gray-400">A simple solution connecting contractors to skilled workers using USSD and SMS technology</p>
        </div>
        
        <div className="border-t border-b border-gray-800 py-2 mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-primary transition duration-300">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Icon name={step.icon} className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
