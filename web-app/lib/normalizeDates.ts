import { ParsedPrompt } from './promptSchema';

export default function normalizeDates(parsed: ParsedPrompt): ParsedPrompt {
  const today = new Date();

  function normalizeSingleDate(dateStr: string): { from: string; to: string } {
    const d = new Date(dateStr);

    // 🔥 SE O ANO NÃO FOI ESPECIFICADO → assume próximo evento futuro
    if (d < today) {
      d.setFullYear(today.getFullYear() + 1);
    }

    const from = new Date(d);
    from.setHours(0, 0, 0, 0);

    const to = new Date(d);
    to.setDate(to.getDate() + 1);
    to.setHours(0, 0, 0, 0);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  // Caso: data única (18 de dezembro)
  if (parsed.dateFrom && parsed.dateFrom === parsed.dateTo) {
    const { from, to } = normalizeSingleDate(parsed.dateFrom);
    parsed.dateFrom = from;
    parsed.dateTo = to;
  }

  return parsed;
}
