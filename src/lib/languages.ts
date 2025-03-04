// src/lib/languages.ts
/**
 * Language configuration for TranslationFlow
 * 
 * This file contains a comprehensive list of languages with their properties.
 * To add Claude support for a new language, simply change 'supported' to true.
 */

export interface Language {
  code: string;            // ISO language code
  name: string;            // English name of the language
  nativeName?: string;     // Name of the language in that language
  direction?: 'ltr' | 'rtl'; // Text direction (defaults to 'ltr')
  supported: boolean;      // Whether Claude supports translation for this language
}

/**
 * Comprehensive list of world languages
 * Languages currently supported by Claude are marked with supported: true
 */
export const languages: Language[] = [
  { code: 'af', name: 'Afrikaans', supported: true },
  { code: 'sq', name: 'Albanian', supported: true },
  { code: 'am', name: 'Amharic', supported: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', supported: true },
  { code: 'hy', name: 'Armenian', supported: true },
  { code: 'as', name: 'Assamese', supported: false },
  { code: 'az', name: 'Azerbaijani', supported: true },
  { code: 'eu', name: 'Basque', supported: true },
  { code: 'be', name: 'Belarusian', supported: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', supported: true },
  { code: 'bs', name: 'Bosnian', supported: true },
  { code: 'bg', name: 'Bulgarian', supported: true },
  { code: 'ca', name: 'Catalan', supported: true },
  { code: 'ceb', name: 'Cebuano', supported: true },
  { code: 'ny', name: 'Chichewa', supported: true },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', supported: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', supported: true },
  { code: 'co', name: 'Corsican', supported: true },
  { code: 'hr', name: 'Croatian', supported: true },
  { code: 'cs', name: 'Czech', supported: true },
  { code: 'da', name: 'Danish', supported: true },
  { code: 'nl', name: 'Dutch', supported: true },
  { code: 'en', name: 'English', supported: true },
  { code: 'eo', name: 'Esperanto', supported: true },
  { code: 'et', name: 'Estonian', supported: true },
  { code: 'ee', name: 'Ewe', supported: false },
  { code: 'tl', name: 'Filipino', supported: true },
  { code: 'fi', name: 'Finnish', supported: true },
  { code: 'fr', name: 'French', supported: true },
  { code: 'fy', name: 'Frisian', supported: true },
  { code: 'gl', name: 'Galician', supported: true },
  { code: 'ka', name: 'Georgian', supported: true },
  { code: 'de', name: 'German', supported: true },
  { code: 'el', name: 'Greek', supported: true },
  { code: 'gu', name: 'Gujarati', supported: true },
  { code: 'ht', name: 'Haitian Creole', supported: true },
  { code: 'ha', name: 'Hausa', supported: true },
  { code: 'haw', name: 'Hawaiian', supported: true },
  { code: 'iw', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', supported: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', supported: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', supported: true },
  { code: 'hmn', name: 'Hmong', supported: true },
  { code: 'hu', name: 'Hungarian', supported: true },
  { code: 'is', name: 'Icelandic', supported: true },
  { code: 'ig', name: 'Igbo', supported: true },
  { code: 'id', name: 'Indonesian', supported: true },
  { code: 'ga', name: 'Irish', supported: true },
  { code: 'it', name: 'Italian', supported: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', supported: true },
  { code: 'jw', name: 'Javanese', supported: true },
  { code: 'kn', name: 'Kannada', supported: true },
  { code: 'kk', name: 'Kazakh', supported: true },
  { code: 'km', name: 'Khmer', supported: true },
  { code: 'rw', name: 'Kinyarwanda', supported: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', supported: true },
  { code: 'ku', name: 'Kurdish (Kurmanji)', supported: true },
  { code: 'ky', name: 'Kyrgyz', supported: true },
  { code: 'lo', name: 'Lao', supported: true },
  { code: 'la', name: 'Latin', supported: true },
  { code: 'lv', name: 'Latvian', supported: true },
  { code: 'lt', name: 'Lithuanian', supported: true },
  { code: 'lb', name: 'Luxembourgish', supported: true },
  { code: 'mk', name: 'Macedonian', supported: true },
  { code: 'mg', name: 'Malagasy', supported: true },
  { code: 'ms', name: 'Malay', supported: true },
  { code: 'ml', name: 'Malayalam', supported: true },
  { code: 'mt', name: 'Maltese', supported: true },
  { code: 'mi', name: 'Maori', supported: true },
  { code: 'mr', name: 'Marathi', supported: true },
  { code: 'mn', name: 'Mongolian', supported: true },
  { code: 'my', name: 'Myanmar (Burmese)', supported: true },
  { code: 'ne', name: 'Nepali', supported: true },
  { code: 'no', name: 'Norwegian', supported: true },
  { code: 'or', name: 'Odia (Oriya)', supported: true },
  { code: 'ps', name: 'Pashto', supported: true },
  { code: 'fa', name: 'Persian', direction: 'rtl', supported: true },
  { code: 'pl', name: 'Polish', supported: true },
  { code: 'pt', name: 'Portuguese', supported: true },
  { code: 'pa', name: 'Punjabi', supported: true },
  { code: 'ro', name: 'Romanian', supported: true },
  { code: 'ru', name: 'Russian', supported: true },
  { code: 'sm', name: 'Samoan', supported: true },
  { code: 'gd', name: 'Scots Gaelic', supported: true },
  { code: 'sr', name: 'Serbian', supported: true },
  { code: 'st', name: 'Sesotho', supported: true },
  { code: 'sn', name: 'Shona', supported: true },
  { code: 'sd', name: 'Sindhi', direction: 'rtl', supported: true },
  { code: 'si', name: 'Sinhala', supported: true },
  { code: 'sk', name: 'Slovak', supported: true },
  { code: 'sl', name: 'Slovenian', supported: true },
  { code: 'so', name: 'Somali', supported: true },
  { code: 'es', name: 'Spanish', supported: true },
  { code: 'su', name: 'Sundanese', supported: true },
  { code: 'sw', name: 'Swahili', supported: true },
  { code: 'sv', name: 'Swedish', supported: true },
  { code: 'tg', name: 'Tajik', supported: true },
  { code: 'ta', name: 'Tamil', supported: true },
  { code: 'tt', name: 'Tatar', supported: true },
  { code: 'te', name: 'Telugu', supported: true },
  { code: 'th', name: 'Thai', supported: true },
  { code: 'tr', name: 'Turkish', supported: true },
  { code: 'tk', name: 'Turkmen', supported: true },
  { code: 'uk', name: 'Ukrainian', supported: true },
  { code: 'ur', name: 'Urdu', direction: 'rtl', supported: true },
  { code: 'ug', name: 'Uyghur', direction: 'rtl', supported: true },
  { code: 'uz', name: 'Uzbek', supported: true },
  { code: 'vi', name: 'Vietnamese', supported: true },
  { code: 'cy', name: 'Welsh', supported: true },
  { code: 'xh', name: 'Xhosa', supported: true },
  { code: 'yi', name: 'Yiddish', direction: 'rtl', supported: true },
  { code: 'yo', name: 'Yoruba', supported: true },
  { code: 'zu', name: 'Zulu', supported: true },
];

/**
 * Get a language object by its code
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(lang => lang.code === code);
};

/**
 * Get all languages that are currently supported
 */
export const getSupportedLanguages = (): Language[] => {
  return languages.filter(lang => lang.supported);
};

/**
 * Get all languages regardless of support status
 */
export const getAllLanguages = (): Language[] => {
  return languages;
};

/**
 * Default source language (English)
 */
export const DEFAULT_SOURCE_LANGUAGE = 'en';

/**
 * Get a default target language
 * Can be customized based on user preferences or region
 */
export const getDefaultTargetLanguage = (): string => {
  return 'es'; // Spanish as default target
};

export default languages;
