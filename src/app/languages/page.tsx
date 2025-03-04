// src/app/languages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthGuard from '@/components/auth/AuthGuard';

const LANGUAGES = [
  { code: 'en', name: 'English', isCommon: true },
  { code: 'es', name: 'Spanish', isCommon: true },
  { code: 'fr', name: 'French', isCommon: true },
  { code: 'de', name: 'German', isCommon: true },
  { code: 'it', name: 'Italian', isCommon: true },
  { code: 'pt', name: 'Portuguese', isCommon: true },
  { code: 'ru', name: 'Russian', isCommon: true },
  { code: 'zh', name: 'Chinese', isCommon: true },
  { code: 'ja', name: 'Japanese', isCommon: true },
  { code: 'ko', name: 'Korean', isCommon: true },
  { code: 'ar', name: 'Arabic', isCommon: true },
  { code: 'hi', name: 'Hindi', isCommon: true },
  { code: 'bn', name: 'Bengali', isCommon: false },
  { code: 'nl', name: 'Dutch', isCommon: false },
  { code: 'sv', name: 'Swedish', isCommon: false },
  { code: 'pl', name: 'Polish', isCommon: false },
  { code: 'tr', name: 'Turkish', isCommon: false },
  { code: 'uk', name: 'Ukrainian', isCommon: false },
  { code: 'vi', name: 'Vietnamese', isCommon: false },
  { code: 'th', name: 'Thai', isCommon: false },
  { code: 'id', name: 'Indonesian', isCommon: false },
  { code: 'ms', name: 'Malay', isCommon: false },
  { code: 'fa', name: 'Persian', isCommon: false },
  { code: 'he', name: 'Hebrew', isCommon: false },
  { code: 'ur', name: 'Urdu', isCommon: false },
  { code: 'el', name: 'Greek', isCommon: false },
  { code: 'cs', name: 'Czech', isCommon: false },
  { code: 'hu', name: 'Hungarian', isCommon: false },
  { code: 'ro', name: 'Romanian', isCommon: false },
  { code: 'fi', name: 'Finnish', isCommon: false },
  { code: 'da', name: 'Danish', isCommon: false },
  { code: 'no', name: 'Norwegian', isCommon: false },
];

type Language = {
  code: string;
  name: string;
  isCommon: boolean;
};

export default function LanguagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGES);
  const [isLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Filter languages based on search query
    const filtered = LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLanguages(filtered);
  }, [searchQuery]);

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const handleSavePreferences = () => {
    // In a real app, you would save the selected languages to the user's profile
    console.log('Saving language preferences:', selectedLanguages);
    router.push('/dashboard');
  };

  const LanguageCard = ({ language }: { language: Language }) => (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selectedLanguages.includes(language.code)
          ? 'border-primary-500 bg-primary-50 shadow'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => handleLanguageToggle(language.code)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{language.name}</h3>
          <p className="text-sm text-gray-500">{language.code.toUpperCase()}</p>
        </div>
        <div
          className={`w-5 h-5 border rounded-full flex items-center justify-center ${
            selectedLanguages.includes(language.code)
              ? 'bg-primary border-primary'
              : 'border-gray-300'
          }`}
        >
          {selectedLanguages.includes(language.code) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Languages</h1>
          <p className="text-gray-600">
            Select the languages you work with for translation projects.
          </p>
        </div>

        {/* Search box */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Common languages section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Common Languages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLanguages
                  .filter((lang) => lang.isCommon)
                  .map((language) => (
                    <LanguageCard key={language.code} language={language} />
                  ))}
              </div>
            </div>

            {/* Other languages section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Other Languages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLanguages
                  .filter((lang) => !lang.isCommon)
                  .map((language) => (
                    <LanguageCard key={language.code} language={language} />
                  ))}
              </div>
            </div>

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}