
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
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const { type, description, context, requirements, userId, caseId, planId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    let prompt = '';
    
    if (type === 'plan') {
      prompt = `
        Crie um plano de teste detalhado em português brasileiro para o seguinte sistema/funcionalidade:
        
        Descrição: ${description}
        ${context ? `Contexto: ${context}` : ''}
        ${requirements ? `Requisitos: ${requirements}` : ''}
        
        Retorne um JSON válido com a seguinte estrutura:
        {
          "title": "título do plano",
          "description": "descrição detalhada",
          "objective": "objetivo do teste",
          "scope": "escopo dos testes",
          "approach": "abordagem de teste",
          "criteria": "critérios de aceite",
          "resources": "recursos necessários",
          "schedule": "cronograma estimado",
          "risks": "riscos identificados"
        }
      `;
    } else if (type === 'case') {
      prompt = `
        Crie um caso de teste detalhado em português brasileiro para o seguinte sistema/funcionalidade:
        
        Descrição: ${description}
        ${context ? `Contexto: ${context}` : ''}
        ${requirements ? `Requisitos: ${requirements}` : ''}
        
        Retorne um JSON válido com a seguinte estrutura:
        {
          "title": "título do caso de teste",
          "description": "descrição do caso",
          "preconditions": "pré-condições necessárias",
          "steps": [
            {
              "id": "1",
              "action": "ação a ser executada",
              "expected_result": "resultado esperado",
              "order": 1
            }
          ],
          "expected_result": "resultado esperado final",
          "priority": "medium",
          "type": "functional"
        }
      `;
    } else if (type === 'execution') {
      // Buscar dados do caso de teste para contexto
      const { data: testCase } = await supabase
        .from('test_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (!testCase) {
        throw new Error('Caso de teste não encontrado');
      }

      prompt = `
        Gere uma execução de teste realística em português brasileiro para o seguinte caso de teste:
        
        Caso de Teste: ${testCase.title}
        Descrição: ${testCase.description}
        Passos: ${JSON.stringify(testCase.steps)}
        
        Contexto adicional: ${description}
        ${context ? `Observações: ${context}` : ''}
        
        Retorne um JSON válido com a seguinte estrutura:
        {
          "status": "passed" ou "failed" ou "blocked",
          "actual_result": "resultado obtido durante a execução simulada",
          "notes": "observações sobre a execução",
          "executed_by": "Testador IA"
        }
      `;
    }

    console.log('Enviando prompt para Gemini:', prompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta do Gemini:', data);

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Limpar e extrair JSON da resposta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido do Gemini');
    }

    const generatedData = JSON.parse(jsonMatch[0]);
    console.log('Dados gerados:', generatedData);

    // Salvar no banco de dados
    let result;
    if (type === 'plan') {
      const { data: plan, error } = await supabase
        .from('test_plans')
        .insert([{
          ...generatedData,
          user_id: userId,
          generated_by_ai: true
        }])
        .select()
        .single();

      if (error) throw error;
      result = plan;
    } else if (type === 'case') {
      const { data: testCase, error } = await supabase
        .from('test_cases')
        .insert([{
          ...generatedData,
          plan_id: planId || null,
          user_id: userId,
          generated_by_ai: true
        }])
        .select()
        .single();

      if (error) throw error;
      result = testCase;
    } else if (type === 'execution') {
      const { data: execution, error } = await supabase
        .from('test_executions')
        .insert([{
          ...generatedData,
          case_id: caseId,
          plan_id: planId,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      result = execution;
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Verifique se a chave da API do Gemini está configurada corretamente'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
