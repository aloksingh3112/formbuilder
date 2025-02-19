import { FormField, FormValues } from '../types/form';

export interface ValidationError {
  fieldId: string;
  message: string;
}

export const validateField = (
  field: FormField,
  value: string | number | undefined
): ValidationError | null => {
  if (!field.validations) return null;

  for (const rule of field.validations) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return { fieldId: field.id, message: rule.message };
        }
        break;

      case 'min':
        if (field.type === 'number' && typeof value === 'number' && value < (rule.value as number)) {
          return { fieldId: field.id, message: rule.message };
        }
        if (field.type === 'text' && typeof value === 'string' && value.length < (rule.value as number)) {
          return { fieldId: field.id, message: rule.message };
        }
        break;

      case 'max':
        if (field.type === 'number' && typeof value === 'number' && value > (rule.value as number)) {
          return { fieldId: field.id, message: rule.message };
        }
        if (field.type === 'text' && typeof value === 'string' && value.length > (rule.value as number)) {
          return { fieldId: field.id, message: rule.message };
        }
        break;

      case 'pattern':
        if (
          field.type === 'text' &&
          typeof value === 'string' &&
          !(rule.value as RegExp).test(value)
        ) {
          return { fieldId: field.id, message: rule.message };
        }
        break;
    }
  }

  return null;
};

export const validateForm = (
  fields: FormField[],
  values: FormValues
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const error = validateField(field, values[field.id]);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}; 