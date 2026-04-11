<script setup lang="ts">
import { ref } from 'vue'

import { apiUrl } from '../apiBase'
import { parseApiResponseJson } from '../apiJson'

const trainingData = ref('')
const predictInput = ref('')
const trainStatus = ref<string | null>(null)
const trainError = ref<string | null>(null)
const predictOutput = ref<string | null>(null)
const predictError = ref<string | null>(null)
const training = ref(false)
const predicting = ref(false)
/** 0 = greedy (can loop on common phrases). ~0.7–1.0 = stochastic, usually more natural. */
const temperature = ref(0.85)

type TrainOk = {
  message: string
  characters?: number
  vocab_size?: number
  epochs?: number
  final_loss?: number
}
type ErrBody = { error: string }

async function trainLlm() {
  trainStatus.value = null
  trainError.value = null
  training.value = true
  try {
    const url = apiUrl('/api/train')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ training_data: trainingData.value }),
    })
    const data = await parseApiResponseJson<TrainOk & ErrBody>(res, url)
    if (!res.ok) {
      trainError.value = data.error ?? `HTTP ${res.status}`
      return
    }
    const bits =
      data.characters != null &&
      data.vocab_size != null &&
      data.epochs != null &&
      data.final_loss != null
        ? ` (${data.characters} chars, vocab ${data.vocab_size}, ${data.epochs} epochs, loss ${data.final_loss.toFixed(4)})`
        : ''
    trainStatus.value = (data.message ?? 'Trained.') + bits
  } catch (e) {
    trainError.value = e instanceof Error ? e.message : 'Request failed'
  } finally {
    training.value = false
  }
}

async function runPredict() {
  predictOutput.value = null
  predictError.value = null
  predicting.value = true
  try {
    const t = Number(temperature.value)
    const url = apiUrl('/api/predict')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: predictInput.value,
        max_tokens: 256,
        temperature: Number.isFinite(t) ? t : 0,
      }),
    })
    const data = await parseApiResponseJson<{ completion?: string } & ErrBody>(
      res,
      url,
    )
    if (!res.ok) {
      predictError.value = data.error ?? `HTTP ${res.status}`
      return
    }
    const completion = data.completion ?? ''
    predictOutput.value = predictInput.value + completion
  } catch (e) {
    predictError.value = e instanceof Error ? e.message : 'Request failed'
  } finally {
    predicting.value = false
  }
}
</script>

<template>
  <div class="workbench">
    <header class="header">
      <h1>LLM Training &amp; Prediction</h1>
      <p class="sub">
        Training fits a <strong>small character level neural net</strong> (embeddings + MLP) with
        <a href="https://github.com/huggingface/candle" target="_blank" rel="noopener">Candle</a> on
        CPU: each step predicts the next character from a fixed window. It is not GPT scale, but
        it is a learned model. Use <strong>temperature</strong> &gt; 0 for sampling instead of pure
        greedy decoding.
      </p>
      <p class="hint">
        <strong>Local:</strong> <code>cd llmbackend && cargo run</code>, backend uses
        <code>PORT</code> / <code>API_PORT</code> (default 8080) and <code>BIND_HOST</code> (default
        <code>0.0.0.0</code>). UI: <code>npm run dev</code> proxies <code>/api</code> to
        <code>BACKEND_URL</code> in <code>app/.env.development</code> (default
        <code>http://127.0.0.1:8080</code>); overrides in <code>app/.env.local</code>. Match the
        backend’s <code>PORT</code> / <code>API_PORT</code> (or set <code>BACKEND_PORT</code> /
        <code>VITE_API_PORT</code>). <strong>Vercel:</strong> set <code>BACKEND_URL</code> or
        <code>VITE_API_BASE</code> to your API origin at build time. Backend: set
        <code>CORS_ORIGINS</code> (comma separated) to your
        Vercel site URL(s).
      </p>
    </header>

    <section class="card">
      <label class="field-label" for="training">Training Data</label>
      <textarea
        id="training"
        v-model="trainingData"
        class="area"
        rows="10"
        placeholder="Paste text the model should learn from…"
        spellcheck="false"
      />
      <button type="button" class="btn primary" :disabled="training" @click="trainLlm">
        Train LLM
      </button>
      <p v-if="trainStatus" class="ok">{{ trainStatus }}</p>
      <p v-if="trainError" class="err">{{ trainError }}</p>
    </section>

    <section class="card">
      <label class="field-label" for="predict">Predict</label>
      <textarea
        id="predict"
        v-model="predictInput"
        class="area"
        rows="4"
        placeholder="Prefix text; the model appends a sampled or greedy continuation…"
        spellcheck="false"
      />
      <div class="temp-row">
        <label class="temp-label" for="temp">Temperature</label>
        <input
          id="temp"
          v-model.number="temperature"
          class="temp-input"
          type="number"
          min="0"
          max="2"
          step="0.05"
        />
        <span class="temp-hint">0 = greedy · default 0.85 = randomish, less repetitive</span>
      </div>
      <button type="button" class="btn" :disabled="predicting" @click="runPredict">Predict</button>
      <div v-if="predictOutput !== null" class="out">
        <span class="out-label">Prefix + completion</span>
        <pre class="mono">{{ predictOutput }}</pre>
      </div>
      <p v-if="predictError" class="err">{{ predictError }}</p>
    </section>
  </div>
</template>

<style scoped>
.workbench {
  max-width: 44rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  text-align: left;
}

.header h1 {
  margin: 0 0 0.5rem;
  font-size: 1.85rem;
  color: var(--text-h);
}

.sub {
  margin: 0 0 0.75rem;
  line-height: 1.55;
  color: var(--text);
}

.hint {
  margin: 0 0 2rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text);
  opacity: 0.92;
}

.card {
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-h);
}

.temp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.temp-label {
  font-weight: 600;
  color: var(--text-h);
}

.temp-input {
  width: 5rem;
  padding: 0.4rem 0.5rem;
  font: inherit;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-h);
}

.temp-hint {
  font-size: 0.85rem;
  color: var(--text);
  flex: 1 1 12rem;
}

.area {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1rem;
  padding: 0.75rem;
  font: inherit;
  line-height: 1.45;
  color: var(--text-h);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  resize: vertical;
}

.btn {
  font: inherit;
  cursor: pointer;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: var(--social-bg);
  color: var(--text-h);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.ok {
  margin: 0.75rem 0 0;
  color: var(--text-h);
}

.err {
  margin: 0.75rem 0 0;
  color: #b91c1c;
}

@media (prefers-color-scheme: dark) {
  .err {
    color: #fca5a5;
  }
}

.out {
  margin-top: 1rem;
}

.out-label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
  color: var(--text);
}

.mono {
  margin: 0;
  padding: 0.75rem;
  font-family: var(--mono);
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--code-bg);
  border-radius: 8px;
  color: var(--text-h);
}
</style>
