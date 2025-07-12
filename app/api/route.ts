import Groq from "groq-sdk";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { after } from "next/server";

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

	const { data, success } = schema.safeParse(await request.formData());
	if (!success) return new Response("Invalid request", { status: 400 });

	const transcript = await getTranscript(data.input);
	if (!transcript) return new Response("Invalid audio", { status: 400 });

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
                                content: `- You are Newomen, a friendly and helpful voice assistant.
			- Respond briefly to the user's request, and do not provide unnecessary information.
			- If you don't understand the user's request, ask for clarification.
			- You do not have access to up-to-date information, so you should not provide real-time data.
			- You are not capable of performing actions other than responding to the user.
			- Do not use markdown, emojis, or other formatting in your responses. Respond in a way easily spoken by text-to-speech software.
			- User location is ${await location()}.
			- The current time is ${await time()}.
			- Your large language model is Llama 3, created by Meta, the 8 billion parameter version. It is hosted on Groq, an AI infrastructure company that builds fast inference technology.
			- Your text-to-speech model is Sonic, created and hosted by Cartesia, a company that builds fast and realistic speech synthesis technology.
			- You are built with Next.js and hosted on Vercel.`,
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
                response = crisisMessage;
        }
	console.timeEnd(
		"text completion " + request.headers.get("x-vercel-id") || "local"
	);

	if (!response) return new Response("Invalid response", { status: 500 });

	console.time(
		"cartesia request " + request.headers.get("x-vercel-id") || "local"
	);

	const voice = await fetch("https://api.cartesia.ai/tts/bytes", {
		method: "POST",
		headers: {
			"Cartesia-Version": "2024-06-30",
			"Content-Type": "application/json",
			"X-API-Key": process.env.CARTESIA_API_KEY!,
		},
		body: JSON.stringify({
			model_id: "sonic-english",
			transcript: response,
			voice: {
				mode: "id",
				id: "79a125e8-cd45-4c13-8a67-188112f4dd22",
			},
			output_format: {
				container: "raw",
				encoding: "pcm_f32le",
				sample_rate: 24000,
			},
		}),
	});

	console.timeEnd(
		"cartesia request " + request.headers.get("x-vercel-id") || "local"
	);

	if (!voice.ok) {
		console.error(await voice.text());
		return new Response("Voice synthesis failed", { status: 500 });
	}

	console.time("stream " + request.headers.get("x-vercel-id") || "local");
	after(() => {
		console.timeEnd("stream " + request.headers.get("x-vercel-id") || "local");
	});

        return new Response(voice.body, {
                headers: {
                        "X-Transcript": encodeURIComponent(transcript),
                        "X-Response": encodeURIComponent(response),
                        ...(crisisDetected ? { "X-Crisis": "1" } : {}),
                },
        });
}

async function location() {
	const headersList = await headers();

	const country = headersList.get("x-vercel-ip-country");
	const region = headersList.get("x-vercel-ip-country-region");
	const city = headersList.get("x-vercel-ip-city");

	if (!country || !region || !city) return "unknown";

	return `${city}, ${region}, ${country}`;
}

async function time() {
	const headersList = await headers();
	const timeZone = headersList.get("x-vercel-ip-timezone") || undefined;
	return new Date().toLocaleString("en-US", { timeZone });
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
