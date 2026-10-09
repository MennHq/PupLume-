import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBottomSheet?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  isBottomSheet = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2C211B]/40 backdrop-blur-xs transition-opacity"
          />

          {/* Content Sheet / Dialog */}
          <motion.div
            initial={isBottomSheet ? { y: '100%', opacity: 0.8 } : { scale: 0.95, opacity: 0 }}
            animate={isBottomSheet ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={isBottomSheet ? { y: '100%', opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full ${maxWidthClass} bg-white rounded-t-3xl sm:rounded-2xl border border-[#E8DDD3] shadow-xl overflow-hidden max-h-[92vh] flex flex-col`}
          >
            {/* Mobile Grab Bar */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-[#E8DDD3] rounded-full" />
            </div>

            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between px-5 pt-3 sm:pt-5 pb-3 border-b border-[#E8DDD3]/60">
                <div>
                  {title && <h3 className="text-lg font-bold text-[#2C211B] leading-snug">{title}</h3>}
                  {subtitle && <p className="text-xs text-[#766A63] mt-0.5">{subtitle}</p>}
                </div>
                <button
                  id="modal-close-button"
                  onClick={onClose}
                  className="p-2 -mr-2 text-[#766A63] hover:text-[#2C211B] rounded-full hover:bg-[#F3E7DA]/60 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
