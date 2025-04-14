
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const JoinCommunity = () => {
  const { language } = useLanguage();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // Implement form submission logic
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Users className="w-12 h-12 mx-auto text-kenya-green" />
            <h1 className="text-3xl font-bold">{translate("Join Our Community", language)}</h1>
            <p className="text-muted-foreground">
              {translate("Connect with fellow citizens passionate about civic education and making a difference in Kenya.", language)}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate("Full Name", language)}
                </label>
                <Input {...register("name")} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate("Email", language)}
                </label>
                <Input type="email" {...register("email")} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate("Phone Number", language)}
                </label>
                <Input type="tel" {...register("phone")} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate("Why do you want to join our community?", language)}
                </label>
                <Textarea {...register("motivation")} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {translate("Areas of Interest", language)}
                </label>
                <Textarea 
                  {...register("interests")} 
                  placeholder={translate("e.g., Civic Education, Community Development, Youth Empowerment", language)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-kenya-green hover:bg-kenya-green/90">
              {translate("Submit Application", language)}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default JoinCommunity;
