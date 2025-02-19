import React from 'react';
import { Form, Input, Select, Label } from 'semantic-ui-react';
import { FormField as IFormField } from '../types/form';

interface FormFieldProps {
  field: IFormField;
  value: string | number | undefined;
  error?: string;
  onChange: (value: string | number) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = field.type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            fluid
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={handleChange}
            error={!!error}
          />
        );

      case 'number':
        return (
          <Input
            fluid
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={handleChange}
            error={!!error}
          />
        );

      case 'select':
        return (
          <Select
            fluid
            placeholder={field.placeholder}
            options={field.options?.map(opt => ({
              key: opt.value,
              text: opt.label,
              value: opt.value,
            })) || []}
            value={value || ''}
            onChange={(_, data) => onChange(data.value as string)}
            error={!!error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Form.Field error={!!error}>
      <label>{field.label}</label>
      {renderField()}
      {error && (
        <Label basic color="red" pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}; 