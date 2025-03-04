// src/hooks/useFormField.ts
import { useState, useCallback, useEffect } from 'react';

export type Validator<T> = (value: T) => string | null;

/**
 * Hook for managing a form field with validation
 * @param initialValue Initial field value
 * @param validate Validation function returning error message or null if valid
 * @param validateOn When to validate ('change' | 'blur' | 'submit')
 */
export function useFormField<T>(
  initialValue: T,
  validate: Validator<T>,
  validateOn: 'change' | 'blur' | 'submit' | ('change' | 'blur' | 'submit')[] = ['blur', 'submit']
) {
  const [value, setValue] = useState<T>(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Convert validateOn to array if it's a string
  const validateTriggers = Array.isArray(validateOn) ? validateOn : [validateOn];
  
  // Validation function
  const validateValue = useCallback(() => {
    setIsValidating(true);
    const validationError = validate(value);
    setError(validationError);
    setIsValidating(false);
    return validationError === null;
  }, [value, validate]);
  
  // Update value and validate if needed
  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    if (touched && validateTriggers.includes('change')) {
      validateValue();
    }
  }, [touched, validateTriggers, validateValue]);
  
  // Mark as touched and validate on blur if needed
  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateTriggers.includes('blur')) {
      validateValue();
    }
  }, [validateTriggers, validateValue]);
  
  // Reset the field to initial state
  const reset = useCallback((newInitialValue?: T) => {
    setValue(newInitialValue !== undefined ? newInitialValue : initialValue);
    setTouched(false);
    setError(null);
  }, [initialValue]);
  
  // Validate for submission - only called externally
  const validateForSubmit = useCallback(() => {
    setTouched(true);
    return validateValue();
  }, [validateValue]);
  
  // Update value when initialValue changes (careful with this)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return {
    value,
    setValue: handleChange,
    onChange: handleChange,
    onBlur: handleBlur,
    reset,
    validate: validateForSubmit,
    error,
    touched,
    isValidating,
    isValid: touched && error === null,
  };
}

/**
 * Hook for managing a form with multiple fields
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: {
    [K in keyof T]?: Validator<T[K]>;
  }
) {
  // Create a record of field states
  type FieldStates = {
    [K in keyof T]: ReturnType<typeof useFormField<T[K]>>;
  };
  
  // Initialize with empty object
  const fields: Partial<FieldStates> = {};
  
  // Initialize all form fields
  (Object.keys(initialValues) as Array<keyof T>).forEach(key => {
    const validator = validationSchema?.[key] || (() => null);
    fields[key] = useFormField(initialValues[key], validator) as any;
  });
  
  // Get values as a complete object
  const getValues = useCallback(() => {
    return (Object.keys(fields) as Array<keyof T>).reduce((values, key) => {
      values[key] = fields[key]!.value;
      return values;
    }, {} as T);
  }, [fields]);
  
  // Validate all fields
  const validate = useCallback(() => {
    const fieldKeys = Object.keys(fields) as Array<keyof T>;
    const validationResults = fieldKeys.map(key => fields[key]!.validate());
    return validationResults.every(Boolean);
  }, [fields]);
  
  // Reset all fields
  const reset = useCallback((newValues?: Partial<T>) => {
    (Object.keys(fields) as Array<keyof T>).forEach(key => {
      fields[key]!.reset(newValues?.[key]);
    });
  }, [fields]);
  
  // Handle submission
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      const isValid = validate();
      if (isValid) {
        onSubmit(getValues());
      }
    },
    [validate, getValues]
  );
  
  // Return both fields and form methods
  return {
    fields: fields as FieldStates,
    values: getValues(),
    isValid: Object.values(fields).every(field => field.isValid),
    validate,
    reset,
    handleSubmit,
  };
}