// ElevenLabs text to speech. The key stays on Netlify, never in the website.
// Set ELEVENLABS_API_KEY in Netlify: Site configuration > Environment variables.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel, american female

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const key = process.env.ELEVENLABS_API_KEY || process.env.elevenlabsAI;
  if (!key) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

  let text = "";
  try { ({ text } = await req.json()); } catch {}
  text = String(text || "").slice(0, 600); // keeps credit use small
  if (!text) return new Response("No text", { status: 400 });

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 }
    })
  });
  if (!r.ok) return new Response(await r.text(), { status: r.status });
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
};
