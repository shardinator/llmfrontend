<script setup lang="ts">
import { onMounted, ref } from 'vue'

type HelloResponse = { message: string }

const loading = ref(true)
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const health = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  message.value = null
  health.value = null
  try {
    const [helloRes, healthRes] = await Promise.all([
      fetch('/api/hello'),
      fetch('/api/health'),
    ])
    if (!helloRes.ok) {
      throw new Error(`hello: ${helloRes.status}`)
    }
    if (!healthRes.ok) {
      throw new Error(`health: ${healthRes.status}`)
    }
    const data = (await helloRes.json()) as HelloResponse
    message.value = data.message
    const healthJson = (await healthRes.json()) as { status: string }
    health.value = healthJson.status
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div id="center">
    <h1>Vue + Axum</h1>
    <p class="lede">
      The browser talks to Vite on port 5173; <code>/api/*</code> is proxied to the Rust
      server on port 3000.
    </p>

    <div class="panel">
      <p v-if="loading" class="status">Contacting backend…</p>
      <p v-else-if="error" class="status err">
        {{ error }}
        <br />
        <span class="hint">Start the API: <code>cd backend && cargo run</code></span>
      </p>
      <template v-else>
        <p class="status ok">Backend health: <code>{{ health }}</code></p>
        <p class="message">{{ message }}</p>
      </template>
      <button type="button" class="retry" :disabled="loading" @click="load">
        Retry
      </button>
    </div>
  </div>
</template>

<style scoped>
.lede {
  max-width: 36rem;
  margin: 0;
  line-height: 1.5;
}

.panel {
  width: min(100%, 28rem);
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  text-align: left;
}

.status {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
}

.status.ok {
  color: var(--text);
}

.status.err {
  color: #b91c1c;
}

@media (prefers-color-scheme: dark) {
  .status.err {
    color: #fca5a5;
  }
}

.hint {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text);
  opacity: 0.9;
}

.message {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: var(--text-h);
  font-weight: 500;
}

.retry {
  font: inherit;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
