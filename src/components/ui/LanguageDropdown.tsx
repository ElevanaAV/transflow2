// src/components/ui/LanguageDropdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { getSupportedLanguages, getLanguageByCode, getAllLanguages, Language } from '@/lib/languages';

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeCodes?: string[]; // Language codes to exclude (e.g., already selected as source)
  showAllLanguages?: boolean; // Whether to show all languages or only supported ones
  required?: boolean; // Whether the field is required (adds asterisk to label)
  error?: string; // Error message to display
}

/**
 * A reusable language dropdown component that:
 * - Shows only supported languages by default
 * - Sorts languages alphabetically
 * - Allows excluding languages (useful for source/target dropdowns)
 * - Shows native language names alongside English names
 * - Provides a note for RTL languages
 */
const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  value,
  onChange,
  label = 'Language',
  placeholder = 'Select a language',
  className = '',
  disabled = false,
  excludeCodes = [],
  showAllLanguages = false,
  required = false,
  error
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // Load languages on component mount or when dependencies change
  useEffect(() => {
    // Get languages based on showAllLanguages prop
    const allLanguagesData = showAllLanguages 
      ? getAllLanguages() 
      : getSupportedLanguages();
    
    // Filter out excluded languages
    const filteredLanguages = allLanguagesData.filter(
      lang => !excludeCodes.includes(lang.code)
    );
    
    // Sort languages alphabetically by name
    const sortedLanguages = filteredLanguages.sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    setLanguages(sortedLanguages);
  }, [excludeCodes, showAllLanguages]);

  // Generate a unique ID for the select element
  const selectId = `language-select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`block w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${className}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
              {language.nativeName && language.nativeName !== language.name 
                ? ` (${language.nativeName})` 
                : ''}
              {!language.supported && showAllLanguages ? ' - Limited support' : ''}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      )}
      
      {/* Show a note for RTL languages */}
      {value && getLanguageByCode(value)?.direction === 'rtl' && (
        <p className="mt-1 text-xs text-amber-600">
          Note: This is a right-to-left language
        </p>
      )}
    </div>
  );
};

export default LanguageDropdown;
