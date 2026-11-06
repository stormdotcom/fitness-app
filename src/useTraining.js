import { useEffect, useRef, useState } from 'react'
import { advanceSession, pauseSession, remainingSeconds, resumeSession, scheduleCue, startSession } from './session.js'

function makeAudio() {
  let context
  let activeSpeech
  const notes = new Set()

  function unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    try {
      context ??= new AudioContext()
      return context.state === 'running' ? Promise.resolve() : context.resume().catch(() => {})
    } catch {
      // Visual cues still work if the browser disallows audio.
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
    clearTimeout(activeSpeech.timeout)
    activeSpeech = undefined
    window.speechSynthesis.cancel()
  }

  function say(message, speed, done = () => {}) {
    cancelSpeech()
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      done()
      return
    }
    const utterance = new window.SpeechSynthesisUtterance(message)
    utterance.lang = 'en'
    utterance.rate = { Slow: 0.82, Steady: 0.98, Fast: 1.13 }[speed]
    const entry = { utterance }
    const finish = () => {
      if (activeSpeech !== entry) return
      clearTimeout(entry.timeout)
      activeSpeech = undefined
      done()
    }
    entry.timeout = setTimeout(() => {
      if (activeSpeech !== entry) return
      finish()
      window.speechSynthesis.cancel()
    }, Math.min(6500, 1000 + message.length * 120 / utterance.rate))
    activeSpeech = entry
    utterance.onend = finish
    utterance.onerror = finish
    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      finish()
    }
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
  }

  return { unlock, bell, say, stop, close }
}

export default function useTraining() {
  const audioRef = useRef(null)
  audioRef.current ??= makeAudio()
  const audio = audioRef.current
  const stateRef = useRef(null)
  const snapshotRef = useRef(null)
  const finishedCue = useRef(null)
  const audioPreview = useRef(null)
  const [snapshot, setSnapshot] = useState(null)

  function update(next, now) {
    stateRef.current = next
    const previous = snapshotRef.current
    const seconds = next ? remainingSeconds(next, now) : 0
    if (next === previous?.state && seconds === previous?.seconds) return
    const snapshot = next ? { state: next, seconds } : null
    snapshotRef.current = snapshot
    setSnapshot(snapshot)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current
      if (!state || state.pausedAt !== null || state.phase === 'completed') return
      const now = performance.now()
      update(advanceSession(state, now), now)
    }, 50)
    function handleVisibility() {
      const state = stateRef.current
      if (!document.hidden || !state || state.phase === 'completed') return
      const now = performance.now()
      audio.stop()
      update(pauseSession(state, now), now)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      audio.close()
    }
  }, [audio])

  const phase = snapshot?.state.phase
  const serial = snapshot?.state.cueSerial
  const seconds = snapshot?.seconds
  const paused = snapshot?.state.pausedAt != null
  const guarding = phase === 'preparing' && seconds === 1

  useEffect(() => {
    const state = stateRef.current
    if (!state || state.pausedAt !== null) return
    const { settings, phase } = state
    audio.stop()
    if (phase === 'working' || phase === 'resting' || phase === 'completed') {
      if (settings.bell) audio.bell()
      if (phase === 'resting' && settings.voice) audio.say('Rest.', settings.speed)
    }
  }, [audio, phase])

  useEffect(() => {
    const state = stateRef.current
    if (phase !== 'preparing' || paused || !state?.settings.voice) return
    const ready = state.round > 1 && seconds === 3 ? 'Zero. Ready.' : 'Ready.'
    const cue = guarding && state.mode === 'boxing' ? 'Guard.' : ready
    if (!guarding || state.mode === 'boxing') audio.say(cue, 'Steady')
    // The cue changes once in preparation and plays again after a pause.
  }, [audio, phase, paused, guarding])

  useEffect(() => {
    const state = stateRef.current
    if (!state || state.phase !== 'working' || paused || finishedCue.current === serial) return
    function finish() {
      const now = performance.now()
      const current = stateRef.current
      finishedCue.current = state.cueSerial
      if (current) update(scheduleCue(current, now, state.cueSerial), now)
    }
    if (state.settings.voice) audio.say(state.cue.speech, state.settings.speed, finish)
    else finish()
  }, [audio, phase, serial, paused])

  useEffect(() => {
    const state = stateRef.current
    if (phase === 'resting' && seconds <= 10 && !paused && state.settings.voice) {
      audio.say(String(seconds), 'Fast')
    }
  }, [audio, phase, seconds, paused])

  function start(mode, settings) {
    audioPreview.current = null
    finishedCue.current = null
    audio.stop()
    if (settings.bell || settings.voice) audio.unlock()
    const now = performance.now()
    update(startSession(mode, settings, now), now)
  }

  function pause() {
    const state = stateRef.current
    if (!state) return
    const now = performance.now()
    audio.stop()
    update(pauseSession(state, now), now)
  }

  function resume() {
    const state = stateRef.current
    if (!state) return
    const now = performance.now()
    if (state.settings.bell || state.settings.voice) audio.unlock()
    update(resumeSession(state, now), now)
  }

  function end() {
    audio.stop()
    update(null, performance.now())
  }

  function testAudio(settings) {
    audio.stop()
    const preview = Symbol('preview')
    audioPreview.current = preview
    const unlocked = settings.bell ? audio.unlock() : null
    unlocked?.then(() => { if (audioPreview.current === preview) audio.bell() })
    const canSpeak = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance)
    if (settings.voice && canSpeak) audio.say('Ready. Guard. One, two, three, four.', settings.speed)
    if (settings.voice && !canSpeak) return 'Spoken cues are unavailable in this browser. The same cues appear on screen.'
    if (settings.bell && !unlocked) return 'The round bell is unavailable in this browser.'
    return 'Preview requested. If you hear silence, check your device volume.'
  }

  function stopAudio() {
    audioPreview.current = null
    audio.stop()
  }

  return { snapshot, start, pause, resume, end, testAudio, stopAudio }
}
