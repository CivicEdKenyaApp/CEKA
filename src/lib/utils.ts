
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Language } from "@/contexts/LanguageContext"
import { translations } from "@/lib/translations"

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

export function translate(text: string, language: Language): string {
  if (!translations[text]) {
    return text;
  }

  return translations[text][language] || text;
}

export { translations }
