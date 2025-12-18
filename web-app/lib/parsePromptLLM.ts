// lib/parsePromptLLM.ts - VERSÃO SIMPLIFICADA E FUNCIONAL
import { ParsedPrompt } from './promptSchema';

export default async function parsePromptLLM(
  prompt: string,
  knownTags: string[]
): Promise<ParsedPrompt> {
  
  // Se não tem API key, usa fallback IMEDIATO
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY não definida');
    return parsePromptFallback(prompt, knownTags);
  }
  
  try {
    // Modelo mais estável para português
    const model = 'qwen/qwen-2.5-32b-instruct:free';
    
    const systemPrompt = `Extraia informações desta busca por eventos:
    
    BUSCA: "${prompt}"
    
    Retorne APENAS JSON neste formato:
    {
      "location": "cidade ou null",
      "mode": "online/offline/hybrid ou null", 
      "category": "tecnologia principal ou null",
      "search": "texto para busca geral"
    }
    
    Exemplos:
    - "eventos no porto" → {"location":"porto","mode":null,"category":null,"search":"porto"}
    - "workshop react online" → {"location":null,"mode":"online","category":"react","search":"workshop"}
    - "todos os eventos" → {"location":null,"mode":null,"category":null,"search":""}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 150,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse: ${prompt}` }
        ]
      })
    });

    if (!res.ok) {
      console.warn(`OpenRouter error ${res.status}, usando fallback`);
      return parsePromptFallback(prompt, knownTags);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia');
    }
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('JSON não encontrado na resposta:', content);
      return parsePromptFallback(prompt, knownTags);
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // ✅ Retorna no formato correto ParsedPrompt
    return {
      location: parsed.location || null,
      dateFrom: null, // Não extraímos datas por enquanto
      dateTo: null,
      category: parsed.category || null,
      mode: parsed.mode || null,
      all: parsed.search === '' || false, // "all" se search vazio
      search: parsed.search || prompt
    };
    
  } catch (error) {
    console.error('Erro no parsePromptLLM:', error);
    // ✅ SEMPRE retorna algo, nunca explode
    return parsePromptFallback(prompt, knownTags);
  }
}

// Fallback melhorado
function parsePromptFallback(prompt: string, knownTags: string[]): ParsedPrompt {
  const lowerPrompt = prompt.toLowerCase();
  
  const result: ParsedPrompt = {
    location: null,
    dateFrom: null,
    dateTo: null,
    category: null,
    mode: null,
    all: false,
    search: prompt
  };
  
  // Detecção básica
  const cities = ['porto', 'lisboa', 'coimbra', 'faro', 'braga', 'aveiro'];
  for (const city of cities) {
    if (lowerPrompt.includes(city)) {
      result.location = city;
      break;
    }
  }
  
  if (lowerPrompt.includes('online')) result.mode = 'online';
  if (lowerPrompt.includes('offline') || lowerPrompt.includes('presencial')) result.mode = 'offline';
  if (lowerPrompt.includes('hibrido') || lowerPrompt.includes('híbrido')) result.mode = 'hybrid';
  
  // "todos os eventos"
  if (lowerPrompt.includes('todos') || lowerPrompt.includes('all') || lowerPrompt.includes('tudo')) {
    result.all = true;
    result.search = '';
  }
  
  return result;
}