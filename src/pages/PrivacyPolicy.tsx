import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Download, Printer, X, Check } from 'lucide-react';

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setHasScrolledToBottom(isAtBottom);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = document.getElementById('privacy-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CEKA-Privacy-Policy.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {translate("Privacy Policy", language)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("Effective Date:", language)} September 10, 2025 • {translate("Contact:", language)} civiceducationkenya@gmail.com
          </p>
        </div>

        <div 
          ref={contentRef}
          className="border rounded-lg p-6 bg-white shadow-sm overflow-auto mb-6"
          style={{ maxHeight: '60vh' }}
          onScroll={checkScroll}
          id="privacy-content"
        >
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">
              1. {translate("What Personal Data We Collect", language)}
            </h2>
            <p className="mb-4">
              {translate("CEKA collects information you provide directly, including:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Contact information: first name, last name, email address", language)}</li>
              <li>{translate("Profile information: username, county, biography", language)}</li>
              <li>{translate("Areas of interest and community engagement preferences", language)}</li>
              <li>{translate("Payment and donation metadata (processed by third parties)", language)}</li>
              <li>{translate("Consent and acceptance records", language)}</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              2. {translate("How We Use Your Information", language)}
            </h2>
            <p className="mb-4">
              {translate("We use your data to:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Provide and improve our civic education services", language)}</li>
              <li>{translate("Manage your community membership and account", language)}</li>
              <li>{translate("Communicate important updates and information", language)}</li>
              <li>{translate("Process donations and memberships", language)}</li>
              <li>{translate("Ensure security and prevent abuse", language)}</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              3. {translate("Data Sharing and Third Parties", language)}
            </h2>
            <p className="mb-4">
              {translate("We work with trusted service providers:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Supabase: for secure data storage and authentication", language)}</li>
              <li>{translate("Vercel: for application hosting", language)}</li>
              <li>{translate("Email providers: for communications", language)}</li>
              <li>{translate("Payment processors: for donation handling", language)}</li>
            </ul>
            <p className="mb-4">
              {translate("We never sell your personal data. All processors are bound by strict data protection agreements.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              4. {translate("Data Retention", language)}
            </h2>
            <p className="mb-4">
              {translate("We retain your information only as long as necessary:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Account data: while your account is active + 2 years", language)}</li>
              <li>{translate("Payment records: 7 years for legal compliance", language)}</li>
              <li>{translate("Community content: until deletion request", language)}</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              5. {translate("Your Rights", language)}
            </h2>
            <p className="mb-4">
              {translate("Under Kenya's Data Protection Act, you have the right to:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Access your personal information", language)}</li>
              <li>{translate("Correct inaccurate data", language)}</li>
              <li>{translate("Request deletion of your data", language)}</li>
              <li>{translate("Object to processing of your data", language)}</li>
              <li>{translate("Data portability", language)}</li>
            </ul>
            <p className="mb-4">
              {translate("To exercise these rights, contact us at civiceducationkenya@gmail.com", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              6. {translate("Cookies and Tracking", language)}
            </h2>
            <p className="mb-4">
              {translate("We use necessary cookies for site functionality and optional cookies for analytics. You can manage preferences in our cookie settings.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              7. {translate("Data Security", language)}
            </h2>
            <p className="mb-4">
              {translate("We implement industry-standard security measures including encryption, access controls, and regular security reviews to protect your data.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              8. {translate("International Transfers", language)}
            </h2>
            <p className="mb-4">
              {translate("Where data is transferred internationally, we ensure adequate safeguards are in place per Kenyan data protection requirements.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              9. {translate("Changes to This Policy", language)}
            </h2>
            <p className="mb-4">
              {translate("We will notify you of significant changes to this policy. Continued use of our services constitutes acceptance of updated terms.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              10. {translate("Contact Us", language)}
            </h2>
            <p className="mb-4">
              {translate("For privacy concerns or data requests, contact us at civiceducationkenya@gmail.com. You may also lodge complaints with Kenya's Office of the Data Protection Commissioner.", language)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {translate("Download", language)}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {translate("Print", language)}
            </Button>
          </div>
          
          <Button 
            onClick={() => window.history.back()} 
            className="bg-kenya-green hover:bg-kenya-green/90"
          >
            {translate("Back to Safety", language)}
          </Button>
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {translate("Scroll to read the complete policy", language)}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
