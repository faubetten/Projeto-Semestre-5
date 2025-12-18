import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import parsePrompt from '@/lib/parsePrompt';

interface CSPEvent {
  _id: any;
  title: string;
  description: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  date: string;
  tags: string[];
  image: string; // ← AGORA ESTÁ AQUI!
  venue: string;
  organizer: string;
  [key: string]: any; // Para outros campos
}

interface CSPOptions {
  limit?: number;
}

export async function recommendEventsCSP(prompt: string, options?: CSPOptions) {
  await connectDB();
  
  const limit = options?.limit || 10;
  
  // 1. Parse do prompt (use o parsePrompt que já funciona)
  const parsed = await parsePrompt(prompt, { 
    knownTags: await Event.distinct('tags') 
  });
  
  // 2. Buscar candidatos com filtros básicos
  const today = new Date().toISOString().split('T')[0];
  const query: any = { date: { $gte: today } };
  
  if (parsed.location) {
    query.location = new RegExp(parsed.location, 'i');
  }
  if (parsed.mode) {
    query.mode = parsed.mode;
  }
  if (parsed.tag) {
    query.tags = { $in: [new RegExp(parsed.tag, 'i')] };
  }
  
  let candidates = await Event.find(query)
    .select('title description location mode date tags image venue organizer') // ← SELECIONE OS CAMPOS NECESSÁRIOS
    .limit(100)
    .lean();
  
  // 3. Converter para CSPEvent (corrigindo o tipo)
  const cspEvents: CSPEvent[] = candidates.map(doc => ({
    _id: doc._id,
    title: doc.title || '',
    description: doc.description || '',
    location: doc.location || '',
    mode: doc.mode || 'offline',
    date: doc.date || '',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    image: doc.image || '', // ← AGORA FUNCIONA!
    venue: doc.venue || '',
    organizer: doc.organizer || '',
    // Adicione outros campos que precisar
  }));
  
  // 4. Aplicar CSP SIMPLIFICADO
  const constraints = extractConstraints(prompt, parsed);
  const solution = solveCSP(cspEvents, constraints, limit);
  
  return solution;
}

// Extrai constraints do prompt
function extractConstraints(prompt: string, parsed: any) {
  const constraints: Array<{ type: string; value: any; isHard: boolean }> = [];
  
  // Hard constraints (obrigatórias)
  if (parsed.location) {
    constraints.push({ type: 'location', value: parsed.location, isHard: true });
  }
  if (parsed.mode) {
    constraints.push({ type: 'mode', value: parsed.mode, isHard: true });
  }
  
  // Soft constraints (preferências)
  if (parsed.tag) {
    constraints.push({ type: 'tag', value: parsed.tag, isHard: false });
  }
  
  // Keywords da busca original
  const keywords = prompt.toLowerCase().split(' ').filter(word => 
    word.length > 2 && 
    !['eventos', 'evento', 'no', 'em', 'de', 'para'].includes(word)
  );
  
  keywords.forEach(keyword => {
    constraints.push({ type: 'keyword', value: keyword, isHard: false });
  });
  
  return constraints;
}

// CSP simplificado - sem backtracking complexo
function solveCSP(events: CSPEvent[], constraints: any[], limit: number) {
  // 1. Filtrar por hard constraints
  let candidates = [...events];
  
  const hardConstraints = constraints.filter(c => c.isHard);
  hardConstraints.forEach(constraint => {
    candidates = candidates.filter(event => {
      switch (constraint.type) {
        case 'location':
          return event.location.toLowerCase().includes(constraint.value.toLowerCase());
        case 'mode':
          return event.mode === constraint.value;
        default:
          return true;
      }
    });
  });
  
  // 2. Se não achou com hard, relaxar (exceto location/mode)
  if (candidates.length === 0) {
    candidates = events.filter(event => {
      // Mantém só location e mode como obrigatórios
      const locationMatch = !hardConstraints.some(c => 
        c.type === 'location' && !event.location.toLowerCase().includes(c.value.toLowerCase())
      );
      const modeMatch = !hardConstraints.some(c => 
        c.type === 'mode' && event.mode !== c.value
      );
      return locationMatch && modeMatch;
    });
  }
  
  // 3. Pontuar por soft constraints
  const softConstraints = constraints.filter(c => !c.isHard);
  const scored = candidates.map(event => {
    let score = 0;
    
    softConstraints.forEach(constraint => {
      switch (constraint.type) {
        case 'tag':
          if (event.tags.some(tag => 
            tag.toLowerCase().includes(constraint.value.toLowerCase())
          )) score += 2;
          break;
        case 'keyword':
          const text = `${event.title} ${event.description} ${event.tags.join(' ')}`.toLowerCase();
          if (text.includes(constraint.value.toLowerCase())) score += 1;
          break;
      }
    });
    
    // Bônus para eventos próximos
    const daysUntil = Math.max(0, Math.floor(
      (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));
    score += Math.max(0, 30 - daysUntil) * 0.1;
    
    return { event, score };
  });
  
  // 4. Ordenar e retornar
   return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => {
      const event = item.event;
      
      // ✅ GARANTIR QUE TENHA SLUG!
      let slug = event.slug;
      if (!slug && event.title) {
        // Gerar slug do título se não existir
        slug = event.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      return {
        // Campos obrigatórios para o frontend
        _id: event._id,
        id: event._id?.toString() || event._id,
        title: event.title || '',
        slug: slug || 'no-slug', // ← SLUG SEMPRE DEFINIDO!
        description: event.description || '',
        overview: event.overview || '',
        image: event.image || '',
        venue: event.venue || '',
        location: event.location || '',
        date: event.date || '',
        time: event.time || '',
        mode: event.mode || 'offline',
        audience: event.audience || '',
        agenda: Array.isArray(event.agenda) ? event.agenda : [],
        organizer: event.organizer || '',
        tags: Array.isArray(event.tags) ? event.tags : [],
        
        // Campos opcionais
        creatorId: event.creatorId,
        price: event.price || 0,
        capacity: event.capacity,
        registrationUrl: event.registrationUrl,
        
        // Timestamps
        createdAt: event.createdAt || new Date().toISOString(),
        updatedAt: event.updatedAt || new Date().toISOString(),
        
        // Score do CSP
        _score: item.score
      };
    });
}

export default recommendEventsCSP; 