# Little LM

Little LM is a **free and open source**, **LLM-style** artificial intelligence project. It is built for **learning**—so you can see how training and text completion fit together in a small, understandable stack—and for **whatever else you want to use it for**, as long as that fits your own goals and any license terms that apply to this repository.

The companion web app (this package) is a **Vue 3 + TypeScript + Vite** front end. It talks to a **separate backend** over HTTP: you paste or load **training text**, call **train**, then send **prompts** and read **completions**, with controls such as **temperature** for sampling behavior. That workflow mirrors the “train / infer” shape of larger language models, at a scale suited to experimentation and teaching.

## What you need

- **Node.js 20+**
- A running **API server** that implements the backend routes (for example `/api/train` and `/api/predict` as used by this app). The dev server proxies `/api` to that backend.

## Install and run

From the **frontend monorepo root** (the folder that contains `app/`):

```bash
cd littlelmfrontend
npm install
npm run dev
```

Or work **only inside this app**:

```bash
cd littlelmfrontend/app
npm install
npm run dev
```

Configure where the backend lives via environment variables. Copy `.env.example` to `.env.local` if you want local overrides. By default, development expects the API at `http://127.0.0.1:8080` (see `BACKEND_URL` in `.env.development` / `.env.example` and the Vite proxy in `vite.config.ts`).

## Other scripts

| Command        | Purpose                                      |
| -------------- | -------------------------------------------- |
| `npm run dev`  | Start Vite dev server with `/api` proxy      |
| `npm run build`| Type-check and production build              |
| `npm run preview` | Serve the production build locally      |

## Production API URL

For a production build, set an API origin (for example `VITE_API_BASE` or `BACKEND_URL` at build time) so browser requests reach your deployed backend. Details are documented in `src/apiBase.ts` and `.env.example`.

---

This README describes the **web client**. Backend setup belongs with whichever server implementation you pair with this project.
