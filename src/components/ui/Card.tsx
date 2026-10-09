import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'warm' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6'
  }[padding];

  const variantStyles = {
    default: 'bg-white border border-[#E8DDD3] shadow-xs rounded-2xl',
    flat: 'bg-[#FFF9F2] border border-[#E8DDD3]/80 rounded-2xl',
    warm: 'bg-[#F3E7DA]/50 border border-[#E8DDD3] rounded-2xl',
    interactive: 'bg-white border border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-xs hover:shadow-sm transition-all cursor-pointer rounded-2xl active:scale-[0.99]'
  }[variant];

  return (
    <div className={`${variantStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
