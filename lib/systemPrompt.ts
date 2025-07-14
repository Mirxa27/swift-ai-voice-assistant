import { headers } from 'next/headers';

async function location() {
  try {
    const h = await headers();
    const country = h.get('x-vercel-ip-country');
    const region = h.get('x-vercel-ip-country-region');
    const city = h.get('x-vercel-ip-city');
    if (!country || !region || !city) return 'unknown';
    return `${city}, ${region}, ${country}`;
  } catch {
    return 'unknown';
  }
}

async function time() {
  try {
    const h = await headers();
    const timeZone = h.get('x-vercel-ip-timezone') || undefined;
    return new Date().toLocaleString('en-US', { timeZone });
  } catch {
    return new Date().toLocaleString('en-US');
  }
}

export async function systemPrompt(language: string): Promise<string> {
  const base = `- You are Newomen, a friendly and helpful voice assistant.
- Respond briefly to the user's request, and do not provide unnecessary information.
- If you don't understand the user's request, ask for clarification.
- You do not have access to up-to-date information, so you should not provide real-time data.
- You are not capable of performing actions other than responding to the user.
- Do not use markdown, emojis, or other formatting in your responses. Respond in a way easily spoken by text-to-speech software.
- User location is ${await location()}.
- The current time is ${await time()}.
- Your large language model is Llama 3, hosted on Groq.
- Your text-to-speech model is Sonic from Cartesia.
- You are built with Next.js and hosted on Vercel.`;
  if (language === 'Arabic') {
    return base + '\n- Speak in Arabic.';
  }
  return base +
    '\n- Speak in English using occasional Arabic expressions such as Salamualaikum and Inshallah.';
}
