import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animation-utils";
import { ArrowLeft, BookOpen, Shield, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from "@/lib/utils";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const dateUpdated = "April 28, 2025";

  const sections = [
    {
      id: "introduction",
      title: translate("Introduction", language),
      content: translate(`Welcome to Civic Education Kenya. By accessing or using our services, you agree to be bound by these Terms of Service. Please read these Terms carefully.`, language),
      category: "basics"
    },
    {
      id: "acceptance",
      title: translate("Acceptance of Terms", language),
      content: translate(`By accessing or using our Services, you confirm that you accept these Terms and agree to comply with them. If you do not agree to these Terms, you must not access or use our Services.`, language),
      category: "basics"
    },
    {
      id: "changes",
      title: translate("Changes to Terms", language),
      content: translate(`We may revise these Terms at any time by updating this page. Please check this page regularly to take notice of any changes, as they are binding on you.`, language),
      category: "basics"
    },
    {
      id: "account",
      title: translate("Account Registration", language),
      content: translate(`To access certain features of our Services, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials.`, language),
      category: "account"
    },
    {
      id: "content",
      title: translate("User Content", language),
      content: translate(`Our Services may allow you to upload content. You retain ownership of any intellectual property rights that you hold in that content.`, language),
      category: "content"
    },
    {
      id: "ip",
      title: translate("Intellectual Property", language),
      content: translate(`All content of the Services, including text, graphics, logos, and images, are the property of Civic Education Kenya and are protected by copyright laws.`, language),
      category: "legal"
    },
    {
      id: "prohibited",
      title: translate("Prohibited Activities", language),
      content: translate(`You agree not to:
- Use our Services in any way that violates any applicable laws
- Attempt to interfere with or disrupt our Services
- Engage in any activity that could disable or impair our Services`, language),
      category: "legal"
    },
    {
      id: "termination",
      title: translate("Termination", language),
      content: translate(`We may terminate or suspend your access to our Services immediately, without prior notice, for conduct that we believe violates these Terms.`, language),
      category: "legal"
    },
    {
      id: "disclaimer",
      title: translate("Disclaimer of Warranties", language),
      content: translate(`Our Services are provided "as is" without warranties of any kind. We do not warrant that our Services will be uninterrupted or error-free.`, language),
      category: "legal"
    },
    {
      id: "limitation",
      title: translate("Limitation of Liability", language),
      content: translate(`To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages resulting from your use of our Services.`, language),
      category: "legal"
    },
    {
      id: "governing",
      title: translate("Governing Law", language),
      content: translate(`These Terms are governed by and construed in accordance with the laws of Kenya.`, language),
      category: "legal"
    },
    {
      id: "contact",
      title: translate("Contact Information", language),
      content: translate(`If you have any questions about these Terms, please contact us at civiceducationkenya@gmail.com.`, language),
      category: "basics"
    }
  ];

  const highlights = [
    {
      icon: <Shield className="h-5 w-5 text-kenya-green" />,
      title: translate("Educational Use", language),
      content: translate("Content may be used for educational purposes but not for commercial distribution.", language)
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-kenya-green" />,
      title: translate("Fair Use Policy", language),
      content: translate("Educational content may be used for personal learning and civic education.", language)
    },
    {
      icon: <FileText className="h-5 w-5 text-kenya-green" />,
      title: translate("Content Ownership", language),
      content: translate("You retain rights to your uploaded content while granting us license to use it for service delivery.", language)
    }
  ];

  const filteredSections = activeTab === "all" ? sections : sections.filter(section => section.category === activeTab);

  const CustomAccordionTrigger = ({ children, ...props }: React.ComponentProps<typeof AccordionTrigger>) => (
    <AccordionTrigger {...props} className="py-4 group">
      <div className="flex items-center">
        <motion.span
          className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-kenya-green/10 text-kenya-green group-data-[state=open]:rotate-90"
          animate={{ rotate: props['data-state'] === 'open' ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </motion.span>
        {children}
      </div>
    </AccordionTrigger>
  );

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
            <Button variant="outline" size="sm" onClick={() => navigate("/privacy")}>
              {translate("Privacy Policy", language)}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-serif font-bold flex items-center">
                    <BookOpen className="mr-3 h-6 w-6 text-kenya-green" />
                    {translate("Terms of Service", language)}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {translate("Last updated", language)}: {dateUpdated}
                  </span>
                </div>
                <CardDescription>
                  {translate("Please read these terms carefully before using Civic Education Kenya services", language)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-5 w-full">
                    <TabsTrigger value="all">{translate("All", language)}</TabsTrigger>
                    <TabsTrigger value="basics">{translate("Basics", language)}</TabsTrigger>
                    <TabsTrigger value="account">{translate("Account", language)}</TabsTrigger>
                    <TabsTrigger value="content">{translate("Content", language)}</TabsTrigger>
                    <TabsTrigger value="legal">{translate("Legal", language)}</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-0">
                    <Accordion type="single" collapsible className="w-full">
                      {filteredSections.map((section) => (
                        <AccordionItem key={section.id} value={section.id}>
                          <CustomAccordionTrigger>{section.title}</CustomAccordionTrigger>
                          <AccordionContent>
                            <div className="pl-8 prose dark:prose-invert max-w-none text-muted-foreground">
                              <p>{section.content}</p>
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
                  {translate("By using Civic Education Kenya, you acknowledge that you have read and understand these Terms of Service.", language)}
                </div>
                <div className="md:hidden w-full mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.print()}>
                    {translate("Print Terms", language)}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/privacy")}>
                    {translate("View Privacy Policy", language)}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="md:w-1/4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{translate("Key Highlights", language)}</CardTitle>
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
                <CardTitle className="text-lg">{translate("Need Help?", language)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {translate("If you have any questions about our Terms of Service, please contact our support team.", language)}
                </p>
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/contact")}>
                  {translate("Contact Support", language)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/privacy">
            <Button variant="outline">{translate("View Privacy Policy", language)}</Button>
          </Link>
        </div>
      </motion.div>
    </Layout>
  );
};

export default TermsAndConditions;
