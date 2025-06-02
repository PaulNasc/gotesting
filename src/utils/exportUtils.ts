
import { TestPlan, TestCase, TestExecution } from '@/types';

export type ExportFormat = 'pdf' | 'word' | 'txt' | 'md';

export const exportItem = async (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  format: ExportFormat
) => {
  const content = generateContent(item, type, format);
  const filename = getFilename(item, type, format);
  
  if (format === 'pdf') {
    await exportToPDF(content, filename);
  } else {
    downloadTextFile(content, filename);
  }
};

export const copyToClipboard = async (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  format: ExportFormat
) => {
  const content = generateContent(item, type, format);
  await navigator.clipboard.writeText(content);
};

const generateContent = (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  format: ExportFormat
): string => {
  const title = getItemTitle(item, type);
  const description = getItemDescription(item, type);
  
  switch (format) {
    case 'md':
      return generateMarkdownContent(item, type, title, description);
    case 'txt':
      return generateTextContent(item, type, title, description);
    default:
      return generateHTMLContent(item, type, title, description);
  }
};

const generateMarkdownContent = (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  title: string,
  description: string
): string => {
  let content = `# ${title}\n\n`;
  
  if (description) {
    content += `## Descrição\n${description}\n\n`;
  }
  
  if (type === 'plan' && 'objective' in item) {
    content += `## Objetivo\n${item.objective}\n\n`;
    content += `## Escopo\n${item.scope}\n\n`;
    content += `## Abordagem\n${item.approach}\n\n`;
    content += `## Critérios\n${item.criteria}\n\n`;
  }
  
  if (type === 'case' && 'steps' in item) {
    if (item.preconditions) {
      content += `## Pré-condições\n${item.preconditions}\n\n`;
    }
    
    content += `## Passos de Teste\n\n`;
    content += `| Passo | Ação | Resultado Esperado |\n`;
    content += `|-------|------|--------------------|\n`;
    
    item.steps?.forEach((step: any, index: number) => {
      content += `| ${step.order || index + 1} | ${step.action} | ${step.expected_result} |\n`;
    });
    
    if (item.expected_result) {
      content += `\n## Resultado Final Esperado\n${item.expected_result}\n\n`;
    }
    
    if (item.priority) {
      content += `**Prioridade:** ${item.priority}\n\n`;
    }
    
    if (item.type) {
      content += `**Tipo:** ${item.type}\n\n`;
    }
  }
  
  if (type === 'execution') {
    const execution = item as TestExecution;
    content += `## Status\n${execution.status}\n\n`;
    
    if (execution.actual_result) {
      content += `## Resultado Obtido\n${execution.actual_result}\n\n`;
    }
    
    if (execution.executed_by) {
      content += `**Executado por:** ${execution.executed_by}\n\n`;
    }
    
    content += `**Data de Execução:** ${execution.executed_at.toLocaleDateString()}\n\n`;
  }
  
  return content;
};

const generateTextContent = (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  title: string,
  description: string
): string => {
  return generateMarkdownContent(item, type, title, description)
    .replace(/#+\s/g, '')
    .replace(/\|.*\|/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\n\n+/g, '\n\n');
};

const generateHTMLContent = (
  item: TestPlan | TestCase | TestExecution,
  type: 'plan' | 'case' | 'execution',
  title: string,
  description: string
): string => {
  let html = `<h1>${title}</h1>`;
  
  if (description) {
    html += `<h2>Descrição</h2><p>${description}</p>`;
  }
  
  if (type === 'plan' && 'objective' in item) {
    html += `<h2>Objetivo</h2><p>${item.objective}</p>`;
    html += `<h2>Escopo</h2><p>${item.scope}</p>`;
    html += `<h2>Abordagem</h2><p>${item.approach}</p>`;
    html += `<h2>Critérios</h2><p>${item.criteria}</p>`;
  }
  
  if (type === 'case' && 'steps' in item) {
    if (item.preconditions) {
      html += `<h2>Pré-condições</h2><p>${item.preconditions}</p>`;
    }
    
    html += `<h2>Passos de Teste</h2><table border="1"><tr><th>Passo</th><th>Ação</th><th>Resultado Esperado</th></tr>`;
    
    item.steps?.forEach((step: any, index: number) => {
      html += `<tr><td>${step.order || index + 1}</td><td>${step.action}</td><td>${step.expected_result}</td></tr>`;
    });
    
    html += `</table>`;
    
    if (item.expected_result) {
      html += `<h2>Resultado Final Esperado</h2><p>${item.expected_result}</p>`;
    }
  }
  
  if (type === 'execution') {
    const execution = item as TestExecution;
    html += `<h2>Status</h2><p>${execution.status}</p>`;
    
    if (execution.actual_result) {
      html += `<h2>Resultado Obtido</h2><p>${execution.actual_result}</p>`;
    }
    
    if (execution.executed_by) {
      html += `<p><strong>Executado por:</strong> ${execution.executed_by}</p>`;
    }
    
    html += `<p><strong>Data de Execução:</strong> ${execution.executed_at.toLocaleDateString()}</p>`;
  }
  
  return html;
};

const getItemTitle = (item: TestPlan | TestCase | TestExecution, type: 'plan' | 'case' | 'execution'): string => {
  if (type === 'execution') {
    return `Execução #${item.id.slice(0, 8)}`;
  }
  return (item as TestPlan | TestCase).title;
};

const getItemDescription = (item: TestPlan | TestCase | TestExecution, type: 'plan' | 'case' | 'execution'): string => {
  if (type === 'execution') {
    return (item as TestExecution).notes || '';
  }
  return (item as TestPlan | TestCase).description || '';
};

const getFilename = (item: TestPlan | TestCase | TestExecution, type: 'plan' | 'case' | 'execution', format: ExportFormat): string => {
  const title = getItemTitle(item, type);
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedTitle}.${format}`;
};

const exportToPDF = async (content: string, filename: string) => {
  // Para PDF, vamos criar um HTML e usar a API de impressão do navegador
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
