export type FieldType = 'text' | 'number' | 'select';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: string | number;
  options?: { label: string; value: string }[]; // For select fields
  validations?: ValidationRule[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormValues {
  [key: string]: string | number | undefined;
} 