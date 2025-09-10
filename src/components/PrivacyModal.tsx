import React, { useState, useRef } from 'react';
import { X, Download, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { language } = useLanguage();
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

  const handleAccept = () => {
    setIsAccepted(true);
    onAccept();
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = document.getElementById('privacy-modal-content')?.innerText || '';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {translate("Privacy Policy", language)}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6"
          onScroll={checkScroll}
          id="privacy-modal-content"
        >
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>{translate("Effective Date:", language)}</strong> September 10, 2025<br />
              <strong>{translate("Contact:", language)}</strong> civiceducationkenya@gmail.com
            </p>

            <h3 className="font-semibold mt-4">{translate("Data Collection", language)}</h3>
            <p className="text-sm">
              {translate("We collect information you provide directly, including name, email, county, and areas of interest. We also collect usage data and technical information to improve our services.", language)}
            </p>

            <h3 className="font-semibold mt-4">{translate("Data Usage", language)}</h3>
            <p className="text-sm">
              {translate("Your information helps us provide civic education services, manage your community membership, communicate updates, and ensure platform security.", language)}
            </p>

            <h3 className="font-semibold mt-4">{translate("Data Sharing", language)}</h3>
            <p className="text-sm">
              {translate("We work with trusted providers like Supabase for data storage and payment processors for donations. We never sell your personal data.", language)}
            </p>

            <h3 className="font-semibold mt-4">{translate("Your Rights", language)}</h3>
            <p className="text-sm">
              {translate("You have the right to access, correct, or delete your personal information. Contact us at civiceducationkenya@gmail.com to exercise these rights.", language)}
            </p>

            <h3 className="font-semibold mt-4">{translate("Data Security", language)}</h3>
            <p className="text-sm">
              {translate("We implement industry-standard security measures including encryption and access controls to protect your information.", language)}
            </p>

            <p className="text-xs text-muted-foreground mt-6">
              {translate("This is a summary of key points. Please review the full policy for complete information.", language)}
            </p>
          </div>
        </div>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy-acceptance"
                checked={isAccepted}
                onCheckedChange={(checked) => setIsAccepted(checked as boolean)}
                disabled={!hasScrolledToBottom}
              />
              <label
                htmlFor="privacy-acceptance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {translate("I have read and understand the Privacy Policy", language)}
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
                {translate("Accept", language)}
              </Button>
            </div>
          </div>
          
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
              {translate("Please scroll to the bottom to enable acceptance", language)}
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
        checked ? 'bg-kenya-green border-kenya-green text-white' : 'border-gray-300'
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

export default PrivacyModal;
