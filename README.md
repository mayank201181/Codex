# Year 7 Science Revision Dashboard

A local web app for Tanglin Trust School Year 7 science exam revision.

## Run

```bash
npm start
```

Open `http://127.0.0.1:5177`.

## AI marking setup

Create a `.env` file with:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5-mini
```

The browser never sees the API key. Written answers are sent to the local server, and the server calls the OpenAI Responses API with a structured marking schema.

## What it includes

- The nine syllabus topics from the Year 7 science exam notice.
- Study guide pages with diagrams, keywords, mnemonics, and common mistakes.
- Flashcards for each topic.
- 50 written-answer questions per topic.
- Hidden hints before answering.
- AI-marked feedback with correct, partially correct, or incorrect status.
- Marks awarded, missing points, full-mark model answer, and revision tip.
- Local mistake tracker for partial and incorrect answers.

## Deployment notes

For Vercel:

1. Go to `https://vercel.com/new`.
2. Choose the GitHub repository `mayank201181/Codex`.
3. Keep the default project settings.
4. Add these environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` with value `gpt-5-mini`
5. Deploy.

After deployment, Vercel gives you a public `https://...vercel.app` link that can be opened on an iPad.
