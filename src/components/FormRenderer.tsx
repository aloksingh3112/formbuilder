import React, { useState, useCallback } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { FormField } from './FormField';
import { Form as IForm, FormValues } from '../types/form';
import { validateForm, ValidationError } from '../utils/validation';

interface FormRendererProps {
  form: IForm;
  initialValues?: FormValues;
  onSubmit?: (values: FormValues) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  initialValues = {},
  onSubmit,
}) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    const validationErrors = validateForm(form.fields, values);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      onSubmit?.(values);
      setSubmitted(true);
    }
  }, [form.fields, values, onSubmit]);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => prev.filter(error => error.fieldId !== fieldId));
    setSubmitted(false);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      <Form onSubmit={handleSubmit}>
        {form.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors.find(e => e.fieldId === field.id)?.message}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        ))}

        {errors.length > 0 && (
          <Message negative>
            <Message.Header>Please fix the following errors:</Message.Header>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </Message>
        )}

        {submitted && (
          <Message positive>
            <Message.Header>Form submitted successfully!</Message.Header>
            <p>Thank you for your submission.</p>
          </Message>
        )}

        <Button primary type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}; 