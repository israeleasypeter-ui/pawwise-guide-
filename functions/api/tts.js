export async function onRequestPost({ request, env }) {
  try {
    const { text, reference_id } = await request.json();
    if (typeof text !== "string" || !text.trim() || text.length > 6000) {
      return new Response("Provide up to 6,000 characters of text.", { status: 400 });
    }
    const allowedVoices = new Set([
      "404371ea0f224c17bf02e84f9061d8d5",
      "05c960cf7ded42e4a9812409988f05b4",
    ]);
    const voice = allowedVoices.has(reference_id) ? reference_id : "404371ea0f224c17bf02e84f9061d8d5";
    if (!env.FISH_AUDIO_API_KEY) {
      return new Response("Fish Audio is not configured.", { status: 503 });
    }
    const fish = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({ text, reference_id: voice, format: "mp3" }),
    });
    if (!fish.ok) return new Response("Fish Audio request failed.", { status: fish.status });
    return new Response(fish.body, { headers: { "Content-Type": fish.headers.get("Content-Type") || "audio/mpeg", "Cache-Control": "no-store" } });
  } catch {
    return new Response("Invalid narration request.", { status: 400 });
  }
}