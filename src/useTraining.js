import { useEffect, useRef, useState } from 'react'
import { makeAudio } from './audio.js'
import { advanceSession, pauseSession, remainingSeconds, resumeSession, scheduleCue, startSession } from './session.js'

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
    if (state.settings.voice && state.cue.speech) audio.say(state.cue.speech, state.settings.speed, finish)
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
    if (settings.bell || settings.voice) audio.unlock()?.catch(() => {})
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
    if (state.settings.bell || state.settings.voice) audio.unlock()?.catch(() => {})
    update(resumeSession(state, now), now)
  }

  function end() {
    audio.stop()
    update(null, performance.now())
  }

  function testAudio(settings, report = () => {}) {
    audio.stop()
    const preview = Symbol('preview')
    audioPreview.current = preview
    const unlocked = audio.unlock()
    if (!unlocked) return 'Audio is unavailable in this browser. Cues still appear on screen.'
    unlocked.then(async () => {
      if (audioPreview.current !== preview) return
      if (settings.bell) audio.bell()
      const played = !settings.voice || await audio.say('Ready. Guard. One, two, three, four.', settings.speed)
      if (audioPreview.current === preview) report(played
        ? 'Preview finished. You can play it again.'
        : 'Voice audio could not load. Check your connection and try again.')
    }).catch(() => {
      if (audioPreview.current === preview) report('Audio could not start. Tap Test audio again.')
    })
    return 'Playing preview…'
  }

  function stopAudio() {
    audioPreview.current = null
    audio.stop()
  }

  return { snapshot, start, pause, resume, end, testAudio, stopAudio }
}
