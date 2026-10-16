// ElevenLabs text to speech. The key stays on Netlify, never in the website.
// Set ELEVENLABS_API_KEY in Netlify: Site configuration > Environment variables.
// American voices that come free with every ElevenLabs account, tried in order
const VOICES = [
  process.env.ELEVENLABS_VOICE_ID,
  "EXAVITQu4vr4xnSDxMaL", // Sarah
  "cgSgspJ2msm6clMCkdW9", // Jessica
  "9BWtsMINqrJLrRacOk9x", // Aria
  "nPczCjzI2devNBz1zQrb", // Brian
  "iP95p4xoKVk53GoZ742B"  // Chris
].filter(Boolean);

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const key = process.env.ELEVENLABS_API_KEY || process.env.elevenlabsAI;
  if (!key) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

  let text = "";
  try { ({ text } = await req.json()); } catch {}
  text = String(text || "").slice(0, 600); // keeps credit use small
  if (!text) return new Response("No text", { status: 400 });

  let r, lastErr = "";
  for (const voice of VOICES) {
    r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 }
      })
    });
    if (r.ok) break;
    lastErr = await r.text();
    if (r.status === 401) break; // bad key, no point trying other voices
  }
  if (!r.ok) return new Response(lastErr, { status: r.status });
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
};
