import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const demoSteps = [
  {
    title: "Worker Registration",
    description: "Worker dials *123# and completes the USSD registration process.",
    details: `Worker enters:
- Name: John Mwangi
- Skill: Mason
- Location: Pipeline`
  },
  {
    title: "Contractor Posts Job",
    description: "Contractor posts a job requiring a Mason in Pipeline.",
    details: `Job Details:
- Skill: Mason
- Location: Pipeline
- Daily Rate: 1200 KSh
- Duration: 1 day
- Notes: Need help with bathroom tiling`
  },
  {
    title: "System Matches Workers",
    description: "Our matching system finds workers with Mason skills in the Pipeline area.",
    details: `Matched Workers:
- John Mwangi (Mason, Pipeline)
- David Odhiambo (Mason, Pipeline)`
  },
  {
    title: "SMS Notifications Sent",
    description: "The system sends SMS notifications to matched workers with job details.",
    details: `SMS Message:
"yaya! Job Alert: Mason needed in Pipeline. 1200 KSh/day for 1 day project. 
Call 0712345678 to apply. Reply HELP for assistance."`
  },
  {
    title: "Worker Contacts Contractor",
    description: "Worker contacts the contractor directly to discuss the job opportunity.",
    details: `Worker calls contractor at 0712345678 to:
- Confirm availability
- Discuss job details
- Arrange meeting time`
  }
];

export default function DemoSection() {
  return (
    <div id="demo" className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">See yaya! in Action</h2>
          <p className="text-xl text-gray-400">Follow our demo to see how the system works</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-700">
            <div className="flex flex-col space-y-8">
              {demoSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                    <p className="text-gray-400 mb-3">{step.description}</p>
                    <div className="bg-gray-800 p-3 rounded border border-gray-700">
                      <pre className="text-gray-300 font-mono text-sm">
                        {step.details}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/ussd-simulator">
                  <Button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                    Try Worker Registration
                  </Button>
                </Link>
                <Link href="/contractor">
                  <Button className="bg-primary hover:bg-yellow-600 text-white">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
