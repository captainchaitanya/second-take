# Second Take

A conversation-practice demo in an iPhone-style frame. Pick a difficult conversation, choose replies, watch the other person shift, and get line-by-line notes at the end.

This is a concept project by Chaitanya Raj. Not affiliated with any company.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Useful scripts:

```bash
npm run validate   # check every scene JSON file
npm run build      # validate, typecheck, and build for production
npm run preview    # serve the production build
```

## Add a scene

1. Copy an existing file in `src/data/scenes/` (for example `raise-conversation.json`) to a new file in the same folder.
2. Give it a unique `id`, fill in the partner, turns, choices, and endings.
3. Export the new file from `src/data/scenes/index.ts`.
4. Run `npm run validate`.

Each turn needs exactly three choices — one `strong`, one `subtle`, one `backfire`. Non-strong choices need a `betterLine`. Mood lines (`guarded`, `neutral`, `open`) are required on every `partnerLine` and on `endings`.

Partner also needs `hiddenWant`, `softensWhen`, and `digsInWhen`. Add a `rubric` of 3–4 skills. Every choice needs a `skills` score (`-1 | 0 | 1`) for each skill id; strong choices need at least one `+1`. Optional `trigger` labels must match the partner lists.

## Deploy to Vercel

Zero config. Import the GitHub repo in Vercel, leave the framework preset on Vite, and deploy. The build command is `npm run build` and the output directory is `dist`.

You can also deploy from the CLI:

```bash
npx vercel
```
