'use client';

import { useState, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useFormValidation = (initialData: any, validationRules: { [key: string]: ValidationRule }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value === '')) {
      return 'Ce champ est obligatoire';
    }

    // Skip other validations if value is empty and not required
    if (!value || value === '') return null;

    // Min validation
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      return `La valeur doit être supérieure ou égale à ${rule.min}`;
    }

    // Max validation
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      return `La valeur doit être inférieure ou égale à ${rule.max}`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return 'Format invalide';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validateForm = (data: any): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  };

  const validateSingleField = (name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    return error === null;
  };

  const clearError = (name: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  useEffect(() => {
    const newErrors = validateForm(initialData);
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [initialData, validationRules]);

  return {
    errors,
    isValid,
    validateField: validateSingleField,
    validateForm,
    clearError,
    clearAllErrors,
  };
};

// Composant pour afficher les erreurs
export const FieldError = ({ error }: { error: string | null }) => {
  if (!error) return null;
  
  return (
    <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </div>
  );
};

// Composant d'input avec validation
interface ValidatedInputProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string | null;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const ValidatedInput = ({
  name,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  min,
  max,
  step,
  className = 'input',
  disabled = false,
}: ValidatedInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? 
      (e.target.value === '' ? '' : Number(e.target.value)) : 
      e.target.value;
    onChange(newValue);
  };

  return (
    <div>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`${className} ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        disabled={disabled}
      />
      <FieldError error={error} />
    </div>
  );
};

// Composant de select avec validation
interface ValidatedSelectProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ValidatedSelect = ({
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
  placeholder = 'Sélectionner...',
  className = 'input',
  disabled = false,
}: ValidatedSelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <select
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        className={`${className} ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError error={error} />
    </div>
  );
};
