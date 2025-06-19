import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { insertJobSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { SKILLS, LOCATIONS, DURATIONS, getWorkerAvailabilityMessage, getWorkerAvailabilityColor } from "@/lib/utils";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon } from "lucide-react";

const jobFormSchema = insertJobSchema.extend({
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits").max(13, "Phone number too long"),
  dailyRate: z.string().min(1, "Daily rate is required").transform(value => parseInt(value)),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function Contractor() {
  const { toast } = useToast();
  const [workerCount, setWorkerCount] = useState(0);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      contactPhone: "",
      skillRequired: "",
      location: "",
      dailyRate: "",
      projectDuration: "",
      additionalNotes: "",
      isActive: true,
    },
  });

  const { mutate: postJob, isPending } = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const response = await apiRequest("POST", "/api/jobs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully",
        description: "Workers in your area will be notified via SMS.",
        variant: "default",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { skillRequired, location } = form.watch();

  // Get worker availability when skill or location changes
  useEffect(() => {
    if (skillRequired && location) {
      fetch(`/api/workers/count?skill=${skillRequired}&location=${location}`)
        .then(res => res.json())
        .then(data => {
          setWorkerCount(data.count);
        })
        .catch(err => {
          console.error("Error fetching worker count:", err);
          setWorkerCount(0);
        });
    }
  }, [skillRequired, location]);

  const onSubmit = (data: JobFormValues) => {
    postJob(data);
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

      <main className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Contractor Job Portal</h2>
              <p className="text-gray-400">Post a job and find skilled workers in your area</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 0712345678" 
                            className="bg-gray-800 border-gray-700 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skillRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Required</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            {SKILLS.map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            {LOCATIONS.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {skillRequired && location && (
                    <div className={`text-sm flex items-center ${getWorkerAvailabilityColor(workerCount)}`}>
                      <InfoIcon className="mr-2 h-4 w-4" />
                      <span>{getWorkerAvailabilityMessage(skillRequired, location, workerCount)}</span>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate (KSh)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1200" 
                            className="bg-gray-800 border-gray-700 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Duration</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            {DURATIONS.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe any specific requirements" 
                            className="bg-gray-800 border-gray-700 text-white"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-yellow-600 text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting Job...
                      </>
                    ) : (
                      "Post Job"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
