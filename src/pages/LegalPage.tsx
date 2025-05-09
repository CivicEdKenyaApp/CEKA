
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LegalPage = () => {
  const location = useLocation();
  const defaultTab = location.pathname === '/terms' ? 'terms' : 'privacy';
  
  const [expandedTermsSection, setExpandedTermsSection] = useState<string | null>(null);
  const [expandedPrivacySection, setExpandedPrivacySection] = useState<string | null>(null);
  
  const toggleTermsSection = (id: string) => {
    setExpandedTermsSection(expandedTermsSection === id ? null : id);
  };
  
  const togglePrivacySection = (id: string) => {
    setExpandedPrivacySection(expandedPrivacySection === id ? null : id);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Legal Information</h1>
          <p className="text-muted-foreground mb-8">
            Our privacy policy and terms of service for using the CEKA platform
          </p>
          
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Policy</CardTitle>
                  <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Introduction</h3>
                    <p>
                      Civic Education Kenya ("CEKA", "we", "our", or "us") is committed to protecting the privacy of our users ("user", "you", or "your"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Platform"). Please read this Privacy Policy carefully. By accessing or using the Platform, you consent to the collection, use, and disclosure of your personal information in accordance with this Privacy Policy.
                    </p>
                  </div>
                  
                  {[
                    {
                      id: 'information-collection',
                      title: 'Information We Collect',
                      content: (
                        <>
                          <p className="mb-2">We may collect information about you in various ways, including:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li><strong>Personal Data:</strong> When you register an account, we collect your name, email address, phone number (optional), and other information you provide during the registration process.</li>
                            <li><strong>Usage Information:</strong> We collect information about how you interact with our Platform, including your browsing history, search queries, features you use, and time spent on the Platform.</li>
                            <li><strong>Device Information:</strong> We may collect information about your mobile device or computer, including device model, operating system, browser type, unique device identifiers, and mobile network information.</li>
                            <li><strong>Location Data:</strong> With your consent, we may collect precise location information from your device to provide location-based services.</li>
                            <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</li>
                          </ul>
                          <p>All personal information that you provide must be true, complete, and accurate, and you must notify us of any changes to such information.</p>
                        </>
                      )
                    },
                    {
                      id: 'information-use',
                      title: 'How We Use Your Information',
                      content: (
                        <>
                          <p className="mb-2">We may use the information we collect for various purposes, including:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>To provide, maintain, and improve our Platform and services</li>
                            <li>To create and maintain your account</li>
                            <li>To process and complete transactions</li>
                            <li>To send you technical notices, updates, security alerts, and administrative messages</li>
                            <li>To respond to your comments, questions, and requests</li>
                            <li>To provide customer support</li>
                            <li>To communicate with you about products, services, offers, promotions, and events</li>
                            <li>To monitor and analyze trends, usage, and activities in connection with our Platform</li>
                            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                            <li>To personalize and improve your experience on our Platform</li>
                            <li>To comply with applicable laws, regulations, and legal processes</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      id: 'information-sharing',
                      title: 'Sharing of Your Information',
                      content: (
                        <>
                          <p className="mb-2">We may share your information in the following situations:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, and other third parties who perform services for us.</li>
                            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
                            <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
                            <li><strong>To Protect Rights:</strong> We may disclose your information to protect and defend the rights, property, or safety of our company, our users, or third parties.</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      id: 'data-security',
                      title: 'Data Security',
                      content: (
                        <>
                          <p>
                            We have implemented appropriate technical and organizational security measures to protect your personal information from accidental loss, unauthorized access, use, alteration, and disclosure. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'data-retention',
                      title: 'Data Retention',
                      content: (
                        <>
                          <p>
                            We will only retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, regulatory, tax, accounting, or reporting requirements. When deciding how long to keep your information, we consider the amount, nature, and sensitivity of the information, the potential risk of harm from unauthorized use or disclosure, and the purposes for which we process the information.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'childrens-privacy',
                      title: 'Children\'s Privacy',
                      content: (
                        <>
                          <p>
                            Our Platform is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us. If we discover that a child under 13 has provided us with personal information, we will promptly delete such information from our servers.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'your-rights',
                      title: 'Your Privacy Rights',
                      content: (
                        <>
                          <p className="mb-2">Depending on your location, you may have certain rights regarding your personal information:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>The right to access personal information we hold about you</li>
                            <li>The right to request correction of inaccurate personal information</li>
                            <li>The right to request deletion of your personal information</li>
                            <li>The right to object to processing of your personal information</li>
                            <li>The right to data portability</li>
                            <li>The right to withdraw consent</li>
                          </ul>
                          <p>
                            If you wish to exercise any of these rights, please contact us using the information provided below. We may ask you to verify your identity before responding to such requests.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'changes-policy',
                      title: 'Changes to this Privacy Policy',
                      content: (
                        <>
                          <p>
                            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. If we make material changes to this Privacy Policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'contact-us',
                      title: 'Contact Us',
                      content: (
                        <>
                          <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                          </p>
                          <p className="mt-2">
                            <strong>Civic Education Kenya</strong><br />
                            Email: civiceducationkenya@gmail.com<br />
                            Phone: +254798903373<br />
                            Address: Nairobi, Kenya
                          </p>
                        </>
                      )
                    }
                  ].map((section) => (
                    <Collapsible
                      key={section.id}
                      open={expandedPrivacySection === section.id}
                      onOpenChange={() => togglePrivacySection(section.id)}
                      className="border rounded-lg px-4"
                    >
                      <CollapsibleTrigger asChild className="w-full">
                        <Button variant="ghost" className="flex w-full justify-between py-4">
                          <h3 className="text-lg font-medium text-left">{section.title}</h3>
                          <ChevronDown className={`h-5 w-5 transition-transform ${expandedPrivacySection === section.id ? 'transform rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pb-4">
                        {section.content}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle>Terms of Service</CardTitle>
                  <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Introduction</h3>
                    <p>
                      These Terms of Service ("Terms") govern your access to and use of the Civic Education Kenya mobile application and website (collectively, the "Platform"). Please read these Terms carefully before using our Platform. By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Platform.
                    </p>
                  </div>
                  
                  {[
                    {
                      id: 'account-registration',
                      title: 'Account Registration and Responsibilities',
                      content: (
                        <>
                          <p className="mb-2">
                            To access certain features of the Platform, you may be required to register for an account. When you register, you agree to:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your account and password</li>
                            <li>Accept responsibility for all activities that occur under your account</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                          </ul>
                          <p>
                            We reserve the right to suspend or terminate your account if we determine, in our sole discretion, that you have violated these Terms or that your account information is inaccurate.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'acceptable-use',
                      title: 'Acceptable Use Policy',
                      content: (
                        <>
                          <p className="mb-2">You agree not to:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>Use the Platform in any way that violates applicable laws or regulations</li>
                            <li>Use the Platform to transmit or distribute harmful or malicious code</li>
                            <li>Attempt to gain unauthorized access to the Platform or related systems</li>
                            <li>Engage in any activity that interferes with or disrupts the Platform</li>
                            <li>Use the Platform to harass, abuse, or harm another person or entity</li>
                            <li>Impersonate or misrepresent your affiliation with any person or entity</li>
                            <li>Use the Platform to collect or store personal data about other users without their consent</li>
                            <li>Post or transmit any content that is unlawful, fraudulent, threatening, abusive, defamatory, obscene, or otherwise objectionable</li>
                          </ul>
                          <p>
                            We reserve the right to remove any content that violates these Terms and to suspend or terminate your access to the Platform.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'user-content',
                      title: 'User Content',
                      content: (
                        <>
                          <p className="mb-2">
                            Our Platform may allow you to post, submit, or share content ("User Content"). By posting User Content, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, copy, modify, create derivative works based on, distribute, publicly display, and otherwise exploit such User Content in connection with the Platform.
                          </p>
                          <p className="mb-2">You represent and warrant that:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>You own the User Content you post or have the necessary rights to post it</li>
                            <li>Your User Content does not violate the privacy, publicity, intellectual property, or other rights of any person or entity</li>
                            <li>Your User Content does not contain any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
                          </ul>
                          <p>
                            We reserve the right to remove any User Content that violates these Terms or that we believe is otherwise harmful to our Platform or users.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'intellectual-property',
                      title: 'Intellectual Property Rights',
                      content: (
                        <>
                          <p className="mb-2">
                            Unless otherwise indicated, the Platform and all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by us or our licensors and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
                          </p>
                          <p className="mb-2">
                            You may not:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 mb-2">
                            <li>Copy, reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from our Platform without our prior written consent</li>
                            <li>Delete or alter any copyright, trademark, or other proprietary notices from any material from our Platform</li>
                            <li>Use any material from our Platform for commercial purposes without our express written consent</li>
                          </ul>
                        </>
                      )
                    },
                    {
                      id: 'third-party-links',
                      title: 'Third-Party Links and Services',
                      content: (
                        <>
                          <p>
                            The Platform may contain links to third-party websites, resources, or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We do not endorse or assume any liability for any third-party sites, information, materials, products, or services. If you access a third-party website from our Platform, you do so at your own risk and acknowledge that these Terms no longer govern your use of such third-party websites or services.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'disclaimer',
                      title: 'Disclaimer of Warranties',
                      content: (
                        <>
                          <p className="mb-2">
                            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                          </p>
                          <p>
                            We do not warrant that: (a) the Platform will function uninterrupted, secure, or available at any particular time or location; (b) any errors or defects will be corrected; (c) the Platform is free of viruses or other harmful components; or (d) the results of using the Platform will meet your requirements.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'limitation-liability',
                      title: 'Limitation of Liability',
                      content: (
                        <>
                          <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES, OR ANY DAMAGES WHATSOEVER INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF USE, DATA, OR PROFITS, ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE OR PERFORMANCE OF THE PLATFORM, WITH THE DELAY OR INABILITY TO USE THE PLATFORM OR RELATED SERVICES, THE PROVISION OF OR FAILURE TO PROVIDE SERVICES, OR FOR ANY INFORMATION, SOFTWARE, PRODUCTS, SERVICES, AND RELATED GRAPHICS OBTAINED THROUGH THE PLATFORM, OR OTHERWISE ARISING OUT OF THE USE OF THE PLATFORM, WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF DAMAGES.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'indemnification',
                      title: 'Indemnification',
                      content: (
                        <>
                          <p>
                            You agree to defend, indemnify, and hold harmless our organization, its officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Platform; (b) your violation of any provision of these Terms; (c) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (d) any claim that your User Content caused damage to a third party. This defense and indemnification obligation will survive these Terms and your use of the Platform.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'governing-law',
                      title: 'Governing Law and Dispute Resolution',
                      content: (
                        <>
                          <p className="mb-2">
                            These Terms shall be governed by and construed in accordance with the laws of Kenya without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                          </p>
                          <p>
                            Any disputes arising out of or relating to these Terms or your use of the Platform shall be resolved through good faith negotiations. If such disputes cannot be resolved through negotiations, they shall be resolved by the courts of Kenya.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'changes-terms',
                      title: 'Changes to Terms',
                      content: (
                        <>
                          <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after those revisions become effective, you agree to be bound by the revised terms.
                          </p>
                        </>
                      )
                    },
                    {
                      id: 'contact-terms',
                      title: 'Contact Us',
                      content: (
                        <>
                          <p>
                            If you have any questions about these Terms, please contact us at:
                          </p>
                          <p className="mt-2">
                            <strong>Civic Education Kenya</strong><br />
                            Email: civiceducationkenya@gmail.com<br />
                            Phone: +254798903373<br />
                            Address: Nairobi, Kenya
                          </p>
                        </>
                      )
                    }
                  ].map((section) => (
                    <Collapsible
                      key={section.id}
                      open={expandedTermsSection === section.id}
                      onOpenChange={() => toggleTermsSection(section.id)}
                      className="border rounded-lg px-4"
                    >
                      <CollapsibleTrigger asChild className="w-full">
                        <Button variant="ghost" className="flex w-full justify-between py-4">
                          <h3 className="text-lg font-medium text-left">{section.title}</h3>
                          <ChevronDown className={`h-5 w-5 transition-transform ${expandedTermsSection === section.id ? 'transform rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pb-4">
                        {section.content}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPage;
