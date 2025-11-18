import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import parsePrompt from '@/lib/parsePrompt';

// Normalize text for token matching
const normalize = (s: string) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9.\s-]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenize = (s: string) => (normalize(s) ? normalize(s).split(' ') : []);

// cost = number of prompt tokens missing from doc tokens (lower is better)
function computeCost(promptTokens: string[], doc: any) {
    const docText = [doc.title || '', doc.description || '', ...(Array.isArray(doc.tags) ? doc.tags : []), doc.location || ''].join(' ');
    const docTokensSet = new Set(tokenize(docText));
    let missing = 0;
    for (const t of promptTokens) {
        if (!docTokensSet.has(t)) missing += 1;
    }

    // small penalty for further dates
    let datePenalty = 0;
    try {
        const daysUntil = Math.max(0, Math.round((new Date(doc.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        datePenalty = Math.max(0, daysUntil / 30); // normalized
    } catch (_) {}

    return missing + datePenalty;
}

interface CSPOptions {
    limit?: number; // max events in the returned schedule
    candidateCap?: number; // max candidates to consider
}

/**
 * Recommend events using CSP + backtracking search with simple heuristics.
 * - Hard constraints from the prompt (location/mode/tag/date) are enforced.
 * - Soft preference (keywords) used as cost; solver searches for a set of events
 *   (up to `limit`) without date conflicts that minimizes total cost.
 */
export async function recommendEventsCSP(prompt: string, options?: CSPOptions) {
    await connectDB();

    const { limit = 5, candidateCap = 200 } = options || {};

    const parsed = await parsePrompt(prompt, { knownTags: await Event.distinct('tags') });

    const today = new Date().toISOString().split('T')[0];
    const query: any = { date: { $gte: today } };
    if (parsed.location) {
        // If parser provided variants (e.g. ['lisboa','lisbon']), match any variant
        if (Array.isArray(parsed.locationVariants) && parsed.locationVariants.length > 0) {
            const escaped = parsed.locationVariants
                .map((v: string) => String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            query.location = new RegExp(`(?:${escaped})`, 'i');
        } else {
            query.location = new RegExp(parsed.location, 'i');
        }
    }
    if (parsed.mode) query.mode = parsed.mode;
    if (parsed.tag) query.tags = { $in: [new RegExp(String(parsed.tag), 'i')] };
    if (parsed.dateFrom && parsed.dateTo) query.date = { $gte: parsed.dateFrom, $lte: parsed.dateTo };

    // initial candidate set
    let candidates = await Event.find(query).sort({ date: 1 }).limit(candidateCap).lean();

    if (parsed.all) {
        // user asked for all events (subject to date/mode/tag filters)
        return candidates.map((c) => ({ ...c, _score: 0 }));
    }

    // Heuristic: if the user query is essentially a location-only request
    // (e.g. "quero eventos no porto" / "eventos em porto") then return
    // all matching candidates (up to the cap/limit) instead of running the
    // CSP optimizer which tends to pick a small subset.
    const stopwords = new Set([
        'quero', 'quer', 'mostrar', 'mostrar', 'ver', 'eventos', 'evento',
        'em', 'no', 'na', 'nos', 'nas', 'por', 'do', 'da', 'para', 'todos',
        'all', 'show', 'list', 'os', 'as', 'o', 'a'
    ]);
    const searchTokens = tokenize(parsed.search || prompt).filter(t => !!t);
    const significant = searchTokens.filter(t => !stopwords.has(t));
    // If there are no significant tokens other than possibly the location,
    // treat this as a location-only query and return candidates.
    const locationTokens = Array.isArray(parsed.locationVariants) && parsed.locationVariants.length > 0
        ? parsed.locationVariants
        : (parsed.location ? [parsed.location] : []);

    const significantIsOnlyLocation = significant.length > 0 && significant.every((t) => locationTokens.includes(t));

    if (parsed.location && (significant.length === 0 || significantIsOnlyLocation)) {
        // attach a simple score (lower is better) using computeCost so callers
        // can still sort if needed
        const scores = candidates.map((c) => ({ doc: c, cost: computeCost(searchTokens, c) }));
        scores.sort((a, b) => a.cost - b.cost);
        return scores.slice(0, limit).map(s => ({ ...s.doc, _score: s.cost }));
    }

    // compute cost per candidate
    const promptTokens = tokenize(parsed.search || prompt);
    const costs = candidates.map((c) => computeCost(promptTokens, c));

    // Sort candidates by increasing cost (heuristic value ordering)
    const indexed = candidates.map((c, i) => ({ doc: c, cost: costs[i] }));
    indexed.sort((a, b) => a.cost - b.cost);

    // CSP: variables are positions 0..limit-1; domain is indexed docs
    const bestSolution: { events: any[]; cost: number } = { events: [], cost: Infinity };

    // utility: check date conflict (same day) — treat same ISO date as conflict
    const dateConflict = (d1: string, d2: string) => {
        try {
            return String(d1).split('T')[0] === String(d2).split('T')[0];
        } catch (_) {
            return false;
        }
    };

    const maxDepth = Math.min(limit, indexed.length);

    // Backtracking with branch-and-bound using current cost
    function backtrack(pos: number, chosen: number[], used: Set<number>, currentCost: number) {
        // prune
        if (currentCost >= bestSolution.cost) return;

        if (pos === maxDepth) {
            // finished a full assignment
            if (currentCost < bestSolution.cost) {
                bestSolution.cost = currentCost;
                bestSolution.events = chosen.map((idx) => indexed[idx].doc);
            }
            return;
        }

        // If we can also stop early (allow smaller sets), consider recording
        if (chosen.length > 0 && currentCost < bestSolution.cost) {
            bestSolution.cost = currentCost;
            bestSolution.events = chosen.map((idx) => indexed[idx].doc);
            // continue searching for possibly better full-size solutions
        }

        // Domain ordering: iterate candidates in increasing cost
        for (let i = 0; i < indexed.length; i++) {
            if (used.has(i)) continue;
            const candidate = indexed[i].doc;
            // date conflict with already chosen
            let conflict = false;
            for (const ci of chosen) {
                const other = indexed[ci].doc;
                if (dateConflict(candidate.date, other.date)) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) continue;

            const newCost = currentCost + indexed[i].cost;
            // branch and bound
            if (newCost >= bestSolution.cost) continue;

            used.add(i);
            chosen.push(i);
            backtrack(pos + 1, chosen, used, newCost);
            chosen.pop();
            used.delete(i);
        }
    }

    // Start search
    backtrack(0, [], new Set(), 0);

    // return bestSolution.events (may be empty)
    return (bestSolution.events || []).map((e) => ({ ...e, _score: bestSolution.cost }));
}

export default recommendEventsCSP;
