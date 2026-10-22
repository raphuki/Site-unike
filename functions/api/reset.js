// Zera as métricas. Protegido: só funciona com a chave correta (aqui fica apenas o hash).
const HASH = '473bc6dd678ef49ee8a06c761d1ebd293ac587b0c25b82476771de7f28bf6b37';
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function onRequestPost({ request, env }) {
  const h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  const key = request.headers.get('x-key') || '';
  if (!key || (await sha(key)) !== HASH) return new Response('{"ok":false}', { status: 403, headers: h });
  if (!env.DB) return new Response('{"ok":false,"err":"sem banco"}', { status: 503, headers: h });
  await env.DB.prepare('DELETE FROM s').run();
  return new Response('{"ok":true}', { headers: h });
}
