import { ParsedPrompt } from './promptSchema';

const MODES = ['online', 'offline', 'hybrid'];

export default function validateCSP(
  parsed: ParsedPrompt,
  knownTags: string[]
): ParsedPrompt {

  if (parsed.mode && !MODES.includes(parsed.mode)) {
    throw new Error('Modo inválido');
  }

  if (parsed.category && !knownTags.includes(parsed.category)) {
    throw new Error('Categoria não permitida');
  }

  if (parsed.dateFrom && isNaN(Date.parse(parsed.dateFrom))) {
    throw new Error('dateFrom inválida');
  }

  if (parsed.dateTo && isNaN(Date.parse(parsed.dateTo))) {
    throw new Error('dateTo inválida');
  }

  return parsed;
}
