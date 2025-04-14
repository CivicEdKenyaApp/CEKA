
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Users, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const JoinCommunity = () => {
  const { language } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
    // Implement form submission logic
    setSubmitted(true);
    toast({
      title: translate("Application Submitted!", language),
      description: translate("We'll review your application and get back to you soon.", language),
    });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container py-16 md:py-24 ios-scroll">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <h1 className="text-3xl font-bold">{translate("Application Received", language)}</h1>
            <p className="text-muted-foreground">
              {translate("Thank you for your interest in joining our community! We've received your application and will review it shortly. You'll receive an email confirmation soon.", language)}
            </p>
            <div className="pt-4">
              <Button asChild>
                <a href="/">{translate("Return to Home", language)}</a>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-16 ios-scroll">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto"
            >
              <Users className="w-16 h-16 mx-auto text-kenya-green" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold">{translate("Join Our Community", language)}</h1>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {translate("Connect with fellow citizens passionate about civic education and making a difference in Kenya.", language)}
              </p>
            </motion.div>
          </div>

          <Card className="border border-muted/40 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate("Full Name", language)}
                    </label>
                    <Input {...register("name", { required: true })} />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{translate("Name is required", language)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {translate("Email", language)}
                    </label>
                    <Input type="email" {...register("email", { required: true })} />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{translate("Email is required", language)}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {translate("Phone Number", language)} <span className="text-muted-foreground text-xs">({translate("Optional", language)})</span>
                  </label>
                  <Input type="tel" {...register("phone")} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {translate("What interests you most about our community?", language)}
                  </label>
                  <Textarea 
                    {...register("interests")} 
                    placeholder={translate("e.g., Civic Education, Community Development, Youth Empowerment", language)}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-kenya-green hover:bg-kenya-green/90">
                    {translate("Join Community", language)}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="bg-muted/20 p-6 rounded-lg border border-muted/30">
            <h3 className="font-semibold text-lg mb-3">{translate("Community Benefits", language)}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-kenya-green mr-2 mt-0.5" />
                <span>{translate("Access to exclusive educational resources", language)}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-kenya-green mr-2 mt-0.5" />
                <span>{translate("Connect with like-minded citizens committed to civic education", language)}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-kenya-green mr-2 mt-0.5" />
                <span>{translate("Participate in community events and discussions", language)}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-kenya-green mr-2 mt-0.5" />
                <span>{translate("Opportunities to contribute to educational content", language)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinCommunity;
