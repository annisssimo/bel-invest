'use client'

import { MessageCircle, Youtube, Send } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-4 mt-8">
      <div className="container mx-auto px-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left side - Copyright */}
          <div className="text-xs mb-2 md:mb-0">
            {currentYear} © Bel Invest
          </div>

          {/* Center - Social links */}
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <Send size={12} />
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={12} />
            </a>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-3 text-xs">
            <a 
              href="#" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              Поддержка
            </a>
            <a 
              href="#" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              Условия
            </a>
            <a 
              href="#" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              Безопасность
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
