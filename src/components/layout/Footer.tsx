import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Globe } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const Footer = () => {
  const { language } = useLanguage();
  const nairobiMapUrl = "https://www.google.com/maps/place/Nairobi,+Kenya/@-1.2833099,36.8085756,12z";

  return (
    <footer className="bg-slate-50 dark:bg-[#0A0A0B] py-16 mt-20 border-t border-slate-200 dark:border-white/5 pb-24 md:pb-16">
      <div className="container grid gap-12 md:grid-cols-4 px-6">
        <div className="space-y-6">
          <Logo variant="full" className="h-10 w-auto" />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {translate('Empowering Kenyan citizens with civic knowledge and tools for meaningful participation in national governance.', language)}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com/civicedkenya" target="_blank" className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:text-primary transition-colors shadow-sm"><Facebook className="h-5 w-5" /></a>
            <a href="https://twitter.com/civicedkenya" target="_blank" className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:text-primary transition-colors shadow-sm"><Twitter className="h-5 w-5" /></a>
            <a href="https://instagram.com/civicedkenya" target="_blank" className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:text-primary transition-colors shadow-sm"><Instagram className="h-5 w-5" /></a>
            <a href="https://linktr.ee/civicedkenya" target="_blank" className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:text-primary transition-colors shadow-sm"><Globe className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Discover</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/legislative-tracker" className="hover:text-primary transition-colors">Legislative Tracker</Link></li>
            <li><Link to="/resources" className="hover:text-primary transition-colors">Resource library</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Civic Blog</Link></li>
            <li><Link to="/nasaka-iebc" className="hover:text-primary transition-colors">Nasaka IEBC</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Engage</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/community" className="hover:text-primary transition-colors">Community Hub</Link></li>
            <li><Link to="/calendar" className="hover:text-primary transition-colors">Events Calendar</Link></li>
            <li><Link to="/join-community" className="hover:text-primary transition-colors">Join & Support</Link></li>
            <li><Link to="/shambles" className="hover:text-primary transition-colors">SHAmbles Tracker</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:civiceducationkenya@gmail.com" className="hover:text-primary transition-colors">Email Us Here</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:+254798903333" className="hover:text-primary transition-colors">+254 798 903 333</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <a href={nairobiMapUrl} target="_blank" className="hover:text-primary transition-colors underline-offset-4 decoration-primary/20">Nairobi, Kenya</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-16 pt-8 border-t border-slate-200 dark:border-white/5 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} Civic Education Kenya. Built for the people.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
