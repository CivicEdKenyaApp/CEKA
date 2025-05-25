
import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

// Define the shape of the AuthContext
export interface AuthContextType {
  session: Session | null;
  user: any; // Consider replacing 'any' with a more specific User profile type if available
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
