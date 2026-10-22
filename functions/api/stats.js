// Números para o painel escondido do site
export async function onRequestGet({ request, env }) {
  const h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (!env.DB) return new Response(JSON.stringify({ ok: false, err: 'sem banco' }), { status: 503, headers: h });
  const since = Number(new URL(request.url).searchParams.get('since')) || 0;
  const db = env.DB;
  try {
    const tot = await db.prepare(`SELECT COUNT(*) sess, COUNT(DISTINCT vid) vis, COALESCE(SUM(mob),0) mob, COALESCE(SUM(intro),0) intro,
      COALESCE(SUM(CASE WHEN wa>0 THEN 1 ELSE 0 END),0) waPeople, COALESCE(SUM(wa),0) waClicks FROM s WHERE ts>=?`).bind(since).first();
    const ch = await db.prepare('SELECT maxc c, COUNT(*) n FROM s WHERE ts>=? GROUP BY maxc').bind(since).all();
    return new Response(JSON.stringify({ ok: true, tot, ch: ch.results }), { headers: h });
  } catch (e) {
    if (String(e).includes('no such table')) return new Response(JSON.stringify({ ok: true, tot: { sess: 0, vis: 0, mob: 0, intro: 0, waPeople: 0, waClicks: 0 }, ch: [] }), { headers: h });
    return new Response(JSON.stringify({ ok: false, err: String(e) }), { status: 500, headers: h });
  }
}
