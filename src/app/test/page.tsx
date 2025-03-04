'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageDropdown from '@/components/ui/LanguageDropdown';
import { DEFAULT_SOURCE_LANGUAGE } from '@/lib/languages';

export default function TestPage() {
  const router = useRouter();
  const [language, setLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Navigation Test</h2>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded">
            Home
          </Link>
          <button 
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Projects (useRouter)
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Language Dropdown Test</h2>
        <div className="max-w-md">
          <LanguageDropdown
            label="Test Language"
            value={language}
            onChange={setLanguage}
            placeholder="Select a language"
          />
          <p className="mt-2">Selected: {language}</p>
        </div>
      </div>
    </div>
  );
}