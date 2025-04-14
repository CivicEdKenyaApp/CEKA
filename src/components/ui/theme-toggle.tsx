
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { motion } from "framer-motion"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translate } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { language } = useLanguage()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative"
      aria-label={translate("Toggle theme", language)}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: isAnimating ? [1, 0.8, 1] : 1,
          rotate: isAnimating ? [0, 180, 360] : 0
        }}
        transition={{ duration: 0.5 }}
      >
        {theme === "light" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
      <span className="sr-only">{translate("Toggle theme", language)}</span>
    </Button>
  )
}
