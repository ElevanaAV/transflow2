'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export default function Breadcrumb({ 
  items, 
  separator = <span className="mx-2 text-gray-400">/</span> 
}: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm font-medium mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && separator}
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-900 font-semibold' : 'text-gray-500'}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}