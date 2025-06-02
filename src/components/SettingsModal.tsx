
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateSettings } = useDashboardSettings();

  const handleQuickActionChange = (value: 'plan' | 'case' | 'execution') => {
    updateSettings({ quickActionType: value });
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'plan': return 'Novo Plano';
      case 'case': return 'Novo Caso';
      case 'execution': return 'Nova Execução';
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-action">Funcionalidade Botão Principal</Label>
                <Select 
                  value={settings.quickActionType} 
                  onValueChange={handleQuickActionChange}
                >
                  <SelectTrigger id="quick-action">
                    <SelectValue placeholder="Selecione a ação principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan">Novo Plano de Teste</SelectItem>
                    <SelectItem value="case">Novo Caso de Teste</SelectItem>
                    <SelectItem value="execution">Nova Execução de Teste</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Define qual tipo de item será criado pelo botão principal do Dashboard.
                  Atualmente: <strong>{getActionLabel(settings.quickActionType)}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
