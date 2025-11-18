import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import parsePrompt from '@/lib/parsePrompt';

// Simple tokenizer / normalizer
const normalize = (s: string) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9.\s-]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (s: string) => (normalize(s) ? normalize(s).split(' ') : []);

// Compute BM25-like score across selected fields with simple weights
function scoreDocument(tokens: string[], docTerms: Record<string, number>, idf: Record<string, number>, fieldWeight = 1) {
    let score = 0;
    for (const t of tokens) {
        const tf = docTerms[t] || 0;
        if (!tf) continue;
        const invDocFreq = idf[t] || Math.log(1 + 1);
        score += (tf * invDocFreq) * fieldWeight;
    }
    return score;
}

export async function recommendEvents(prompt: string, limit = 10) {
    await connectDB();

    if (!prompt || String(prompt).trim() === '') return [];

    // Use parsePrompt to derive filters like location/mode/tag/date
    const parsed = await parsePrompt(prompt, { knownTags: await Event.distinct('tags') });

    const today = new Date().toISOString().split('T')[0];

    const query: any = { date: { $gte: today } };
    if (parsed.location) query.location = new RegExp(parsed.location, 'i');
    if (parsed.mode) query.mode = parsed.mode;
    if (parsed.tag) query.tags = { $in: [new RegExp(String(parsed.tag), 'i')] };
    if (parsed.dateFrom && parsed.dateTo) query.date = { $gte: parsed.dateFrom, $lte: parsed.dateTo };

    // Candidate set size: limit * 10 (cap to avoid scanning entire DB)
    const candidateLimit = Math.max(limit * 10, 100);

    const candidates = await Event.find(query).sort({ date: 1 }).limit(candidateLimit).lean();

    // Build corpus term frequencies (per doc) and document frequencies
    const docsTerms: Array<Record<string, number>> = [];
    const df: Record<string, number> = {};

    const fieldsToIndex = ['title', 'description', 'tags', 'location'];

    for (const doc of candidates) {
        const terms: Record<string, number> = {};
        // title
        const titleTokens = tokenize(doc.title || '');
        for (const t of titleTokens) terms[t] = (terms[t] || 0) + 3; // weight title higher

        // description
        const descTokens = tokenize(doc.description || '');
        for (const t of descTokens) terms[t] = (terms[t] || 0) + 1;

        // tags
        const tagList = Array.isArray(doc.tags) ? doc.tags : [];
        for (const tg of tagList) {
            const tt = normalize(String(tg));
            if (!tt) continue;
            terms[tt] = (terms[tt] || 0) + 2;
        }

        // location
        const locTokens = tokenize(doc.location || '');
        for (const t of locTokens) terms[t] = (terms[t] || 0) + 2;

        // update df
        const seen = new Set<string>();
        for (const t of Object.keys(terms)) {
            if (!seen.has(t)) {
                df[t] = (df[t] || 0) + 1;
                seen.add(t);
            }
        }

        docsTerms.push(terms);
    }

    // tokens from prompt (use parsed.search for full-text)
    const promptText = parsed.search || prompt;
    const promptTokens = tokenize(promptText);

    const N = Math.max(1, candidates.length);
    const idf: Record<string, number> = {};
    for (const t of promptTokens) {
        const df_t = df[t] || 0;
        idf[t] = Math.log(1 + (N - df_t + 0.5) / (df_t + 0.5));
    }

    // Score each candidate
    const scores: Array<{ doc: any; score: number }> = [];
    for (let i = 0; i < candidates.length; i++) {
        const doc = candidates[i];
        const terms = docsTerms[i];

        // Weighted scoring: title x3, tags x2, location x2, description x1
        let s = 0;
        s += scoreDocument(promptTokens, terms, idf, 1);

        // small boost for nearer dates
        try {
            const daysUntil = Math.max(0, Math.round((new Date(doc.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            s += Math.max(0, (30 - daysUntil) / 30) * 0.1; // events sooner get slight boost
        } catch (_) {}

        // additional boost if tag match
        if (parsed.tag) {
            const tagNorm = normalize(String(parsed.tag));
            const tagMatch = (Array.isArray(doc.tags) ? doc.tags.map(t => normalize(String(t))) : []).includes(tagNorm);
            if (tagMatch) s += 0.5;
        }

        scores.push({ doc, score: s });
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, limit).map((r) => ({ ...r.doc, _score: r.score }));
}

export default recommendEvents;
