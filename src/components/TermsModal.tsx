import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('terms');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setHasScrolledToBottom(isAtBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsAccepted(false);
    }
  }, [isOpen]);

  const handleAccept = () => {
    setIsAccepted(true);
    onAccept();
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {translate("Terms and Conditions", language)}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-gray-900 dark:text-white" />
          </Button>
        </div>

        <div className="border-b dark:border-gray-700">
          <div role="tablist" className="flex">
            <button
              role="tab"
              id="terms-tab"
              aria-selected={activeTab === 'terms'}
              aria-controls="terms-panel"
              className={`px-6 py-3 font-medium ${
                activeTab === 'terms' 
                  ? 'text-kenya-green border-b-2 border-kenya-green' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('terms')}
            >
              {translate("Terms", language)}
            </button>
            <button
              role="tab"
              id="privacy-tab"
              aria-selected={activeTab === 'privacy'}
              aria-controls="privacy-panel"
              className={`px-6 py-3 font-medium ${
                activeTab === 'privacy' 
                  ? 'text-kenya-green border-b-2 border-kenya-green' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              {translate("Privacy", language)}
            </button>
          </div>
        </div>

        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 dark:bg-gray-900"
          onScroll={checkScroll}
          id="terms-content"
        >
          {activeTab === 'terms' && (
            <div role="tabpanel" aria-labelledby="terms-tab">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {translate("CEKA Terms and Conditions", language)}
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>{translate("Effective Date:", language)}</strong> September 10, 2025<br />
                  <strong>{translate("Contact:", language)}</strong> civiceducationkenya@gmail.com
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">1. {translate("Introduction / Agreement to Terms", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("These Terms and Conditions govern your access to and use of the CEKA websites, web applications, mobile applications, services, content, community features, membership program, and related functionality made available by CEKA. By accessing or using the Services you accept and agree to be bound by these Terms.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">2. {translate("Definitions", language)}</h4>
                <ul className="text-sm list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>{translate("Account", language)}</strong> - {translate("an account you create to access member features", language)}</li>
                  <li><strong>{translate("Content", language)}</strong> - {translate("all text, images, audio, video, tutorials, guides, comments, and other materials", language)}</li>
                  <li><strong>{translate("Member / Membership", language)}</strong> - {translate("any user that subscribes to a paid or free tier", language)}</li>
                </ul>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">3. {translate("Scope of Services", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("CEKA provides civic education resources, community forums, curated educational materials, notifications, events, newsletters, volunteer coordination, and related community features. Services may change over time.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">4. {translate("Eligibility and Account Registration", language)}</h4>
                <ul className="text-sm list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>{translate("You must be at least 13 years old to use the Services", language)}</li>
                  <li>{translate("You are responsible for keeping your account credentials secure", language)}</li>
                  <li>{translate("CEKA reserves the right to suspend or terminate accounts for violation of these Terms", language)}</li>
                </ul>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">5. {translate("User Conduct and Community Rules", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("By using the Services you agree not to post content that is unlawful, defamatory, abusive, harassing, threatening, obscene, or invasive of privacy. CEKA retains the right to moderate, edit, refuse, or remove User Content at its discretion.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">6. {translate("Content Ownership and License Grants", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("CEKA and its licensors retain ownership of the Services and all materials CEKA provides. You retain ownership of content you submit but grant CEKA a license to use it within the Services.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">7. {translate("Memberships, Donations, and Payments", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("CEKA may offer membership tiers with specific benefits. All payments are processed by third-party payment processors. Refund policies vary based on donation type and membership status.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">8. {translate("Privacy and Data", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("CEKA's Privacy Policy describes our data collection, use, storage, and retention practices. By using the Services you consent to the collection and use of information in accordance with the Privacy Policy.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">9. {translate("Limitation of Liability", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("To the maximum extent permitted by law, CEKA will not be liable for indirect, incidental, special, consequential, or exemplary damages. The aggregate liability of CEKA will not exceed one hundred U.S. dollars.", language)}
                </p>

                <p className="text-xs text-muted-foreground mt-6">
                  {translate("This is a summary of key terms. Please review the full terms for complete information.", language)}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div role="tabpanel" aria-labelledby="privacy-tab">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {translate("Privacy Policy", language)}
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">1. {translate("Information We Collect", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("We collect information you provide directly to us, such as when you create an account, join our community, or contact us. This may include name, email address, county, and areas of interest.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">2. {translate("How We Use Your Information", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("We use your information to provide and improve our services, communicate with you, personalize your experience, and ensure the security of our community.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">3. {translate("Information Sharing", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("We do not sell your personal information. We may share information with service providers who assist us in operating our services, and when required by law.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">4. {translate("Data Security", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.", language)}
                </p>

                <h4 className="font-semibold mt-4 text-gray-900 dark:text-white">5. {translate("Your Rights", language)}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {translate("You may access, update, or delete your personal information by contacting us at civiceducationkenya@gmail.com.", language)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms-acceptance"
                checked={isAccepted}
                onCheckedChange={(checked) => setIsAccepted(checked as boolean)}
                disabled={!hasScrolledToBottom}
              />
              <label
                htmlFor="terms-acceptance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-white"
              >
                {translate("I have read and agree to the Terms and Conditions", language)}
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {translate("Download", language)}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {translate("Print", language)}
              </Button>
              <Button 
                onClick={handleAccept} 
                disabled={!isAccepted}
                className="bg-kenya-green hover:bg-kenya-green/90"
              >
                <Check className="h-4 w-4 mr-2" />
                {translate("Accept Terms", language)}
              </Button>
            </div>
          </div>
          
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
              {translate("Please scroll to the bottom of the terms to enable acceptance", language)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Checkbox: React.FC<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ id, checked, onCheckedChange, disabled }) => {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      className={`h-4 w-4 rounded border flex items-center justify-center ${
        checked ? 'bg-kenya-green border-kenya-green text-white' : 'border-gray-300 dark:border-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
};

export default TermsModal;
