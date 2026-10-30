// Cloudflare Worker: ponte segura entre o site e a API da Anthropic.
// Segredos/variáveis (Settings > Variables and Secrets):
//   ANTHROPIC_API_KEY  (secret)  -> sua chave da API
//   ALLOWED_ORIGIN     (texto)   -> ex.: https://seuusuario.github.io
const MODEL = "claude-haiku-5-5";

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const reply = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
      });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return reply({ error: "Método não permitido" }, 405);

    if (origin !== "*" && request.headers.get("Origin") !== origin)
      return reply({ error: "Origem não permitida" }, 403);

    let prompt;
    try {
      ({ prompt } = await request.json());
    } catch {
      return reply({ error: "JSON inválido" }, 400);
    }
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 8000)
      return reply({ error: "Prompt inválido" }, 400);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return reply({ error: "Falha na IA" }, 502);

    const data = await r.json();
    const text = (data.content || []).map((b) => b.text || "").join("");
    return reply({ text });
  },
};
