/**
 * Lightweight prompt parser for event search prompts (no LLMs)
 * Returns structured filters: { search, location, mode, tag, dateFrom, dateTo }
 */
export async function parsePrompt(
    prompt: string,
    options?: {
        knownTags?: string[];
        knownCities?: string[];
    }
) {
    const raw = (prompt || '').trim();
    if (!raw) return {} as any;

    const normalize = (s: string) =>
        s
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9.\s-]/gi, '')
            .trim();

    const p = normalize(raw);
    const result: any = {};

    const knownCities = (options?.knownCities || ['lisboa', 'porto', 'coimbra', 'faro', 'braga', 'aveiro']).map(normalize);

    // alias mapping for common english/variant city names -> canonical local name
    const cityAliases: Record<string, string> = {
        'lisbon': 'lisboa',
        // add more aliases here as needed
    };

    // detect alias first (handles 'lisbon' -> 'lisboa')
    for (const [aliasRaw, canonicalRaw] of Object.entries(cityAliases)) {
        const alias = normalize(aliasRaw);
        const canonical = normalize(canonicalRaw);
        if (alias && p.includes(alias)) {
            result.location = canonical;
            // expose variants so callers can match either form (e.g. 'lisbon' or 'lisboa')
            result.locationVariants = [canonical, alias];
            break;
        }
    }

    // detect city/location tokens (fallback)
    if (!result.location) {
        for (const city of knownCities) {
            if (city && p.includes(city)) {
                result.location = city;
                result.locationVariants = [city];
                break;
            }
        }
    }

    // mode detection (english + portuguese)
    if (p.includes('online')) result.mode = 'online';
    if (p.includes('presencial') || p.includes('presencialmente') || p.includes('in person') || p.includes('in-person')) result.mode = 'offline';
    if (p.includes('hibrido') || p.includes('híbrido') || p.includes('hybrid')) result.mode = 'hybrid';

    // date keywords
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().split('T')[0];

    if (p.includes('hoje')) {
        result.dateFrom = toISO(today);
        result.dateTo = toISO(today);
    } else if (p.includes('amanha') || p.includes('amanhã')) {
        const t = new Date(today);
        t.setDate(t.getDate() + 1);
        result.dateFrom = toISO(t);
        result.dateTo = toISO(t);
    } else if (p.includes('esta semana') || p.includes('esta semana')) {
        const start = new Date(today);
        const day = start.getDay();
        const diffToMon = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMon);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        result.dateFrom = toISO(start);
        result.dateTo = toISO(end);
    } else if (p.includes('fim de semana') || p.includes('fim-de-semana') || p.includes('final de semana')) {
        // Saturday and Sunday
        const saturday = new Date(today);
        const day = saturday.getDay();
        const diffToSat = (6 - day + 7) % 7;
        saturday.setDate(saturday.getDate() + diffToSat);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        result.dateFrom = toISO(saturday);
        result.dateTo = toISO(sunday);
    } else if (p.includes('proximo mes') || p.includes('próximo mês') || p.includes('mes que vem') || p.includes('mês que vem')) {
        const firstOfNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const lastOfNext = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        result.dateFrom = toISO(firstOfNext);
        result.dateTo = toISO(lastOfNext);
    }

    // tag detection from knownTags (normalize both)
    if (options?.knownTags && options.knownTags.length > 0) {
        const lowerTags = options.knownTags.map(t => normalize(String(t)));
        for (let i = 0; i < lowerTags.length; i++) {
            const t = lowerTags[i];
            if (!t) continue;
            if (p.includes(t)) {
                result.tag = options.knownTags[i]; // return original casing
                break;
            }
        }
    }

    // Detect generic "all events" intents so callers can avoid applying
    // a restrictive full-text search. Examples: "quero todos os eventos",
    // "mostrar todos", "all events", "show all".
    const allPatterns = [
        'todos',
        'todos os eventos',
        'quero todos',
        'quero todos os eventos',
        'mostrar todos',
        'ver todos',
        'all events',
        'show all',
        'list all events',
    ];

    const isAll = allPatterns.some((pat) => p.includes(pat));

    // fallback: use original raw prompt as search unless user asked for "all".
    result.search = isAll ? '' : raw;
    if (isAll) result.all = true;
    return result;
}

export default parsePrompt;
