import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { KokoroTTS } from 'kokoro-js'
import { voicePhrases } from '../src/session.js'
import { trimSilence } from './trim-silence.mjs'

const output = new URL('../public/audio/coach/', import.meta.url)
await mkdir(output, { recursive: true })
console.log('Loading Kokoro voice model…')
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
  dtype: 'q8', device: 'cpu',
})
const manifest = {}
const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
for (const phrase of voicePhrases()) {
  const filename = `${createHash('sha256').update(phrase).digest('hex').slice(0, 16)}.wav`
  // Spell out numbers so combinations are read as separate punch calls.
  const text = phrase.replace(/\b\d+\b/g, number => words[Number(number)] ?? number)
  const audio = await tts.generate(text, { voice: 'af_heart', speed: 1.08 })
  audio.audio = trimSilence(audio.audio, audio.sampling_rate)
  await audio.save(fileURLToPath(new URL(filename, output)))
  manifest[phrase] = `/audio/coach/${filename}`
  console.log(`Generated ${Object.keys(manifest).length}: ${phrase}`)
}
await writeFile(new URL('../src/voice-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n')
console.log('Voice pack complete.')
