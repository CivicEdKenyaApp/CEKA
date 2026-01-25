
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
<<<<<<< HEAD
import { Language } from "@/contexts/LanguageContext"
import { translations } from "@/lib/translations"
=======
import { format, parseISO } from "date-fns"
import { Language } from "@/contexts/LanguageContext"
import { translate as translateText } from "./translations"
>>>>>>> origin/ceka-app-v5.0.1

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

<<<<<<< HEAD
export function translate(text: string, language: Language): string {
  if (!translations[text]) {
    return text;
  }

  return translations[text][language] || text;
}

export { translations }
=======
// Translation helper function
export function translate(text: string, language: Language): string {
  return translateText(text, language)
}

// Animation variants for reuse
export const animationVariants = {
  // Button hover and tap animations
  button: {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  },
  // Card hover animations
  card: {
    hover: { y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } }
  },
  // List item animations for staggered entries
  listItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  // Container for staggered children animations
  container: {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.04 * i,
      },
    }),
  }
}
>>>>>>> origin/ceka-app-v5.0.1
