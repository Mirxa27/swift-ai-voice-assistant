# Newomen

Newomen is a fast AI voice assistant focused on personal growth.

-   [Groq](https://groq.com) is used for fast inference of [OpenAI Whisper](https://github.com/openai/whisper) (for transcription) and [Meta Llama 3](https://llama.meta.com/llama3/) (for generating the text response).
-   [Cartesia](https://cartesia.ai)'s [Sonic](https://cartesia.ai/sonic) voice model is used for fast speech synthesis, which is streamed to the frontend.
-   [VAD](https://www.vad.ricky0123.com/) is used to detect when the user is talking, and run callbacks on speech segments.
-   The app is a [Next.js](https://nextjs.org) project written in TypeScript and deployed to [Vercel](https://vercel.com).

Thank you to the teams at Groq and Cartesia for providing access to their APIs for this demo!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-ng%2Fnewomen&env=GROQ_API_KEY,CARTESIA_API_KEY&envDescription=Groq%20and%20Cartesia's%20APIs%20are%20used%20for%20transcription%2C%20text%20generation%2C%20and%20speech%20synthesis.&project-name=newomen&repository-name=newomen&demo-title=Newomen&demo-description=A%20fast%2C%20open-source%20voice%20assistant%20powered%20by%20Groq%2C%20Cartesia%2C%20and%20Vercel.&demo-url=https%3A%2F%2Fnewomen.vercel.app&demo-image=https%3A%2F%2Fnewomen.vercel.app%2Fopengraph-image.png)

## Developing

-   Clone the repository
-   Copy `.env.example` to `.env.local`.
-   Set `GROQ_API_KEY` and `CARTESIA_API_KEY` in `.env.local` so the assistant can transcribe and speak.
-   Run `pnpm install` to install dependencies.
-   Run `pnpm dev` to start the development server.
-   Run `pnpm lint` to check code style.
-   Run `pnpm build` to generate a production build.


On first launch, visit `/onboarding` to choose your language and focus areas. These settings are saved in your browser for future visits.
Progress for each focus area increases slightly with every conversation.
Visit `/balance` to visualize your progress on the Balance Wheel.
Visit `/journal` to review past conversations.
Use the **Clear Journal** button on that page to remove stored chats.
Set `ADMIN_SECRET` and `ADMIN_OTP_SECRET` in `.env.local` and visit `/admin` to manage prompts and AI provider settings. Log in with `ADMIN_SECRET` followed by a TOTP code generated from `ADMIN_OTP_SECRET` (e.g. `Bearer SECRET:123456`). The dashboard shows prompt, provider, and crisis report counts.
The selected language is sent to the server so responses use either Arabic or Saudi-style English.
If a crisis is detected in conversation, the chat locks and a hotline for immediate help is displayed.
Admin users can review and clear any crisis reports via the panel.
Provider settings are stored in `providers.json` and can be edited from the admin panel.
Run `pnpm backup` to save a timestamped copy of `providers.json`, `prompts.json`, and `crisis.json` in the `backup` folder.

## Usage

1. Open the app and complete the onboarding flow to choose your language and focus areas.
2. Ask questions by typing or speaking into your microphone.
3. Listen to the spoken response and watch your progress bars update after each chat.
4. Visit `/admin` to view your saved settings, progress, and API key status.



## Documentation
- [Product Requirements](docs/PRD.md)
- [AI Content Management SOP](docs/SOP-AI-Content.md)
- [User Safety Protocol](docs/SOP-User-Safety.md)
