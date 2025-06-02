
import { useState, useEffect } from 'react';

interface AISettings {
  batchGenerationEnabled: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  batchGenerationEnabled: false,
};

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('ai-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar configurações da IA:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('ai-settings', JSON.stringify(updated));
  };

  return { settings, updateSettings };
};
