import { Form } from '../types/form';

const STORAGE_KEY = 'formbuilder_forms';
const DELAY = 1000; 

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, DELAY));
const simulateError = () => Math.random() < 0.1; 

const getForms = (): Form[] => {
  const forms = localStorage.getItem(STORAGE_KEY);
  return forms ? JSON.parse(forms) : [];
};

const saveForms = (forms: Form[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
};

export const api = {
  async createForm(form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> {
    await simulateDelay();
    if (simulateError()) throw new Error('Failed to create form');

    const newForm: Form = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const forms = getForms();
    forms.push(newForm);
    saveForms(forms);
    return newForm;
  },

  async updateForm(formId: string, updates: Partial<Form>): Promise<Form> {
    await simulateDelay();
    if (simulateError()) throw new Error('Failed to update form');

    const forms = getForms();
    const index = forms.findIndex(f => f.id === formId);
    if (index === -1) throw new Error('Form not found');

    const updatedForm = {
      ...forms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    forms[index] = updatedForm;
    saveForms(forms);
    return updatedForm;
  },

  async getForms(): Promise<Form[]> {
    await simulateDelay();
    if (simulateError()) throw new Error('Failed to fetch forms');
    return getForms();
  },

  async getForm(formId: string): Promise<Form> {
    await simulateDelay();
    if (simulateError()) throw new Error('Failed to fetch form');

    const forms = getForms();
    const form = forms.find(f => f.id === formId);
    if (!form) throw new Error('Form not found');
    return form;
  },

  async deleteForm(formId: string): Promise<void> {
    await simulateDelay();
    if (simulateError()) throw new Error('Failed to delete form');

    const forms = getForms();
    const newForms = forms.filter(f => f.id !== formId);
    saveForms(newForms);
  },
}; 