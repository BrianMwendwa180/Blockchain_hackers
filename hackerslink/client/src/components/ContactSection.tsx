import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@/components/ui/icon";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
        variant: "default",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div id="contact" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
            <p className="text-xl text-gray-400">Have questions about yaya!? We're here to help.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-gray-700 border-gray-600 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            className="bg-gray-700 border-gray-600 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4}
                            className="bg-gray-700 border-gray-600 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-yellow-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-gray-700 rounded-full p-2 mr-3 flex-shrink-0">
                    <Icon name="phone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">+254 712 345 678</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-700 rounded-full p-2 mr-3 flex-shrink-0">
                    <Icon name="envelope" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">support@yaya.co.ke</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-700 rounded-full p-2 mr-3 flex-shrink-0">
                    <Icon name="map-marker-alt" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white">Nairobi, Kenya</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-lg font-medium mb-2">USSD Code</h4>
                  <div className="bg-gray-900 p-3 rounded border border-gray-700 text-center">
                    <p className="text-sm text-gray-400">Dial</p>
                    <p className="text-2xl font-bold text-primary">*123#</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
