import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { Download, Printer, X, Check } from 'lucide-react';

const TermsConditions = () => {
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
    const content = document.getElementById('terms-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CEKA-Terms-and-Conditions.txt';
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
            {translate("Terms and Conditions", language)}
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
          id="terms-content"
        >
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">
              1. {translate("Agreement to Terms", language)}
            </h2>
            <p className="mb-4">
              {translate("By accessing or using CEKA's services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              2. {translate("Eligibility", language)}
            </h2>
            <p className="mb-4">
              {translate("You must be at least 13 years old to use our services. Users aged 13-18 must have parental permission. You are responsible for maintaining account security and notifying us of unauthorized use.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              3. {translate("Account Registration", language)}
            </h2>
            <p className="mb-4">
              {translate("You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              4. {translate("Community Guidelines", language)}
            </h2>
            <p className="mb-4">
              {translate("As a CEKA community member, you agree to:", language)}
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>{translate("Respect all members and engage in constructive dialogue", language)}</li>
              <li>{translate("Not post unlawful, defamatory, or harmful content", language)}</li>
              <li>{translate("Not impersonate others or misrepresent your affiliation", language)}</li>
              <li>{translate("Not attempt to compromise system security", language)}</li>
              <li>{translate("Not use services for commercial purposes without permission", language)}</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              5. {translate("Intellectual Property", language)}
            </h2>
            <p className="mb-4">
              {translate("CEKA owns or licenses all content on our platforms unless otherwise stated. You retain ownership of your content but grant CEKA a license to use it within our services.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              6. {translate("Donations and Payments", language)}
            </h2>
            <p className="mb-4">
              {translate("Donations are processed by third-party providers. All donations are final unless required by law. Subscription refunds may be considered within 14 days at our discretion.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              7. {translate("Privacy", language)}
            </h2>
            <p className="mb-4">
              {translate("Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our services, you consent to our privacy practices.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              8. {translate("Termination", language)}
            </h2>
            <p className="mb-4">
              {translate("We may suspend or terminate your account for violations of these terms or for activities that harm our community. Termination does not affect any provisions intended to survive.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              9. {translate("Limitation of Liability", language)}
            </h2>
            <p className="mb-4">
              {translate("CEKA's liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from your use of our services.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              10. {translate("Governing Law", language)}
            </h2>
            <p className="mb-4">
              {translate("These terms are governed by the laws of Kenya. Disputes will be resolved in the courts of Nairobi, Kenya.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              11. {translate("Changes to Terms", language)}
            </h2>
            <p className="mb-4">
              {translate("We may update these terms periodically. Continued use after changes constitutes acceptance. We will notify you of significant changes.", language)}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              12. {translate("Contact Information", language)}
            </h2>
            <p className="mb-4">
              {translate("For questions about these terms, contact us at civiceducationkenya@gmail.com", language)}
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
            {translate("I Understand", language)}
          </Button>
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {translate("Scroll to read the complete terms", language)}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default TermsConditions;
