import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SKILLS, LOCATIONS } from "@/lib/utils";

export default function UssdSimulator() {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>(`sim_${Date.now()}`);
  const [phoneNumber, setPhoneNumber] = useState<string>("0712345678");
  const [name, setName] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [ussdDisplay, setUssdDisplay] = useState<string>(
    "Welcome to yaya! Worker Registration\n\n1. Register as a worker\n2. Check job status\n\nReply with option number"
  );

  const handleUssdRequest = async () => {
    if (step === 0) {
      if (userInput === "1") {
        setUssdDisplay("Enter your full name:");
        setStep(1);
      } else if (userInput === "2") {
        setUssdDisplay("No active jobs found for your number.\n\n0. Back to main menu");
        setStep(5);
      } else {
        setUssdDisplay("Invalid option.\n\n1. Register as a worker\n2. Check job status\n\nReply with option number");
      }
    } else if (step === 1) {
      if (userInput.trim().length > 0) {
        setName(userInput);
        let skillOptions = SKILLS.map((s, i) => `${i + 1}. ${s}`).join("\n");
        setUssdDisplay(`Select your skill:\n\n${skillOptions}\n\n0. Back`);
        setStep(2);
      } else {
        setUssdDisplay("Name cannot be empty. Enter your full name:");
      }
    } else if (step === 2) {
      const selectedIndex = parseInt(userInput);
      if (userInput === "0") {
        setUssdDisplay("Enter your full name:");
        setStep(1);
      } else if (selectedIndex > 0 && selectedIndex <= SKILLS.length) {
        setSkill(SKILLS[selectedIndex - 1]);
        let locationOptions = LOCATIONS.map((l, i) => `${i + 1}. ${l}`).join("\n");
        setUssdDisplay(`Select your location:\n\n${locationOptions}\n\n0. Back`);
        setStep(3);
      } else {
        let skillOptions = SKILLS.map((s, i) => `${i + 1}. ${s}`).join("\n");
        setUssdDisplay(`Invalid option. Select your skill:\n\n${skillOptions}\n\n0. Back`);
      }
    } else if (step === 3) {
      const selectedIndex = parseInt(userInput);
      if (userInput === "0") {
        let skillOptions = SKILLS.map((s, i) => `${i + 1}. ${s}`).join("\n");
        setUssdDisplay(`Select your skill:\n\n${skillOptions}\n\n0. Back`);
        setStep(2);
      } else if (selectedIndex > 0 && selectedIndex <= LOCATIONS.length) {
        setLocation(LOCATIONS[selectedIndex - 1]);
        setUssdDisplay(`Confirm registration:\nName: ${name}\nSkill: ${skill}\nLocation: ${LOCATIONS[selectedIndex - 1]}\n\n1. Confirm\n2. Cancel`);
        setStep(4);
      } else {
        let locationOptions = LOCATIONS.map((l, i) => `${i + 1}. ${l}`).join("\n");
        setUssdDisplay(`Invalid option. Select your location:\n\n${locationOptions}\n\n0. Back`);
      }
    } else if (step === 4) {
      if (userInput === "1") {
        // Register worker via API
        try {
          const response = await fetch("/api/workers/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              phone: phoneNumber,
              skill,
              location,
              isAvailable: true,
            }),
          });

          if (response.ok) {
            setUssdDisplay("Registration successful! You will receive SMS notifications when jobs matching your skills are available in your area.");
            toast({
              title: "Registration Successful",
              description: "You have been registered as a worker.",
              variant: "default",
            });
            // End USSD session after 5 seconds
            setTimeout(() => {
              resetSimulator();
            }, 5000);
          } else {
            const error = await response.json();
            setUssdDisplay(`Registration failed: ${error.message}`);
            // End the session but allow them to reset
          }
        } catch (error) {
          setUssdDisplay("Registration failed due to a network error. Please try again.");
          // Let user reset simulator to try again
        }
      } else if (userInput === "2") {
        // Just end the session when cancelled
        setUssdDisplay("Registration cancelled.");
        // No step 5 or back to menu - they'll need to reset the simulator
      } else {
        // Invalid input handling
        setUssdDisplay(`Invalid option. Confirm registration:\nName: ${name}\nSkill: ${skill}\nLocation: ${location}\n\n1. Confirm\n2. Cancel`);
      }
    } else if (step === 5) {
      if (userInput === "0") {
        setUssdDisplay("Welcome to yaya! Worker Registration\n\n1. Register as a worker\n2. Check job status\n\nReply with option number");
        setStep(0);
      } else {
        setUssdDisplay("Invalid option.\n\n0. Back to main menu");
      }
    }
    
    setUserInput("");
  };

  const resetSimulator = () => {
    setStep(0);
    setSessionId(`sim_${Date.now()}`);
    setName("");
    setSkill("");
    setLocation("");
    setUserInput("");
    setUssdDisplay("Welcome to yaya! Worker Registration\n\n1. Register as a worker\n2. Check job status\n\nReply with option number");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-secondary shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold"><span className="text-primary">yaya!</span> Construction Labor Matching</h1>
          </Link>
          <Link href="/" className="text-white hover:text-primary transition-colors">
            Return to Home
          </Link>
        </div>
      </header>

      <main className="py-16 container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">USSD Simulator</h2>
            <p className="text-gray-400 mb-8">This simulator shows how workers would register via USSD</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Phone Number:</label>
                  <Input 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-40 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Session ID:</label>
                  <div className="text-sm text-gray-400">{sessionId}</div>
                </div>
              </div>

              <div className="bg-black rounded-lg p-4 font-mono text-sm mb-6 h-64 overflow-y-auto whitespace-pre-wrap">
                {ussdDisplay}
              </div>

              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your response"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUssdRequest();
                  }}
                />
                <Button 
                  className="bg-primary hover:bg-yellow-600 text-white" 
                  onClick={handleUssdRequest}
                >
                  Send
                </Button>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={resetSimulator}
              >
                Reset Simulator
              </Button>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Ready to post a job as a contractor?</p>
            <Link href="/contractor">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Contractor Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
