
const GEMINI_API_KEY = 'your-gemini-api-key'; // Usuário precisa configurar

export interface AIPromptRequest {
  context: string;
  type: 'test_plan' | 'test_case' | 'test_execution';
  additionalInfo?: string;
}

export const generateTestContent = async (request: AIPromptRequest): Promise<string> => {
  try {
    const prompt = buildPrompt(request);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return getFallbackContent(request.type);
  }
};

const buildPrompt = (request: AIPromptRequest): string => {
  const baseContext = `
Contexto histórico: O sistema deve gerar planos e casos de teste em formato Markdown e execuções em tabela texto plano, 
conforme padrão usado pelo Analista de Testes Paulo Ricardo, seguindo colunas fixas.

Contexto fornecido: ${request.context}
${request.additionalInfo ? `Informações adicionais: ${request.additionalInfo}` : ''}
`;

  switch (request.type) {
    case 'test_plan':
      return `${baseContext}

Gere um plano de teste completo em formato Markdown incluindo:
1. Objetivo
2. Escopo
3. Abordagem de teste
4. Critérios de aceite
5. Recursos necessários
6. Cronograma
7. Riscos e mitigação

Formato esperado em Markdown com seções bem definidas.`;

    case 'test_case':
      return `${baseContext}

Gere casos de teste detalhados em formato Markdown incluindo:
1. Título descritivo
2. Descrição
3. Pré-condições
4. Passos de execução (numerados)
5. Resultado esperado
6. Prioridade
7. Tipo de teste

Formato esperado em Markdown com seções bem definidas.`;

    case 'test_execution':
      return `${baseContext}

Gere um template de execução de teste em formato de tabela texto plano com as colunas:
| Caso de Teste | Status | Resultado Atual | Observações | Data/Hora |

Inclua exemplos práticos baseados no contexto fornecido.`;

    default:
      return baseContext;
  }
};

const getFallbackContent = (type: string): string => {
  switch (type) {
    case 'test_plan':
      return `# Plano de Teste

## Objetivo
Definir a estratégia de teste para o sistema.

## Escopo
Teste de funcionalidades principais.

## Abordagem
Testes manuais e automatizados.

## Critérios de Aceite
- Todas as funcionalidades principais devem funcionar
- Performance adequada
- Interface responsiva

## Recursos
- Analista de teste
- Ambiente de teste

## Cronograma
A ser definido conforme cronograma do projeto.

## Riscos
- Mudanças de escopo
- Limitações de tempo`;

    case 'test_case':
      return `# Caso de Teste

## Título
Verificar funcionalidade principal

## Descrição
Teste da funcionalidade principal do sistema

## Pré-condições
- Sistema disponível
- Usuário autenticado

## Passos
1. Acessar a aplicação
2. Realizar login
3. Navegar até a funcionalidade
4. Executar ação principal
5. Verificar resultado

## Resultado Esperado
Funcionalidade deve responder conforme especificado

## Prioridade
Alta

## Tipo
Funcional`;

    case 'test_execution':
      return `| Caso de Teste | Status | Resultado Atual | Observações | Data/Hora |
|---------------|--------|-----------------|-------------|-----------|
| CT001 | Não Testado | - | Aguardando execução | - |
| CT002 | Não Testado | - | Aguardando execução | - |`;

    default:
      return 'Conteúdo gerado automaticamente não disponível no momento.';
  }
};
