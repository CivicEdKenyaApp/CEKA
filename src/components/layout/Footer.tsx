import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-muted py-8 mt-12">
      <div className="container grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo variant="full" />
          <p className="text-sm text-muted-foreground">
            Empowering Kenyan citizens with civic knowledge and tools for meaningful participation.
          </p>
          <div className="flex items-center space-x-3">
            <a href="https://www.facebook.com/profile.php?id=61561994025207" target="_blank" rel="noopener noreferrer" className="hover:text-kenya-green text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://x.com/civicedkenya" target="_blank" rel="noopener noreferrer" className="hover:text-kenya-green text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://www.instagram.com/civiceducationke/" target="_blank" rel="noopener noreferrer" className="hover:text-kenya-green text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-base mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-kenya-green">Home</Link></li>
            <li><Link to="/legislative-tracker" className="hover:text-kenya-green">Legislative Tracker</Link></li>
            <li><Link to="/resources" className="hover:text-kenya-green">Resource Hub</Link></li>
            <li><Link to="/community" className="hover:text-kenya-green">Community</Link></li>
            <li><Link to="/volunteer" className="hover:text-kenya-green">Volunteer</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-base mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/resources/type/constitution" className="hover:text-kenya-green">Constitution</Link></li>
            <li><Link to="/resources/type/infographic" className="hover:text-kenya-green">Infographics</Link></li>
            <li><Link to="/resources/type/video" className="hover:text-kenya-green">Videos</Link></li>
            <li><Link to="/resources/type/document" className="hover:text-kenya-green">Documents</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-base mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>info@civiceducationkenya.org</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+254 700 000 000</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Nairobi, Kenya</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mt-8 pt-4 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Civic Education Kenya. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-kenya-green">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-kenya-green">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
