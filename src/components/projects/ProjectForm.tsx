// src/components/projects/ProjectForm.tsx
'use client';

import { useState } from 'react';
import { ProjectFormData } from '@/lib/types';
import Form from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import LanguageDropdown from '@/components/ui/LanguageDropdown';
import { DEFAULT_SOURCE_LANGUAGE, getSupportedLanguages } from '@/lib/languages';

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

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
    targetLanguage: initialData?.targetLanguage || '',
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
    
    // Reset target language if it's the same as source language
    if (formData.targetLanguage === value) {
      setFormData(prev => ({
        ...prev,
        targetLanguage: ''
      }));
    }
  };
  
  const handleTargetLanguageChange = (value: string) => {
    // Ensure source language is not selected as target language
    if (value !== formData.sourceLanguage) {
      setFormData(prev => ({ ...prev, targetLanguage: value }));
    }
    
    // Clear error when field is edited
    if (errors.targetLanguage) {
      setErrors(prev => ({ ...prev, targetLanguage: undefined }));
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
    
    if (!formData.targetLanguage) {
      newErrors.targetLanguage = 'Target language is required';
    }
    
    if (formData.targetLanguage === formData.sourceLanguage) {
      newErrors.targetLanguage = 'Target language cannot be the same as source language';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Form submitted, validating...");
    
    if (validateForm()) {
      console.log("Form validation passed, submitting data:", formData);
      try {
        // Use a setTimeout to ensure the function runs outside the current event loop
        setTimeout(() => {
          try {
            onSubmit(formData);
          } catch (error) {
            console.error("Error in submit handler:", error);
            setFormError('An error occurred while submitting the form. Please try again.');
          }
        }, 10);
      } catch (error) {
        console.error("Error scheduling form submission:", error);
        setFormError('An error occurred while submitting the form. Please try again.');
      }
    } else {
      console.log("Form validation failed");
    }
    
    // Return false to prevent default form submission
    return false;
  };

  const cancelButton = onCancel && (
    <Button
      type="button"
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Cancel button clicked");
        // Try to prevent default on form
        try {
          if (e.target && e.target instanceof HTMLElement) {
            const form = e.target.closest('form');
            if (form) {
              form.onsubmit = (e) => {
                e.preventDefault();
                return false;
              };
            }
          }
        } catch (err) {
          console.error("Error preventing form submission:", err);
        }
        
        // Execute the cancel function with a timeout to ensure it runs
        setTimeout(() => {
          try {
            onCancel();
          } catch (err) {
            console.error("Error in cancel handler:", err);
            // Direct navigation fallback
            window.location.href = '/projects/overview';
          }
        }, 10);
      }}
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
      onClick={(e) => {
        // Add a click handler as an additional way to trigger the form submission
        // This helps with some mobile browsers and Edge cases
        if (!isLoading) {
          console.log("Submit button clicked directly");
          e.preventDefault();
          handleSubmit(e);
        }
      }}
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
      
      {/* Keep using the original select for now to maintain compatibility */}
      <div>
        <label htmlFor="targetLanguages" className="block text-sm font-medium text-gray-700 mb-1">
          Target Language
          <span className="ml-1 text-red-500">*</span>
        </label>
        <select
          id="targetLanguages"
          name="targetLanguages"
          value={formData.targetLanguage || ''}
          onChange={(e) => handleTargetLanguageChange(e.target.value)}
          className={`block w-full rounded-md border ${errors.targetLanguage ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={isLoading}
          aria-invalid={!!errors.targetLanguage}
        >
          <option value="" disabled>Select target language</option>
          {getSupportedLanguages()
            .filter(language => language.code !== formData.sourceLanguage)
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
        {errors.targetLanguage && (
          <p className="mt-1 text-sm text-red-600">{errors.targetLanguage}</p>
        )}
      </div>
    </Form>
  );
}