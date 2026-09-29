import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`animate-page-enter w-full transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};
