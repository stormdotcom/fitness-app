import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import clips from './voice-manifest.json' with { type: 'json' }
import { voicePhrases } from './session.js'
import { makeAudio } from './audio.js'

test('every possible cue has a non-silent, valid bundled recording', async () => {
  assert.deepEqual(Object.keys(clips).sort(), voicePhrases().sort())
  for (const [phrase, path] of Object.entries(clips)) {
    const wav = await readFile(new URL(`../public${path}`, import.meta.url))
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF', phrase)
    assert.equal(wav.toString('ascii', 8, 12), 'WAVE', phrase)
    const duration = (wav.length - 44) / wav.readUInt32LE(28)
    assert.ok(duration > 0.1 && duration < 8, `${phrase}: ${duration}s`)
    let peak = 0
    for (let i = 44; i < wav.length; i += 4) peak = Math.max(peak, Math.abs(wav.readFloatLE(i)))
    assert.ok(peak > 0.02 && peak <= 1, `${phrase}: peak ${peak}`)
  }
})

test('cancellation prevents delayed downloads from playing and completion schedules once', async t => {
  const sources = []
  let release
  const downloaded = new Promise(resolve => { release = resolve })
  t.mock.method(globalThis, 'fetch', async () => { await downloaded; return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) } })
  const originalWindow = globalThis.window
  globalThis.window = { AudioContext: class {
    state = 'running'
    decodeAudioData() { return Promise.resolve({ duration: 1 }) }
    createBufferSource() {
      const source = { connect() {}, disconnect() {}, start() { sources.push(this) }, stop() {} }
      return source
    }
    close() { return Promise.resolve() }
  } }
  t.after(() => { globalThis.window = originalWindow })
  const audio = makeAudio()
  t.after(() => audio.close())
  await audio.unlock()
  let completions = 0
  const cancelled = audio.say('Ready.', 'Steady', () => completions++)
  audio.stop()
  release()
  assert.equal(await cancelled, false)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sources.length, 0)
  assert.equal(completions, 0)
  const played = audio.say('Ready.', 'Steady', () => completions++)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sources.length, 1)
  sources[0].onended()
  assert.equal(await played, true)
  assert.equal(completions, 1)
})

test('failed audio still releases the cue scheduler', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline') })
  const audio = makeAudio()
  let completions = 0
  assert.equal(await audio.say('Ready.', 'Steady', () => completions++), false)
  assert.equal(completions, 1)
})
