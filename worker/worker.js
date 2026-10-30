// Cloudflare Worker: ponte segura entre o site e a API do Google Gemini (AI Studio).
const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.8-flash-lite";

export default {
  async fetch(request, env) {
    const origin = (env.ALLOWED_ORIGIN || "*").replace(/\/$/, "");
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

    const apiKey = (env.GEMINI_API_KEY || "").trim();
    if (!apiKey)
      return reply({ error: "GEMINI_API_KEY não configurada nas variáveis do Worker" }, 500);

    // Função auxiliar para chamar o Gemini
    const callGemini = async (modelName) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });
    };

    // 1. Tenta o modelo principal
    let r = await callGemini(PRIMARY_MODEL);

    // 2. Se der 503 (sobrecarga) ou 429 (limite momentâneo), tenta o modelo Lite imediatamente
    if (r.status === 503 || r.status === 429) {
      r = await callGemini(FALLBACK_MODEL);
    }

    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      const msg = errData?.error?.message || `Erro HTTP ${r.status} na API do Gemini`;
      return reply({ error: `Falha na IA: ${msg}` }, 502);
    }

    const data = await r.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
    .filter((p) => !p.thought)
    .map((p) => p.text || "")
    .join("");

    return reply({ text });
  },
};
