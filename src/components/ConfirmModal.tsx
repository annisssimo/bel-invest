'use client'

import { AlertCircle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'info' | 'warning' | 'danger'
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  type = 'info'
}: ConfirmModalProps) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconColor: 'text-amber-500',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white'
        }
      case 'danger':
        return {
          iconColor: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      default:
        return {
          iconColor: 'text-blue-500',
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${styles.iconColor}`}>
            <AlertCircle size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
