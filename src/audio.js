import clips from './voice-manifest.json' with { type: 'json' }

export function makeAudio() {
  let context
  let activeSpeech
  const notes = new Set()
  const buffers = new Map()

  function load(message) {
    const url = clips[message]
    if (!url || !context) return Promise.reject(new Error('Voice clip unavailable'))
    if (!buffers.has(url)) {
      const decoder = context
      const pending = fetch(url, { signal: AbortSignal.timeout(8000) })
        .then(response => {
          if (!response.ok) throw new Error('Voice download failed')
          return response.arrayBuffer()
        })
        .then(bytes => decoder.decodeAudioData(bytes))
        .catch(error => { buffers.delete(url); throw error })
      buffers.set(url, pending)
    }
    return buffers.get(url)
  }

  function unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    try {
      context ??= new AudioContext()
      const ready = context.state === 'running' ? Promise.resolve() : context.resume()
      // Warm the small, fixed pack so workout cues start without network delays.
      for (const message of Object.keys(clips)) load(message).catch(() => {})
      return ready
    } catch {
      return
    }
  }

  function bell() {
    if (context?.state !== 'running') return
    const start = context.currentTime
    for (const [frequency, volume, decay] of [[784, 0.22, 0.9], [1318, 0.085, 0.58], [2093, 0.045, 0.28]]) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.frequency.value = frequency
      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(volume, start + 0.012)
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + decay)
      oscillator.connect(envelope).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(start + decay)
      notes.add(oscillator)
      oscillator.onended = () => {
        oscillator.disconnect()
        envelope.disconnect()
        notes.delete(oscillator)
      }
    }
  }

  function cancelSpeech() {
    if (!activeSpeech) return
    const entry = activeSpeech
    activeSpeech = undefined
    clearTimeout(entry.timeout)
    if (entry.source) {
      entry.source.onended = null
      entry.source.stop()
      entry.source.disconnect()
    }
    entry.resolve(false)
  }

  function say(message, _speed, done = () => {}) {
    cancelSpeech()
    return new Promise(resolve => {
      const entry = { resolve }
      activeSpeech = entry
      const finish = success => {
        if (activeSpeech !== entry) return
        activeSpeech = undefined
        clearTimeout(entry.timeout)
        entry.source?.disconnect()
        resolve(success)
        done()
      }
      entry.timeout = setTimeout(() => finish(false), 9000)
      load(message).then(buffer => {
        if (activeSpeech !== entry) return
        if (context?.state !== 'running') return finish(false)
        const source = context.createBufferSource()
        entry.source = source
        source.buffer = buffer
        // Keep the original pitch and delivery; cue pace controls the gap.
        source.connect(context.destination)
        source.onended = () => finish(true)
        clearTimeout(entry.timeout)
        entry.timeout = setTimeout(() => { source.stop(); finish(false) }, (buffer.duration + 1) * 1000)
        source.start()
      }).catch(() => finish(false))
    })
  }

  function stop() {
    cancelSpeech()
    for (const oscillator of notes) oscillator.stop()
    notes.clear()
  }

  function close() {
    stop()
    if (context && context.state !== 'closed') context.close().catch(() => {})
    context = undefined
    buffers.clear()
  }

  return { unlock, bell, say, stop, close }
}
