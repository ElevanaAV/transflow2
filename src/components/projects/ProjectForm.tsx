// src/components/projects/ProjectForm.tsx
'use client';

import { useState } from 'react';
import { ProjectFormData } from '@/lib/types';
import Form from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import LanguageDropdown from '@/components/ui/LanguageDropdown';
import { DEFAULT_SOURCE_LANGUAGE, getSupportedLanguages } from '@/lib/languages';

export default function ProjectForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    sourceLanguage: initialData?.sourceLanguage || DEFAULT_SOURCE_LANGUAGE,
    targetLanguages: initialData?.targetLanguages || [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSourceLanguageChange = (value: string) => {
    setFormData(prev => ({ ...prev, sourceLanguage: value }));
    
    // Clear error when field is edited
    if (errors.sourceLanguage) {
      setErrors(prev => ({ ...prev, sourceLanguage: undefined }));
    }
    
    // Remove source language from target languages if it was selected
    if (formData.targetLanguages.includes(value)) {
      setFormData(prev => ({
        ...prev,
        targetLanguages: prev.targetLanguages.filter(lang => lang !== value)
      }));
    }
  };
  
  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    
    // Ensure source language is not included in target languages
    const filteredOptions = selectedOptions.filter(
      lang => lang !== formData.sourceLanguage
    );
    
    setFormData(prev => ({ ...prev, targetLanguages: filteredOptions }));
    
    // Clear error when field is edited
    if (errors.targetLanguages) {
      setErrors(prev => ({ ...prev, targetLanguages: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    if (!formData.sourceLanguage) {
      newErrors.sourceLanguage = 'Source language is required';
    }
    
    if (formData.targetLanguages.length === 0) {
      newErrors.targetLanguages = 'At least one target language is required';
    }
    
    if (formData.targetLanguages.includes(formData.sourceLanguage)) {
      newErrors.targetLanguages = 'Target languages cannot include the source language';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        onSubmit(formData);
      } catch {
        setFormError('An error occurred while submitting the form. Please try again.');
      }
    }
  };

  const cancelButton = onCancel && (
    <Button
      type="button"
      variant="outline"
      onClick={onCancel}
      disabled={isLoading}
    >
      Cancel
    </Button>
  );

  const submitButton = (
    <Button
      type="submit"
      variant="primary"
      className="bg-blue-600 hover:bg-blue-700 text-white"
      isLoading={isLoading}
    >
      {initialData?.name ? 'Update Project' : 'Create Project'}
    </Button>
  );
  
  return (
    <Form 
      onSubmit={handleSubmit} 
      isLoading={isLoading}
      error={formError}
      submitButton={submitButton}
      resetButton={cancelButton}
    >
      <FormInput
        label="Project Name"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter project name"
        disabled={isLoading}
        required
      />
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span className="ml-1 text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter project description"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      <LanguageDropdown
        label="Source Language"
        value={formData.sourceLanguage}
        onChange={handleSourceLanguageChange}
        placeholder="Select source language"
        disabled={isLoading}
        required={true}
        error={errors.sourceLanguage}
      />
      
      <div>
        <label htmlFor="targetLanguages" className="block text-sm font-medium text-gray-700 mb-1">
          Target Languages
          <span className="ml-1 text-red-500">*</span>
        </label>
        <select
          id="targetLanguages"
          name="targetLanguages"
          multiple
          value={formData.targetLanguages}
          onChange={handleTargetLanguageChange}
          className={`block w-full rounded-md border ${errors.targetLanguages ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          size={4}
          disabled={isLoading}
          aria-invalid={!!errors.targetLanguages}
          aria-describedby={errors.targetLanguages ? "targetLanguages-error" : "targetLanguages-help"}
        >
          {/* We'll keep the multi-select for now since LanguageDropdown doesn't support multi-select yet */}
          {/* In the future, we could enhance LanguageDropdown to support multi-select */}
          {/* For now, we're getting the options from our language util instead of hard-coded array */}
          {getSupportedLanguages().filter(language => language.code !== formData.sourceLanguage)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(language => (
              <option key={language.code} value={language.code}>
                {language.name}
                {language.nativeName && language.nativeName !== language.name 
                  ? ` (${language.nativeName})` 
                  : ''}
              </option>
            ))}
        </select>
        <p className="mt-1 text-xs text-gray-500" id="targetLanguages-help">Hold Ctrl/Cmd to select multiple languages</p>
        {errors.targetLanguages && (
          <p className="mt-1 text-sm text-red-600" id="targetLanguages-error">{errors.targetLanguages}</p>
        )}
      </div>
    </Form>
  );
}