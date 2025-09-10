import React, { useState } from "react";
import MainLayout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animation-utils";
import { ArrowLeft, ChevronRight, Shield, Search, ThumbsUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from "@/lib/utils";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const dateUpdated = "April 28, 2025";

  const sections = [
    {
      id: "introduction",
      title: translate("Introduction", language),
      content: translate(`At Civic Education Kenya, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.`, language),
      category: "basics"
    },
    {
      id: "information",
      title: translate("Information We Collect", language),
      content: translate(`We may collect information about you in a variety of ways:
• Personal Data: Name, email address, phone number
• Usage Data: Information about how you access and use our Services
• Device Data: Information about your device and internet connection`, language),
      category: "data"
    },
    {
      id: "how-we-use",
      title: translate("How We Use Your Information", language),
      content: translate(`We may use the information we collect about you for various purposes:
• To provide and maintain our Services
• To improve our Services and develop new features
• To communicate with you regarding updates and support
• To monitor and analyze usage patterns
• To prevent fraudulent activities and enhance security`, language),
      category: "data"
    },
    {
      id: "disclosure",
      title: translate("Disclosure of Your Information", language),
      content: translate(`We may share information we have collected about you in certain situations:
• With Service Providers: We may share your information with third-party vendors who perform services on our behalf
• For Legal Compliance: We may disclose your information to comply with applicable laws and regulations`, language),
      category: "sharing"
    },
    {
      id: "security",
      title: translate("Security of Your Information", language),
      content: translate(`We use administrative, technical, and physical security measures to protect your personal information. However, no data transmission over the Internet is 100% secure, so we cannot guarantee absolute security.`, language),
      category: "security"
    },
    {
      id: "rights",
      title: translate("Your Privacy Rights", language),
      content: translate(`Depending on your location, you may have certain rights regarding your personal information:
• Right to access and receive a copy of your personal information
• Right to rectify or update your personal information
• Right to request deletion of your personal information`, language),
      category: "rights"
    },
    {
      id: "cookies",
      title: translate("Cookies and Tracking", language),
      content: translate(`We may use cookies and similar technologies to enhance your experience with our Services. You can choose to disable cookies through your browser settings, but this may affect the functionality of our Services.`, language),
      category: "tracking"
    },
    {
      id: "changes",
      title: translate("Changes to This Policy", language),
      content: translate(`We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.`, language),
      category: "basics"
    },
    {
      id: "contact",
      title: translate("Contact Us", language),
      content: translate(`If you have questions or concerns about this Privacy Policy, please contact us at civiceducationkenya@gmail.com.`, language),
      category: "basics"
    }
  ];

  const highlights = [
    {
      icon: <Shield className="h-5 w-5 text-kenya-green" />,
      title: translate("Data Protection", language),
      content: translate("We implement robust security measures to protect your personal data.", language)
    },
    {
      icon: <ThumbsUp className="h-5 w-5 text-kenya-green" />,
      title: translate("No Data Selling", language),
      content: translate("We never sell your personal information to third parties.", language)
    },
    {
      icon: <Search className="h-5 w-5 text-kenya-green" />,
      title: translate("Transparency", language),
      content: translate("You can request access to the data we hold about you at any time.", language)
    }
  ];

  const filteredSections = activeTab === "all" ? sections : sections.filter(section => section.category === activeTab);

  return (
    <Layout>
      <motion.div className="container max-w-4xl py-8 px-4" {...pageTransition}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translate("Back", language)}
          </Button>
          <div className="ml-auto space-x-2 hidden md:block">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              {translate("Print", language)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/terms")}>
              {translate("Terms of Service", language)}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-serif font-bold flex items-center">
                    <Lock className="mr-3 h-6 w-6 text-kenya-green" />
                    {translate("Privacy Policy", language)}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {translate("Last updated", language)}: {dateUpdated}
                  </span>
                </div>
                <CardDescription>
                  {translate("Learn how we collect, use, and protect your personal information", language)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-6 w-full">
                    <TabsTrigger value="all">{translate("All", language)}</TabsTrigger>
                    <TabsTrigger value="basics">{translate("Basics", language)}</TabsTrigger>
                    <TabsTrigger value="data">{translate("Data", language)}</TabsTrigger>
                    <TabsTrigger value="sharing">{translate("Sharing", language)}</TabsTrigger>
                    <TabsTrigger value="security">{translate("Security", language)}</TabsTrigger>
                    <TabsTrigger value="rights">{translate("Rights", language)}</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {filteredSections.map((section) => (
                        <AccordionItem key={section.id} value={section.id}>
                          <AccordionTrigger className="py-4">
                            <div className="flex items-center">
                              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-kenya-green/10 text-kenya-green">
                                <ChevronRight className="h-3 w-3" />
                              </span>
                              {section.title}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-8 prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                              {section.content}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex-col space-y-2 items-start">
                <div className="text-sm text-muted-foreground italic">
                  {translate("By using Civic Education Kenya, you acknowledge that you have read and understand this Privacy Policy.", language)}
                </div>
                <div className="md:hidden w-full mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.print()}>
                    {translate("Print Policy", language)}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/terms")}>
                    {translate("View Terms of Service", language)}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="md:w-1/4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{translate("Key Commitments", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {highlight.icon}
                      <h3 className="font-medium">{highlight.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">{highlight.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{translate("Your Data Rights", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {translate("You have the right to request access to, correction, or deletion of your data at any time.", language)}
                </p>
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/contact")}>
                  {translate("Request Your Data", language)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/terms">
            <Button variant="outline">{translate("View Terms of Service", language)}</Button>
          </Link>
        </div>
      </motion.div>
    </Layout>
  );
};

export default PrivacyPolicy;
