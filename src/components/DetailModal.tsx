import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, User, Sparkles } from 'lucide-react';
import { TestPlan, TestCase, TestExecution } from '@/types';
import { ExportDropdown } from './ExportDropdown';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TestPlan | TestCase | TestExecution | null;
  type: 'plan' | 'case' | 'execution';
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

export const DetailModal = ({ isOpen, onClose, item, type, onEdit, onDelete }: DetailModalProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset confirmDelete when modal is closed or item changes
  useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [item]);

  if (!item) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete?.(item.id);
      onClose();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'plan': return 'Plano de Teste';
      case 'case': return 'Caso de Teste';
      case 'execution': return 'Execução de Teste';
      default: return '';
    }
  };

  const getItemTitle = () => {
    if (type === 'execution') {
      return `Execução #${item.id.slice(0, 8)}`;
    }
    return (item as TestPlan | TestCase).title;
  };

  const getItemDescription = () => {
    if (type === 'execution') {
      return (item as TestExecution).notes || '';
    }
    return (item as TestPlan | TestCase).description || '';
  };

  const getItemDate = () => {
    if (type === 'execution') {
      return (item as TestExecution).executed_at;
    }
    return (item as TestPlan | TestCase).created_at;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'blocked': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'not_tested': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return '';
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeLabel()} - {getItemTitle()}
            {('generated_by_ai' in item && item.generated_by_ai) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                IA
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {type === 'execution' ? 'Executado em:' : 'Criado em:'} {formatDate(getItemDate())}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              ID do usuário: {item.user_id}
            </div>
          </div>

          {/* Badges de status e prioridade */}
          <div className="flex gap-2 flex-wrap">
            {('status' in item && item.status) && (
              <Badge className={getStatusColor(item.status)}>
                {item.status === 'passed' ? 'Aprovado' : 
                 item.status === 'failed' ? 'Reprovado' :
                 item.status === 'blocked' ? 'Bloqueado' : 'Não Testado'}
              </Badge>
            )}
            {('priority' in item && item.priority) && (
              <Badge className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
            )}
            {('type' in item && item.type) && (
              <Badge variant="outline">
                {item.type}
              </Badge>
            )}
          </div>

          {/* Descrição */}
          {getItemDescription() && (
            <div>
              <h3 className="font-medium mb-2">
                {type === 'execution' ? 'Observações' : 'Descrição'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                {getItemDescription()}
              </p>
            </div>
          )}

          {/* Conteúdo específico por tipo */}
          {type === 'plan' && 'objective' in item && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Objetivo</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.objective}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Escopo</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.scope}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Abordagem</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.approach}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Critérios</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.criteria}</p>
              </div>
            </div>
          )}

          {type === 'case' && 'steps' in item && (
            <div className="space-y-4">
              {item.preconditions && (
                <div>
                  <h3 className="font-medium mb-2">Pré-condições</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.preconditions}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2">Passos</h3>
                <div className="space-y-2">
                  {item.steps?.map((step: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium text-sm">Passo {step.order || index + 1}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Ação:</strong> {step.action}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Resultado esperado:</strong> {step.expected_result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {item.expected_result && (
                <div>
                  <h3 className="font-medium mb-2">Resultado Final Esperado</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.expected_result}</p>
                </div>
              )}
            </div>
          )}

          {type === 'execution' && 'actual_result' in item && (
            <div className="space-y-4">
              {item.actual_result && (
                <div>
                  <h3 className="font-medium mb-2">Resultado Obtido</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.actual_result}</p>
                </div>
              )}

              {item.executed_by && (
                <div>
                  <h3 className="font-medium mb-2">Executado por</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.executed_by}</p>
                </div>
              )}
            </div>
          )}

          {/* Vínculos section */}
          {(type === 'case' || type === 'execution') && (
            <div>
              <h3 className="font-medium mb-2">Vínculos</h3>
              <div className="space-y-2">
                {'plan_id' in item && item.plan_id && (
                  <div className="text-sm">
                    <span className="font-medium">Plano de Teste:</span> {item.plan_id}
                  </div>
                )}
                {type === 'execution' && 'case_id' in item && item.case_id && (
                  <div className="text-sm">
                    <span className="font-medium">Caso de Teste:</span> {item.case_id}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between pt-4 border-t">
            <ExportDropdown item={item} type={type} />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant={confirmDelete ? "destructive" : "outline"}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {confirmDelete ? 'Confirmar Exclusão' : 'Excluir'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
