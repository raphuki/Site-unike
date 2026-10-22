// Registro anônimo de acessos do site (Cloudflare Pages Function + D1, binding "DB")
let ready = false;
async function init(db) {
  if (ready) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS s(
    sid TEXT PRIMARY KEY, vid TEXT, ts INTEGER, mob INTEGER,
    intro INTEGER DEFAULT 0, maxc INTEGER DEFAULT -1, maxs INTEGER DEFAULT -1, wa INTEGER DEFAULT 0)`).run();
  ready = true;
}
const ok = (b, st = 200) => new Response(JSON.stringify(b), { status: st, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (v) => String(v || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

export async function onRequestPost({ request, env }) {
  if (!env.DB) return ok({ ok: false, err: 'sem banco' }, 503);
  let d; try { d = await request.json(); } catch { return ok({ ok: false }, 400); }
  const sid = clean(d.sid), vid = clean(d.vid);
  if (!sid) return ok({ ok: false }, 400);
  const db = env.DB; await init(db);
  await db.prepare('INSERT OR IGNORE INTO s(sid,vid,ts,mob) VALUES(?,?,?,?)').bind(sid, vid, Date.now(), d.mob ? 1 : 0).run();
  if (d.e === 'intro') await db.prepare('UPDATE s SET intro=1 WHERE sid=?').bind(sid).run();
  else if (d.e === 'step') await db.prepare('UPDATE s SET maxc=MAX(maxc,?), maxs=MAX(maxs,?) WHERE sid=?').bind(d.c | 0, d.s | 0, sid).run();
  else if (d.e === 'wa') await db.prepare('UPDATE s SET wa=wa+1 WHERE sid=?').bind(sid).run();
  return ok({ ok: true });
}
