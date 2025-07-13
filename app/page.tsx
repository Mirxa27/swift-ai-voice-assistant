"use client";

import clsx from "clsx";
import {
        useActionState,
        useEffect,
        useRef,
        useState,
        startTransition,
} from "react";
import { toast } from "sonner";
import { EnterIcon, LoadingIcon } from "@/lib/icons";
import { usePlayer } from "@/lib/usePlayer";
import { track } from "@vercel/analytics";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { useRouter } from "next/navigation";

type Message = {
	role: "user" | "assistant";
	content: string;
	latency?: number;
};

export default function Home() {
        const [input, setInput] = useState("");
        const inputRef = useRef<HTMLInputElement>(null);
        const player = usePlayer();
        const router = useRouter();
        const [language, setLanguage] = useState("English");
        const [headline, setHeadline] = useState("");
        const [affirmation, setAffirmation] = useState("");
        const [focus, setFocus] = useState<string[]>([]);
        const [progress, setProgress] = useState<Record<string, number>>({});
        const [crisis, setCrisis] = useState(false);

        const initialMessages: Array<Message> = (() => {
                if (typeof localStorage === "undefined") return [];
                const stored = localStorage.getItem("journal");
                return stored ? JSON.parse(stored) : [];
        })();

        useEffect(() => {
                const lang = localStorage.getItem("language");
                const focusAreas = localStorage.getItem("focusAreas");
                if (!lang || !focusAreas) {
                        router.push("/onboarding");
                        return;
                }
                setLanguage(lang);
        }, [router]);

        useEffect(() => {
                const headlines = [
                        "Welcome back!",
                        "Ready to grow today?",
                        "Your journey continues!",
                ];
                const affirmations = [
                        "You are strong and capable.",
                        "Every step is progress.",
                        "Believe in yourself.",
                ];
                setHeadline(
                        headlines[Math.floor(Math.random() * headlines.length)]
                );
                setAffirmation(
                        affirmations[Math.floor(Math.random() * affirmations.length)]
                );
                const storedFocus = localStorage.getItem("focusAreas");
                if (storedFocus) setFocus(JSON.parse(storedFocus));
                const storedProgress = localStorage.getItem("progress");
                if (storedProgress) setProgress(JSON.parse(storedProgress));
        }, []);

        const vad = useMicVAD({
                startOnLoad: true,
		onSpeechEnd: (audio) => {
			player.stop();
			const wav = utils.encodeWAV(audio);
			const blob = new Blob([wav], { type: "audio/wav" });
			startTransition(() => submit(blob));
			const isFirefox = navigator.userAgent.includes("Firefox");
			if (isFirefox) vad.pause();
		},
		positiveSpeechThreshold: 0.6,
		minSpeechFrames: 4,
	});

	useEffect(() => {
		function keyDown(e: KeyboardEvent) {
			if (e.key === "Enter") return inputRef.current?.focus();
			if (e.key === "Escape") return setInput("");
		}

		window.addEventListener("keydown", keyDown);
		return () => window.removeEventListener("keydown", keyDown);
	});

        const [messages, submit, isPending] = useActionState<
                Array<Message>,
                string | Blob
        >(async (prevMessages, data) => {
		const formData = new FormData();

		if (typeof data === "string") {
			formData.append("input", data);
			track("Text input");
		} else {
			formData.append("input", data, "audio.wav");
			track("Speech input");
		}

		for (const message of prevMessages) {
			formData.append("message", JSON.stringify(message));
		}

		const submittedAt = Date.now();

                const response = await fetch("/api", {
                        method: "POST",
                        body: formData,
                        headers: { "X-Language": language },
                });

		const transcript = decodeURIComponent(
			response.headers.get("X-Transcript") || ""
		);
                const text = decodeURIComponent(response.headers.get("X-Response") || "");
                const crisisHeader = response.headers.get("X-Crisis") === "1";

                if (!response.ok || !transcript || !text || !response.body) {
                        if (response.status === 429) {
                                toast.error("Too many requests. Please try again later.");
                        } else {
                                toast.error((await response.text()) || "An error occurred.");
                        }

                        return prevMessages;
                }

                const latency = Date.now() - submittedAt;
                player.play(response.body, () => {
                        const isFirefox = navigator.userAgent.includes("Firefox");
                        if (isFirefox) vad.start();
                });
                if (crisisHeader) setCrisis(true);
                setInput(transcript);

                const stored = localStorage.getItem("progress");
                const next: Record<string, number> = stored ? JSON.parse(stored) : {};
                for (const area of focus) {
                        next[area] = Math.min(100, (next[area] ?? 0) + 5);
                }
                localStorage.setItem("progress", JSON.stringify(next));
                setProgress(next);

                return [
                        ...prevMessages,
                        {
                                role: "user",
				content: transcript,
			},
			{
				role: "assistant",
				content: text,
				latency,
			},
		];
        }, initialMessages);

        useEffect(() => {
                localStorage.setItem("journal", JSON.stringify(messages));
        }, [messages]);

        function handleFormSubmit(e: React.FormEvent) {
                e.preventDefault();
                if (!crisis) startTransition(() => submit(input));
        }

        return (
                <>
                        {crisis && (
                                <div className="p-4 mb-4 bg-red-100 border border-red-300 rounded text-red-800 max-w-xl text-center space-y-2">
                                        <p>
                                                It sounds like you are going through a very difficult time. For immediate help, please contact the Saudi crisis hotline at <a href="tel:937" className="underline">937</a> or your local emergency services.
                                        </p>
                                        <button onClick={() => setCrisis(false)} className="px-4 py-2 bg-red-600 text-white rounded">
                                                Dismiss
                                        </button>
                                </div>
                        )}
                        <div className="pb-4 min-h-28" />
                        <div className="space-y-2 text-center mb-6">
                                <h1 className="text-2xl font-bold">{headline}</h1>
                                <p className="text-sm">{affirmation}</p>
                                {focus.length > 0 && (
                                        <div className="space-y-2">
                                                {focus.map((area) => (
                                                        <div key={area}>
                                                                <div className="flex justify-between text-sm">
                                                                        <span>{area}</span>
                                                                        <span>{progress[area] ?? 0}%</span>
                                                                </div>
                                                                <div className="h-2 bg-neutral-200 rounded">
                                                                        <div
                                                                                className="h-2 bg-blue-500 rounded"
                                                                                style={{ width: `${progress[area] ?? 0}%` }}
                                                                        />
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                )}
                        </div>

			<form
				className="rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 flex items-center w-full max-w-3xl border border-transparent hover:border-neutral-300 focus-within:border-neutral-400 hover:focus-within:border-neutral-400 dark:hover:border-neutral-700 dark:focus-within:border-neutral-600 dark:hover:focus-within:border-neutral-600"
				onSubmit={handleFormSubmit}
			>
                                <input
                                        type="text"
                                        className="bg-transparent focus:outline-hidden p-4 w-full placeholder:text-neutral-600 dark:placeholder:text-neutral-400"
                                        required
                                        placeholder="Ask me anything"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        ref={inputRef}
                                        disabled={crisis}
                                />

				<button
					type="submit"
					className="p-4 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                                        disabled={isPending || crisis}
					aria-label="Submit"
				>
					{isPending ? <LoadingIcon /> : <EnterIcon />}
				</button>
			</form>

			<div className="text-neutral-400 dark:text-neutral-600 pt-4 text-center max-w-xl text-balance min-h-28 space-y-4">
				{messages.length > 0 && (
					<p>
						{messages.at(-1)?.content}
						<span className="text-xs font-mono text-neutral-300 dark:text-neutral-700">
							{" "}
							({messages.at(-1)?.latency}ms)
						</span>
					</p>
				)}

				{messages.length === 0 && (
					<>
						<p>
							A fast, open-source voice assistant powered by{" "}
							<A href="https://groq.com">Groq</A>,{" "}
							<A href="https://cartesia.ai">Cartesia</A>,{" "}
							<A href="https://www.vad.ricky0123.com/">VAD</A>, and{" "}
							<A href="https://vercel.com">Vercel</A>.{" "}
                                                        <A href="https://github.com/ai-ng/newomen" target="_blank">
                                                                Learn more
                                                        </A>
                                                        .
                                                </p>

                                                <p>
                                                        <A href="/admin">
                                                                Admin Panel
                                                        </A>
                                                </p>
                                                <p>
                                                        <A href="/balance">
                                                                Balance Wheel
                                                        </A>
                                                </p>
                                                <p>
                                                        <A href="/journal">
                                                                Journal
                                                        </A>
                                                </p>

						{vad.loading ? (
							<p>Loading speech detection...</p>
						) : vad.errored ? (
							<p>Failed to load speech detection.</p>
						) : (
							<p>Start talking to chat.</p>
						)}
					</>
				)}
			</div>

			<div
				className={clsx(
					"absolute size-36 blur-3xl rounded-full bg-linear-to-b from-red-200 to-red-400 dark:from-red-600 dark:to-red-800 -z-50 transition ease-in-out",
					{
						"opacity-0": vad.loading || vad.errored,
						"opacity-30": !vad.loading && !vad.errored && !vad.userSpeaking,
						"opacity-100 scale-110": vad.userSpeaking,
					}
				)}
			/>
		</>
	);
}

function A(props: any) {
	return (
		<a
			{...props}
			className="text-neutral-500 dark:text-neutral-500 hover:underline font-medium"
		/>
	);
}
