
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY não configurada');
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const { documentContent, context, userId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `
      Analise o seguinte documento e identifique AUTONOMAMENTE diferentes funcionalidades, sistemas ou módulos que necessitam de planos de teste específicos.

      DOCUMENTO:
      ${documentContent}

      ${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

      INSTRUÇÕES IMPORTANTES:
      - Analise o documento e identifique automaticamente as diferentes funcionalidades/sistemas
      - Para cada funcionalidade identificada, crie um plano de teste específico e focado
      - Seja DIRETO e ESPECÍFICO, evite contexto desnecessário
      - Cada plano deve ser independente e testável
      - Gere apenas o essencial baseado nas informações fornecidas

      Retorne um JSON válido com esta estrutura EXATA:
      {
        "plans": [
          {
            "title": "título específico do plano",
            "description": "descrição direta e objetiva",
            "objective": "objetivo claro do teste",
            "scope": "escopo específico a ser testado",
            "approach": "abordagem de teste direta",
            "criteria": "critérios de aceite objetivos",
            "resources": "recursos necessários",
            "schedule": "estimativa de cronograma",
            "risks": "principais riscos identificados"
          }
        ]
      }

      IMPORTANTE: Gere quantos planos forem necessários baseado na análise do documento, mas seja específico e direto.
    `;

    console.log('Enviando prompt para Gemini (batch generation):', prompt.substring(0, 500) + '...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API do Gemini: ${response.status} - ${errorText}`);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta do Gemini (batch):', data);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pelo Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Limpar e extrair JSON da resposta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Texto gerado sem JSON válido:', generatedText);
      throw new Error('Formato de resposta inválido do Gemini');
    }

    const generatedData = JSON.parse(jsonMatch[0]);
    console.log('Dados gerados (batch):', generatedData);

    if (!generatedData.plans || !Array.isArray(generatedData.plans)) {
      throw new Error('Formato de resposta inválido: plans array esperado');
    }

    // Adicionar IDs únicos para cada plano
    const plansWithIds = generatedData.plans.map((plan: any) => ({
      ...plan,
      id: crypto.randomUUID(),
      user_id: userId,
      generated_by_ai: true
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      plans: plansWithIds,
      count: plansWithIds.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de geração em lote:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Verifique se a chave da API do Gemini está configurada corretamente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
