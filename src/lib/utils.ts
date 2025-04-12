
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { Language } from "@/contexts/LanguageContext"
import { translate as translateText } from "./translations"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "MMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString // Return the original string if parsing fails
  }
}

// Translation helper function
export function translate(text: string, language: Language): string {
  return translateText(text, language)
}
