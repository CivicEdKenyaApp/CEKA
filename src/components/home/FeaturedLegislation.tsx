
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, EyeIcon, Users, Tag, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

// Sample featured legislation data
const featuredLegislation = [
  {
    id: 'bill-finance-2025',
    title: 'Finance Bill, 2025',
    description: 'Proposes amendments to expand the tax net; targeting digital and informal sectors, removing several tax incentives, tightening compliance measures, and giving KRA more administrative authority',
    status: 'First Reading',
    category: 'Governance',
    date: '2025-04-30',
    followersCount: 15000,
    tags: ['Finance', 'Governance', 'Devolution'],
    timeRemaining: '11 days'
  },
  {
    id: 'bill-456',
    title: 'Digital Rights and Freedoms Bill, 2023',
    description: 'Establishes a framework for protecting citizens\' digital rights, privacy, and freedoms in the online space.',
    status: 'First Reading',
    category: 'Technology',
    date: '2023-08-22',
    followersCount: 978,
    tags: ['Digital', 'Rights', 'Privacy'],
    timeRemaining: '30 days'
  },
  {
    id: 'bill-789',
    title: 'Healthcare Access Improvement Act, 2023',
    description: 'Aims to improve healthcare accessibility and affordability for all Kenyans through system reforms.',
    status: 'Second Reading',
    category: 'Health',
    date: '2023-07-30',
    followersCount: 2134,
    tags: ['Healthcare', 'Reforms', 'Access'],
    timeRemaining: '7 days'
  }
];

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'First Reading':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Second Reading':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'Committee Stage':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'Third Reading':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    case 'Presidential Assent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Enacted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const FeaturedLegislation = () => {
  const { language } = useLanguage();

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {translate('Featured Legislation', language)}
            </h2>
            <p className="text-muted-foreground mt-1">
              {translate('Track key bills and policies currently under consideration', language)}
            </p>
          </div>
          <Link to="/legislative-tracker" className="mt-4 md:mt-0 flex items-center text-primary hover:underline">
            {translate('View all legislation', language)}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {featuredLegislation.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(bill.status)} font-medium`}>
                    {translate(bill.status, language)}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {bill.timeRemaining}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{bill.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">{bill.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1.5 mt-1 mb-4">
                  {bill.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                    {bill.category}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(bill.date).toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center text-muted-foreground col-span-2">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    {bill.followersCount.toLocaleString()} {translate('followers', language)}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/legislative-tracker/${bill.id}`}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {translate('Track this bill', language)}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedLegislation;
