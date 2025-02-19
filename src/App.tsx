import  { useState, useEffect } from 'react';
import { Container, Menu, Loader, Message, Header, Segment, Icon, Divider } from 'semantic-ui-react';
import { FormBuilder } from './components/FormBuilder';
import { FormRenderer } from './components/FormRenderer';
import { Form } from './types/form';
import { api } from './services/api';

type View = 'list' | 'builder' | 'preview';

function App() {
  const [view, setView] = useState<View>('list');
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const loadedForms = await api.getForms();
      setForms(loadedForms);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setSelectedForm(null);
    setView('builder');
  };

  const handleFormSave = (form: Form) => {
    setForms(prev => {
      const index = prev.findIndex(f => f.id === form.id);
      if (index >= 0) {
        return prev.map(f => f.id === form.id ? form : f);
      }
      return [...prev, form];
    });
    
    setSelectedForm(form);
    
    setView('list');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader active>Loading</Loader>
        </div>
      );
    }

    if (error) {
      return (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      );
    }

    switch (view) {
      case 'list':
        return (
          <div>
            <Segment basic>
              <Header as="h2" className="flex justify-between items-center">
                <div>
                  <Icon name="list alternate outline" />
                  <Header.Content>
                    My Forms
                    <Header.Subheader>Manage your forms</Header.Subheader>
                  </Header.Content>
                </div>
                <button
                  className="bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-1.5 rounded-full flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  onClick={handleCreateForm}
                >
                  <Icon name="plus circle" />
                  Create New Form
                </button>
              </Header>
            </Segment>
            <Divider />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.map(form => (
                <div key={form.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{form.title}</h3>
                    <p className="text-gray-600 mb-4 h-12 overflow-hidden">{form.description}</p>
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-white border border-blue-500 text-blue-500 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 text-sm"
                        onClick={() => {
                          setSelectedForm(form);
                          setView('builder');
                        }}
                      >
                        <Icon name="edit outline" />
                        Edit
                      </button>
                      <button
                        className="flex-1 bg-white border border-green-500 text-green-500 px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors flex items-center justify-center gap-1 text-sm"
                        onClick={() => {
                          setSelectedForm(form);
                          setView('preview');
                        }}
                      >
                        <Icon name="eye" />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'builder':
        return (
          <div>
            <Segment basic>
              <Header as="h2">
                <Icon name={selectedForm ? 'edit' : 'plus'} />
                <Header.Content>
                  {selectedForm ? 'Edit Form' : 'Create New Form'}
                  <Header.Subheader>
                    {selectedForm ? 'Modify your existing form' : 'Design your new form'}
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Segment>
            <Divider />
            <FormBuilder
              initialForm={selectedForm || undefined}
              onSave={handleFormSave}
            />
          </div>
        );

      case 'preview':
        return selectedForm ? (
          <div>
            <Segment basic>
              <Header as="h2">
                <Icon name="eye" />
                <Header.Content>
                  Preview Form
                  <Header.Subheader>Test how your form looks and works</Header.Subheader>
                </Header.Content>
              </Header>
            </Segment>
            <Divider />
            <FormRenderer
              form={selectedForm}
              onSubmit={values => {
                console.log('Form submitted with values:', values);
              }}
            />
          </div>
        ) : null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Container>
          <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
              <Icon name="wpforms" size="huge" />
              <div>
                <h1 className="text-3xl font-bold mb-2">Form Builder</h1>
                <p className="text-blue-100">Create, manage, and share your forms easily</p>
              </div>
            </div>
            <Menu secondary inverted>
              <Menu.Item
                active={view === 'list'}
                onClick={() => setView('list')}
              >
                <Icon name="list" />
                My Forms
              </Menu.Item>
              <Menu.Item
                active={view === 'builder' && !selectedForm}
                onClick={handleCreateForm}
              >
                <Icon name="plus" />
                Create Form
              </Menu.Item>
            </Menu>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {renderContent()}
      </Container>
    </div>
  );
}

export default App;
