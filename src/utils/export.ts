// Utilitários para exportação de dados

export interface ExportData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  title?: string;
}

// Exportar para CSV
export const exportToCSV = (data: ExportData, filename: string = 'export') => {
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => 
      row.map(cell => {
        // Escapar aspas duplas e envolver em aspas se necessário
        const stringCell = String(cell || '');
        if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
          return `"${stringCell.replace(/"/g, '""')}"`;
        }
        return stringCell;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Exportar para JSON
export const exportToJSON = (data: any, filename: string = 'export') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
};

// Exportar para Excel (formato básico CSV que o Excel pode abrir)
export const exportToExcel = (data: ExportData, filename: string = 'export') => {
  // Usar CSV como base, mas com extensão .xlsx para indicar compatibilidade com Excel
  const csvContent = [
    data.headers.join('\t'), // Usar tab em vez de vírgula para melhor compatibilidade
    ...data.rows.map(row => 
      row.map(cell => String(cell || '')).join('\t')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;');
};

// Exportar para PDF básico (usando print)
export const exportToPDF = (title: string = 'Relatório') => {
  // Criar uma nova janela com conteúdo formatado para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir janela para impressão. Verifique se pop-ups estão bloqueados.');
  }

  // Obter o conteúdo atual da página
  const currentContent = document.querySelector('[data-export-content]')?.innerHTML || 
                         document.querySelector('main')?.innerHTML || 
                         'Conteúdo não encontrado';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          font-size: 12px; 
        }
        h1, h2, h3 { 
          color: #333; 
          margin-bottom: 10px; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-bottom: 20px; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold; 
        }
        .chart-container, .recharts-wrapper { 
          display: none; 
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <hr>
      ${currentContent}
    </body>
    </html>
  `);

  printWindow.document.close();
  
  // Aguardar carregamento e imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};

// Função auxiliar para download de arquivo
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpar URL após uso
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Converter dados de tabela HTML para formato de exportação
export const tableToExportData = (tableElement: HTMLTableElement): ExportData => {
  const headers: string[] = [];
  const rows: (string | number | boolean | null)[][] = [];

  // Extrair cabeçalhos
  const headerRow = tableElement.querySelector('thead tr') || tableElement.querySelector('tr');
  if (headerRow) {
    headerRow.querySelectorAll('th, td').forEach(cell => {
      headers.push(cell.textContent?.trim() || '');
    });
  }

  // Extrair linhas de dados
  const bodyRows = tableElement.querySelectorAll('tbody tr') || 
                   (headerRow ? Array.from(tableElement.querySelectorAll('tr')).slice(1) : tableElement.querySelectorAll('tr'));
  
  bodyRows.forEach(row => {
    const rowData: (string | number | boolean | null)[] = [];
    row.querySelectorAll('td, th').forEach(cell => {
      const text = cell.textContent?.trim() || '';
      // Tentar converter números
      const num = parseFloat(text);
      if (!isNaN(num) && text === num.toString()) {
        rowData.push(num);
      } else {
        rowData.push(text);
      }
    });
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  });

  return { headers, rows };
};

// Exportar dados do Supabase diretamente
export const exportSupabaseData = async (
  tableName: string, 
  data: any[], 
  format: 'csv' | 'json' | 'excel', 
  filename?: string
) => {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  const baseFilename = filename || `${tableName}_${new Date().toISOString().split('T')[0]}`;

  if (format === 'json') {
    exportToJSON(data, baseFilename);
    return;
  }

  // Para CSV e Excel, converter para formato tabular
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => item[header]));

  const exportData: ExportData = {
    headers,
    rows,
    title: `Dados de ${tableName}`
  };

  if (format === 'csv') {
    exportToCSV(exportData, baseFilename);
  } else if (format === 'excel') {
    exportToExcel(exportData, baseFilename);
  }
};

// Copiar conteúdo para clipboard
export const copyToClipboard = async (content: string, format: 'txt' | 'md' = 'txt') => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    // Fallback para navegadores que não suportam clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      throw new Error('Não foi possível copiar o conteúdo. Clipboard API não disponível.');
    }
  }
};

// Converter dados para formato Markdown
export const dataToMarkdown = (data: ExportData, title?: string): string => {
  let markdown = '';
  
  if (title) {
    markdown += `# ${title}\n\n`;
    markdown += `*Gerado em: ${new Date().toLocaleString('pt-BR')}*\n\n`;
  }
  
  // Cabeçalhos da tabela
  markdown += `| ${data.headers.join(' | ')} |\n`;
  markdown += `| ${data.headers.map(() => '---').join(' | ')} |\n`;
  
  // Linhas de dados
  data.rows.forEach(row => {
    const formattedRow = row.map(cell => String(cell || '').replace(/\|/g, '\\|'));
    markdown += `| ${formattedRow.join(' | ')} |\n`;
  });
  
  return markdown;
};

// Converter dados para formato de texto simples
export const dataToText = (data: ExportData, title?: string): string => {
  let text = '';
  
  if (title) {
    text += `${title}\n`;
    text += '='.repeat(title.length) + '\n\n';
    text += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  }
  
  // Determinar largura das colunas
  const columnWidths = data.headers.map((header, index) => {
    const headerWidth = header.length;
    const maxDataWidth = Math.max(...data.rows.map(row => String(row[index] || '').length));
    return Math.max(headerWidth, maxDataWidth, 3);
  });
  
  // Cabeçalhos
  const headerLine = data.headers.map((header, index) => 
    header.padEnd(columnWidths[index])
  ).join(' | ');
  
  const separatorLine = columnWidths.map(width => '-'.repeat(width)).join('-|-');
  
  text += headerLine + '\n';
  text += separatorLine + '\n';
  
  // Dados
  data.rows.forEach(row => {
    const dataLine = row.map((cell, index) => 
      String(cell || '').padEnd(columnWidths[index])
    ).join(' | ');
    text += dataLine + '\n';
  });
  
  return text;
};

// Copiar dados da tabela
export const copyTableData = async (data: ExportData, format: 'txt' | 'md', title?: string) => {
  const content = format === 'md' 
    ? dataToMarkdown(data, title) 
    : dataToText(data, title);
    
  return await copyToClipboard(content, format);
};

// Copiar relatório formatado
export const copyReportData = async (
  reportType: string,
  reportData: any,
  format: 'txt' | 'md',
  additionalData?: any
) => {
  const reportTitle = `Relatório - ${reportType}`;
  
  try {
    let content = '';
    
    if (format === 'md') {
      content = `# ${reportTitle}\n\n`;
      content += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n\n`;
      content += `## Dados\n\n`;
      content += '```json\n';
      content += JSON.stringify({
        tipo: reportType,
        dados: reportData,
        ...additionalData
      }, null, 2);
      content += '\n```\n';
    } else {
      content = `${reportTitle}\n`;
      content += '='.repeat(reportTitle.length) + '\n\n';
      content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
      content += 'DADOS:\n';
      content += JSON.stringify({
        tipo: reportType,
        dados: reportData,
        ...additionalData
      }, null, 2);
    }
    
    return await copyToClipboard(content, format);
  } catch (error) {
    console.error('Erro ao copiar relatório:', error);
    throw error;
  }
};

// Exportar relatórios formatados
export const exportReportData = (
  reportType: string,
  reportData: any,
  format: 'pdf' | 'csv' | 'excel' | 'json',
  additionalData?: any
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `relatorio_${reportType}_${timestamp}`;

  try {
    switch (format) {
      case 'pdf':
        exportToPDF(`Relatório - ${reportType}`);
        break;
      case 'json':
        exportToJSON({
          tipo: reportType,
          geradoEm: new Date().toISOString(),
          dados: reportData,
          ...additionalData
        }, filename);
        break;
      case 'csv':
      case 'excel':
        // Converter dados do relatório para formato tabular
        if (Array.isArray(reportData)) {
          exportSupabaseData(reportType, reportData, format, filename);
        } else {
          // Para dados não tabulares, converter para formato chave-valor
          const headers = ['Propriedade', 'Valor'];
          const rows = Object.entries(reportData).map(([key, value]) => [key, String(value)]);
          const exportData: ExportData = { headers, rows, title: `Relatório - ${reportType}` };
          
          if (format === 'csv') {
            exportToCSV(exportData, filename);
          } else {
            exportToExcel(exportData, filename);
          }
        }
        break;
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  } catch (error) {
    console.error('Erro na exportação:', error);
    throw error;
  }
}; 