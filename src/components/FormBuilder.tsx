import React, { useState, useCallback } from 'react';
import { Button, Form, Message, Icon, Segment, Divider } from 'semantic-ui-react';
import { FormField } from './FormField';
import { Form as IForm, FormField as IFormField, FieldType } from '../types/form';
import { api } from '../services/api';
import { validateForm, ValidationError } from '../utils/validation';

interface FormBuilderProps {
  initialForm?: IForm;
  onSave?: (form: IForm) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave }) => {
  const [form, setForm] = useState<IForm>(() => initialForm || {
    id: '',
    title: '',
    description: '',
    fields: [],
    createdAt: '',
    updatedAt: '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isFormValid = form.title.trim() !== '' && form.fields.length > 0;

  const validateAndSaveForm = async () => {
    if (!isFormValid) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    try {
      const savedForm = form.id
        ? await api.updateForm(form.id, form)
        : await api.createForm(form);
      
      setForm(savedForm);
      setLastSaved(new Date());
      onSave?.(savedForm);
      return true;
    } catch (error) {
      setSaveError((error as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: FieldType) => {
    const newField: IFormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}`,
      validations: type === 'select' ? undefined : [
        { type: 'required', message: 'This field is required' }
      ],
    };

    if (type === 'select') {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
    }

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (fieldId: string, updates: Partial<IFormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateAndSaveForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form loading={saving} onSubmit={handleSubmit}>
        <Segment>
          <div className="space-y-4">
            <Form.Input
              fluid
              required
              label="Form Title"
              placeholder="Enter form title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              error={errors.some(e => e.fieldId === 'title') ? 'Title is required' : false}
              className="mb-4"
            />

            <Form.TextArea
              label="Description"
              placeholder="Enter form description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value as string }))}
              className="mb-4"
            />
          </div>
        </Segment>

        <Segment>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Form Fields</h3>
            <div className="flex gap-2">
              <Button
                size="small"
                color="blue"
                basic
                onClick={() => addField('text')}
                className="shadow-sm"
                type='button'
              >
                <Icon name="font" />
                Text
              </Button>
              <Button
                size="small"
                color="green"
                basic
                onClick={() => addField('number')}
                className="shadow-sm"
                type='button'
              >
                <Icon name="hashtag" />
                Number
              </Button>
              <Button
                size="small"
                color="purple"
                basic
                onClick={() => addField('select')}
                className="shadow-sm"
                type='button'
              >
                <Icon name="list ul" />
                Select
              </Button>
            </div>
          </div>

          <Divider />

          {form.fields.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="plus circle" size="huge" className="text-gray-300 mb-4" />
              <p className="text-gray-500">Add your first form field by clicking one of the buttons above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <Segment key={field.id} className="!p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        {index + 1}
                      </div>
                      <h4 className="text-md font-medium text-gray-700 mt-0">
                        {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
                      </h4>
                    </div>
                    <Button
                      icon
                      negative
                      size="tiny"
                      onClick={() => removeField(field.id)}
                      className="!p-2"
                    >
                      <Icon name="trash alternate outline" />
                    </Button>
                  </div>

                  <Form.Input
                    fluid
                    label="Field Label"
                    placeholder="Enter field label"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="mb-3"
                  />

                  <Form.Input
                    fluid
                    label="Placeholder"
                    placeholder="Enter placeholder text"
                    value={field.placeholder}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  />

                  {field.type === 'select' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      <div className="space-y-2">
                        {field.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Form.Input
                              placeholder="Label"
                              value={option.label}
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[index] = { ...option, label: e.target.value };
                                updateField(field.id, { options: newOptions });
                              }}
                            />
                            <Form.Input
                              placeholder="Value"
                              value={option.value}
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[index] = { ...option, value: e.target.value };
                                updateField(field.id, { options: newOptions });
                              }}
                            />
                            <Button
                              icon
                              negative
                              size="tiny"
                              onClick={() => {
                                const newOptions = field.options?.filter((_, i) => i !== index);
                                updateField(field.id, { options: newOptions });
                              }}
                              type='button'
                            >
                              <Icon name="trash alternate outline" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="small"
                          basic
                          onClick={() => {
                            const newOptions = [...(field.options || []), { label: '', value: '' }];
                            updateField(field.id, { options: newOptions });
                          }}
                          type='button'
                        >
                          <Icon name="plus" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </Segment>
              ))}
            </div>
          )}
        </Segment>

        <div className="mt-6 flex items-center justify-between">
          <Button
            primary
            size="large"
            onClick={() => validateAndSaveForm()}
            loading={saving}
            disabled={!isFormValid || saving}
            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Icon name="save outline" />
            Save Form
          </Button>

          <div className="flex-1 ml-4">
            {saveError && (
              <Message negative>
                <Message.Header>Error saving form</Message.Header>
                <p>{saveError}</p>
              </Message>
            )}

            {lastSaved && !saveError && (
              <Message positive>
                <Message.Header>Form Saved Successfully!</Message.Header>
                <p>Last saved: {lastSaved.toLocaleTimeString()}</p>
              </Message>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}; 