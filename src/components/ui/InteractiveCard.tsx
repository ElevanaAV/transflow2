'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
  isDisabled?: boolean;
  isLoading?: boolean;
  badge?: ReactNode;
  footer?: ReactNode;
}

/**
 * A reusable interactive card component that can be used as a link or a button
 */
export default function InteractiveCard({
  children,
  className,
  href,
  onClick,
  as: Component = 'div',
  isDisabled = false,
  isLoading = false,
  badge,
  footer
}: InteractiveCardProps) {
  const baseClasses = cn(
    "rounded-lg border border-gray-200 shadow-sm p-5 bg-white transition-all",
    !isDisabled && "hover:shadow-md",
    isDisabled && "opacity-70 cursor-not-allowed",
    className
  );

  // Content of the card
  const content = (
    <>
      {badge && (
        <div className="flex justify-end mb-2">
          {badge}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {footer}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}
    </>
  );

  // If it's a link, use Next.js Link component
  if (href && !isDisabled) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  // If it has onClick handler, make it a button
  if (onClick && !isDisabled) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, "text-left w-full")}
        disabled={isDisabled || isLoading}
      >
        {content}
      </button>
    );
  }

  // Otherwise, render it as the specified component (default: div)
  return <Component className={baseClasses}>{content}</Component>;
}