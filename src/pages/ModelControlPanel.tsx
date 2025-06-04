import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Edit, Trash2, Plus, Save, RefreshCcw, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AIModel, AIPromptTemplate, AIModelTask, AIModelConfig } from '@/types';
import * as ModelControlService from '@/services/modelControlService';

export const ModelControlPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AIModelConfig | null>(null);
  const [activeTab, setActiveTab] = useState('models');

  // Form states
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelForm, setModelForm] = useState<Partial<AIModel>>({});
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<Partial<AIPromptTemplate>>({});

  // Load configuration
  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      // First load from local storage
      let localConfig = ModelControlService.loadConfig();
      
      // Then try to load from Supabase (if user is authenticated)
      if (user) {
        try {
          const remoteConfig = await ModelControlService.loadMCPConfigFromSupabase(user.id);
          if (remoteConfig) {
            localConfig = remoteConfig;
            // Save to local storage
            ModelControlService.saveConfig(remoteConfig);
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          // Continue with local config
        }
      }
      
      setConfig(localConfig);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfigToSupabase = async () => {
    if (!user || !config) return;
    
    try {
      await ModelControlService.saveMCPConfigToSupabase(user.id, config);
      ModelControlService.saveApiKeys(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config to Supabase:', error);
      alert('Erro ao salvar configurações.');
    }
  };

  // Reset configuration
  const resetConfig = () => {
    if (window.confirm('Tem certeza que deseja redefinir todas as configurações para o padrão?')) {
      const defaultConfig = ModelControlService.resetConfig();
      setConfig(defaultConfig);
    }
  };

  // Model operations
  const startEditingModel = (model: AIModel) => {
    setEditingModelId(model.id);
    setModelForm({ ...model });
  };

  const startAddingModel = () => {
    setEditingModelId('new');
    setModelForm({
      name: '',
      provider: 'gemini',
      description: '',
      version: '1.0',
      capabilities: [],
      active: true,
      settings: {}
    });
  };

  const cancelEditingModel = () => {
    setEditingModelId(null);
    setModelForm({});
  };

  const saveModel = () => {
    if (!config) return;
    
    if (editingModelId === 'new') {
      // Add new model
      const newModel = ModelControlService.addModel(modelForm as Omit<AIModel, 'id'>);
      setConfig({
        ...config,
        models: [...config.models, newModel]
      });
    } else {
      // Update existing model
      const updatedModel = ModelControlService.updateModel(editingModelId!, modelForm);
      if (updatedModel) {
        setConfig({
          ...config,
          models: config.models.map(m => m.id === updatedModel.id ? updatedModel : m)
        });
      }
    }
    
    cancelEditingModel();
  };

  const deleteModel = (modelId: string) => {
    if (!config || !window.confirm('Tem certeza que deseja excluir este modelo?')) return;
    
    const deleted = ModelControlService.deleteModel(modelId);
    if (deleted) {
      setConfig({
        ...config,
        models: config.models.filter(m => m.id !== modelId)
      });
    }
  };

  // Template operations
  const startEditingTemplate = (template: AIPromptTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({ ...template });
  };

  const startAddingTemplate = () => {
    setEditingTemplateId('new');
    setTemplateForm({
      name: '',
      task: 'test-plan-generation',
      template: '',
      description: '',
      parameters: [],
      active: true
    });
  };

  const cancelEditingTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm({});
  };

  const saveTemplate = () => {
    if (!config) return;
    
    if (editingTemplateId === 'new') {
      // Add new template
      const newTemplate = ModelControlService.addPromptTemplate(templateForm as Omit<AIPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>);
      setConfig({
        ...config,
        promptTemplates: [...config.promptTemplates, newTemplate]
      });
    } else {
      // Update existing template
      const updatedTemplate = ModelControlService.updatePromptTemplate(editingTemplateId!, templateForm);
      if (updatedTemplate) {
        setConfig({
          ...config,
          promptTemplates: config.promptTemplates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
        });
      }
    }
    
    cancelEditingTemplate();
  };

  const deleteTemplate = (templateId: string) => {
    if (!config || !window.confirm('Tem certeza que deseja excluir este template?')) return;
    
    const deleted = ModelControlService.deletePromptTemplate(templateId);
    if (deleted) {
      setConfig({
        ...config,
        promptTemplates: config.promptTemplates.filter(t => t.id !== templateId)
      });
    }
  };

  // Set default model for a task
  const setDefaultModelForTask = (task: AIModelTask, modelId: string) => {
    if (!config) return;
    
    ModelControlService.setDefaultModelForTask(task, modelId);
    setConfig({
      ...config,
      tasks: {
        ...config.tasks,
        [task]: modelId
      }
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Model Control Panel</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerenciamento de modelos e templates de IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetConfig} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Redefinir
          </Button>
          <Button onClick={saveConfigToSupabase} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="models" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startAddingModel} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Adicionar Modelo
            </Button>
          </div>

          {config?.models.map(model => (
            <Card key={model.id} className={editingModelId === model.id ? 'border-blue-500' : ''}>
              {editingModelId === model.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model-name">Nome</Label>
                      <Input 
                        id="model-name" 
                        value={modelForm.name || ''}
                        onChange={e => setModelForm({...modelForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model-provider">Provedor</Label>
                      <Select 
                        value={modelForm.provider} 
                        onValueChange={value => setModelForm({...modelForm, provider: value as 'gemini' | 'openai' | 'anthropic' | 'other'})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="model-description">Descrição</Label>
                    <Textarea 
                      id="model-description" 
                      value={modelForm.description || ''}
                      onChange={e => setModelForm({...modelForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model-version">Versão</Label>
                      <Input 
                        id="model-version" 
                        value={modelForm.version || ''}
                        onChange={e => setModelForm({...modelForm, version: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model-api-key">Chave de API</Label>
                      <Input 
                        id="model-api-key" 
                        type="password"
                        value={modelForm.apiKey || ''}
                        onChange={e => setModelForm({...modelForm, apiKey: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="model-active"
                      checked={modelForm.active}
                      onCheckedChange={checked => setModelForm({...modelForm, active: checked})}
                    />
                    <Label htmlFor="model-active">Ativo</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEditingModel}>
                      Cancelar
                    </Button>
                    <Button onClick={saveModel}>
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              ) : (
                // View Mode
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        {model.name}
                        {model.active ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEditingModel(model)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteModel(model.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Provedor</p>
                        <p className="font-medium">{model.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Versão</p>
                        <p className="font-medium">{model.version}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Recursos</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.capabilities.map(capability => (
                          <Badge key={capability} variant="outline">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800">
                    <div className="w-full">
                      <p className="text-sm text-gray-500 mb-2">Tarefas padrão</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(config.tasks)
                          .filter(([_, modelId]) => modelId === model.id)
                          .map(([task]) => (
                            <Badge key={task} className="bg-blue-100 text-blue-800">
                              {task}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Configuração de Tarefas</CardTitle>
              <CardDescription>
                Defina qual modelo será usado para cada tipo de tarefa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config?.tasks || {}).map(([task, modelId]) => (
                <div key={task} className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <Label>{task}</Label>
                  </div>
                  <div className="col-span-2">
                    <Select 
                      value={modelId} 
                      onValueChange={value => setDefaultModelForTask(task as AIModelTask, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.models.filter(m => m.active).map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={startAddingTemplate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Adicionar Template
            </Button>
          </div>

          {config?.promptTemplates.map(template => (
            <Card key={template.id} className={editingTemplateId === template.id ? 'border-blue-500' : ''}>
              {editingTemplateId === template.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Nome</Label>
                      <Input 
                        id="template-name" 
                        value={templateForm.name || ''}
                        onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-task">Tarefa</Label>
                      <Select 
                        value={templateForm.task as string} 
                        onValueChange={value => setTemplateForm({...templateForm, task: value as AIModelTask})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a tarefa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test-plan-generation">Geração de Plano de Teste</SelectItem>
                          <SelectItem value="test-case-generation">Geração de Caso de Teste</SelectItem>
                          <SelectItem value="bug-detection">Detecção de Bugs</SelectItem>
                          <SelectItem value="code-analysis">Análise de Código</SelectItem>
                          <SelectItem value="general-completion">Completar Texto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-description">Descrição</Label>
                    <Textarea 
                      id="template-description" 
                      value={templateForm.description || ''}
                      onChange={e => setTemplateForm({...templateForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-content">Conteúdo do Template</Label>
                    <Textarea 
                      id="template-content" 
                      value={templateForm.template || ''}
                      onChange={e => setTemplateForm({...templateForm, template: e.target.value})}
                      className="min-h-[200px] font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-parameters">Parâmetros (separados por vírgula)</Label>
                    <Input 
                      id="template-parameters" 
                      value={(templateForm.parameters || []).join(', ')}
                      onChange={e => setTemplateForm({
                        ...templateForm, 
                        parameters: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                      })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="template-active"
                      checked={templateForm.active}
                      onCheckedChange={checked => setTemplateForm({...templateForm, active: checked})}
                    />
                    <Label htmlFor="template-active">Ativo</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEditingTemplate}>
                      Cancelar
                    </Button>
                    <Button onClick={saveTemplate}>
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              ) : (
                // View Mode
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.active ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEditingTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Tarefa</p>
                      <Badge className="mt-1">{template.task}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Parâmetros</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.parameters.map(param => (
                          <Badge key={param} variant="outline">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Template</p>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-xs max-h-[200px] overflow-auto whitespace-pre-wrap">
                        {template.template}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500">
                    Criado em: {template.createdAt.toLocaleString()} | 
                    Atualizado em: {template.updatedAt.toLocaleString()}
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}; 