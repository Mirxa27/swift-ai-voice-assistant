import Groq from "groq-sdk";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { after } from "next/server";
import { addReport } from "../../lib/crisis";
import { systemPrompt } from "../../lib/systemPrompt";

// Short message returned when the assistant detects a user may be in crisis.
// The content matches the policy defined in docs/SOP-User-Safety.md
const CRISIS_MESSAGE =
  "I'm concerned about your safety. Please contact your local crisis hotline or dial 988 if you are in the US.";

// Basic keyword matcher used to guard against self harm queries.
// This is intentionally simple to keep the runtime fast.
function containsCrisis(text: string) {
  const lower = text.toLowerCase();
  return [
    "suicide",
    "suicidal",
    "kill myself",
    "kill yourself",
    "harm myself",
    "hurt myself",
    "end my life",
    "self harm",
  ].some((kw) => lower.includes(kw));
}

async function synthesizeVoice(text: string) {
  const voice = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "Cartesia-Version": "2024-06-30",
      "Content-Type": "application/json",
      "X-API-Key": process.env.CARTESIA_API_KEY!,
    },
    body: JSON.stringify({
      model_id: "sonic-english",
      transcript: text,
      voice: { mode: "id", id: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
      output_format: {
        container: "raw",
        encoding: "pcm_f32le",
        sample_rate: 24000,
      },
    }),
  });

  if (!voice.ok) {
    console.error(await voice.text());
    throw new Error("Voice synthesis failed");
  }

  return voice;
}

let groq: Groq | null = null;
function getGroq() {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set");
    return null;
  }
  groq = new Groq({ apiKey });
  return groq;
}

const schema = zfd.formData({
	input: z.union([zfd.text(), zfd.file()]),
	message: zfd.repeatableOfType(
		zfd.json(
			z.object({
				role: z.enum(["user", "assistant"]),
				content: z.string(),
			})
		)
	),
});

export async function POST(request: Request) {
        console.time("transcribe " + request.headers.get("x-vercel-id") || "local");

        const language = request.headers.get("x-language") || "English";

	const { data, success } = schema.safeParse(await request.formData());
	if (!success) return new Response("Invalid request", { status: 400 });

        const transcript = await getTranscript(data.input);
        if (!transcript) return new Response("Invalid audio", { status: 400 });

        if (containsCrisis(transcript)) {
                const voice = await synthesizeVoice(CRISIS_MESSAGE);
                return new Response(voice.body, {
                        headers: {
                                "X-Transcript": encodeURIComponent(transcript),
                                "X-Response": encodeURIComponent(CRISIS_MESSAGE),
                        },
                });
        }

	console.timeEnd(
		"transcribe " + request.headers.get("x-vercel-id") || "local"
	);
	console.time(
		"text completion " + request.headers.get("x-vercel-id") || "local"
	);

        const groqClient = getGroq();
        if (!groqClient)
                return new Response("Server configuration error", { status: 500 });

        const completion = await groqClient.chat.completions.create({
		model: "llama3-8b-8192",
		messages: [
			{
				role: "system",
                                content: await systemPrompt(language),
			},
			...data.message,
			{
				role: "user",
				content: transcript,
			},
		],
	});

        let response = completion.choices[0].message.content || "";
        const crisisKeywords = [
                "suicide",
                "kill myself",
                "self harm",
                "harm myself",
                "abuse",
        ];
        const crisisMessage =
                "It sounds like you are going through a very difficult time. For your safety, please contact a local crisis hotline or trusted professional.";

        const transcriptLower = transcript.toLowerCase();
        const responseLower = response.toLowerCase();
        const crisisDetected = crisisKeywords.some(
                (k) => transcriptLower.includes(k) || responseLower.includes(k)
        );
        if (crisisDetected) {
                console.warn("Crisis detected in conversation");
                await addReport(transcript);
                response = crisisMessage;
        }
	console.timeEnd(
		"text completion " + request.headers.get("x-vercel-id") || "local"
	);


        if (!response) return new Response("Invalid response", { status: 500 });

        const finalText = containsCrisis(response) ? CRISIS_MESSAGE : response;

        console.time(
                "cartesia request " + request.headers.get("x-vercel-id") || "local"
        );

        let voice: Response;
        try {
                voice = await synthesizeVoice(finalText);
        } catch {
                return new Response("Voice synthesis failed", { status: 500 });
        }

        console.timeEnd(
                "cartesia request " + request.headers.get("x-vercel-id") || "local"
        );

	console.time("stream " + request.headers.get("x-vercel-id") || "local");
	after(() => {
		console.timeEnd("stream " + request.headers.get("x-vercel-id") || "local");
	});

        return new Response(voice.body, {
                headers: {
                        "X-Transcript": encodeURIComponent(transcript),
                        "X-Response": encodeURIComponent(finalText),
                        ...(crisisDetected ? { "X-Crisis": "1" } : {}),
                },
        });
}

async function location() {
        try {
                const headersList = await headers();

                const country = headersList.get("x-vercel-ip-country");
                const region = headersList.get("x-vercel-ip-country-region");
                const city = headersList.get("x-vercel-ip-city");

                if (!country || !region || !city) return "unknown";

                return `${city}, ${region}, ${country}`;
        } catch {
                return "unknown";
        }
}

async function time() {
        try {
                const headersList = await headers();
                const timeZone = headersList.get("x-vercel-ip-timezone") || undefined;
                return new Date().toLocaleString("en-US", { timeZone });
        } catch {
                return new Date().toLocaleString("en-US");
        }
}



async function getTranscript(input: string | File) {
        if (typeof input === "string") return input;

        const groqClient = getGroq();
        if (!groqClient) return null;

        try {
                const { text } = await groqClient.audio.transcriptions.create({
                        file: input,
                        model: "whisper-large-v3",
                });

		return text.trim() || null;
	} catch {
		return null; // Empty audio file
	}
}