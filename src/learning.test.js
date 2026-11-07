import test from 'node:test'
import assert from 'node:assert/strict'
import { MODULES, LESSONS, getLesson, instruction, lessonCue, nextLesson } from './curriculum.js'
import { DEFAULT_SETTINGS, PUNCHES, startSession, advanceSession, pauseSession, resumeSession, remainingSeconds, scheduleCue } from './session.js'
import { readHistory, saveHistory, readSettings, saveSettings, readProgress, saveProgress, recordPractice, readLessonSettings, saveLessonSettings } from './storage.js'

test('learning path puts isolated techniques before combinations and preserves four foundation levels', () => {
  assert.deepEqual(MODULES.map(item => item.id), ['foundation', 'straight', 'curved', 'guided'])
  assert.equal(MODULES[0].levels.length, 4)
  assert.deepEqual(MODULES[0].levels[3].lessons.map(item => item.id), ['sideways', 'pivot', 'footwork-link'])
  assert.equal(new Set(LESSONS.map(item => item.id)).size, LESSONS.length)
  assert.deepEqual(LESSONS.slice(0, 6).map(item => item.id), ['stance', 'reset', 'forward-back', 'sideways', 'pivot', 'footwork-link'])
  for (const item of LESSONS.filter(item => item.moduleId === 'foundation')) {
    assert.deepEqual(item.punches, [])
    for (let serial = 0; serial < 12; serial++) assert.doesNotMatch(JSON.stringify(lessonCue(item.id, 'Orthodox', serial)), /\b(jab|cross|hook|uppercut|punch check)\b/i)
  }
  for (const [first, second] of [['jab', 'cross'], ['cross', 'jab-cross'], ['jab-cross', 'straight-exit'], ['lead-hook', 'rear-hook'], ['rear-hook', 'lead-uppercut'], ['lead-uppercut', 'rear-uppercut'], ['rear-uppercut', 'curved-combo'], ['curved-combo', 'round-footwork']]) {
    assert.ok(LESSONS.indexOf(getLesson(first)) < LESSONS.indexOf(getLesson(second)), `${first} before ${second}`)
  }
  for (const item of LESSONS) {
    assert.ok(item.objective && item.art)
    assert.ok(item.cues.length >= 2 && item.cues.length <= 3)
    assert.ok(item.mistakes.length && item.review.length && item.steps.length === 3)
    for (const number of item.punches) assert.ok(PUNCHES[number - 1])
  }
  assert.deepEqual(PUNCHES, ['Jab', 'Cross', 'Lead hook', 'Rear hook', 'Lead uppercut', 'Rear uppercut'])
})

test('handedness is consistent through cues and never switches mid-lesson', () => {
  assert.equal(instruction('{lead} lead / {rear} rear', 'Orthodox'), 'left lead / right rear')
  assert.equal(instruction('{lead} lead / {rear} rear', 'Southpaw'), 'right lead / left rear')
  for (const stance of ['Orthodox', 'Southpaw']) for (const item of LESSONS) {
    let state = startSession('boxing', { ...DEFAULT_SETTINGS, lessonId: item.id, stance }, 0)
    state = advanceSession(state, 3000)
    for (let i = 0; i < 6; i++) {
      assert.equal(state.cue.kind, 'lesson')
      assert.equal(state.stance, stance)
      assert.doesNotMatch(state.cue.detail, /\{lead\}|\{rear\}/)
      assert.equal(state.cue.speech, null, 'unrecorded lesson phrases must not request missing voice clips')
      state = advanceSession(state, state.nextCueAt)
    }
  }
})

test('short rounds run through preparation, rest and completion without early credit', () => {
  for (const work of [30, 45, 60]) for (const rest of [15, 30, 45, 60]) {
    let state = startSession('boxing', { ...DEFAULT_SETTINGS, lessonId: 'stance', rounds: 2, work, rest }, 0)
    assert.equal(state.phase, 'preparing')
    state = advanceSession(state, 3000)
    assert.equal(state.phase, 'working')
    assert.equal(remainingSeconds(state, 3000), work)
    assert.equal(state.cue.id, 'stance-0')
    state = advanceSession(state, 3000 + work * 1000)
    assert.equal(state.phase, 'resting')
    assert.equal(remainingSeconds(state, state.phaseEnds - rest * 1000), rest)
    state = advanceSession(state, state.phaseEnds)
    assert.equal(state.round, 2)
    assert.equal(state.phase, 'preparing')
    state = advanceSession(state, state.phaseEnds)
    assert.equal(state.phase, 'working')
    state = advanceSession(state, state.phaseEnds)
    assert.equal(state.phase, 'completed')
    assert.equal(advanceSession(state, 999999), state)
  }
  let single = startSession('boxing', { ...DEFAULT_SETTINGS, lessonId: 'jab', rounds: 1, work: 30 }, 0)
  single = advanceSession(single, 3000)
  assert.equal(advanceSession(single, 33000).phase, 'completed')
})

test('pause/resume preserves timer and cue deadlines in every active phase', () => {
  let state = startSession('boxing', { ...DEFAULT_SETTINGS, lessonId: 'stance' }, 0)
  const working = advanceSession(state, 3000)
  const resting = advanceSession(working, working.phaseEnds)
  for (const current of [state, working, resting]) {
    const at = current.phaseEnds - 1000
    const paused = pauseSession(current, at)
    assert.equal(remainingSeconds(paused, at + 90000), 1)
    assert.equal(advanceSession(paused, at + 90000), paused)
    const resumed = resumeSession(paused, at + 90000)
    assert.equal(resumed.phaseEnds, current.phaseEnds + 90000)
    assert.equal(remainingSeconds(resumed, at + 90000), 1)
    assert.equal(resumed.nextCueAt, current.nextCueAt === null ? null : current.nextCueAt + 90000)
  }
  assert.equal(scheduleCue(working, 5000, working.cueSerial).nextCueAt, 15000)
  assert.equal(scheduleCue(working, 5000, working.cueSerial - 1), working)
})

function mockStorage(t, initial = {}) {
  const original = globalThis.window
  const data = new Map(Object.entries(initial))
  globalThis.window = { localStorage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } }
  t.after(() => { globalThis.window = original })
  return data
}

test('legacy sessions and preferences survive; only completed lessons advance the learning path', t => {
  mockStorage(t)
  const legacy = [{ id: 'old', date: 1234, mode: 'boxing', rounds: 3, work: 60 }]
  saveHistory(legacy)
  saveSettings({ ...DEFAULT_SETTINGS, stance: 'Southpaw', speed: 'Fast' })
  assert.deepEqual(readHistory(), legacy)
  assert.equal(readSettings().stance, 'Southpaw')
  assert.equal(readSettings().speed, 'Fast')
  assert.deepEqual(readProgress(), {})
  assert.equal(nextLesson(readProgress()).id, 'stance')
  let progress = recordPractice({}, 'stance')
  progress.stance.checks = [true, false, true]
  progress.stance.reviewed = true
  saveProgress(progress)
  assert.deepEqual(readProgress(), progress)
  assert.equal(nextLesson(readProgress()).id, 'reset')
  assert.deepEqual(readHistory(), legacy)
  progress = recordPractice(progress, 'stance')
  assert.equal(progress.stance.practices, 2)
  assert.equal(progress.stance.reviewed, false)
  assert.deepEqual(progress.stance.checks, [])
  assert.equal(recordPractice(progress, 'unknown'), progress)
  assert.equal(nextLesson(recordPractice({}, 'round-combinations')).id, 'stance', 'jumping ahead never fills earlier lessons')
  assert.equal(nextLesson(Object.fromEntries(LESSONS.map(item => [item.id, { practices: 1 }]))), null)
  saveLessonSettings({ rounds: 2, work: 45, rest: 15 })
  assert.deepEqual(readLessonSettings(), { rounds: 2, work: 45, rest: 15 })
})

test('corrupt and unavailable storage fall back without crashing', t => {
  const data = mockStorage(t, { 'roundhouse:settings:v1': 'null', 'roundhouse:learning:v1': '[]', 'roundhouse:history:v1': '{broken', 'roundhouse:lesson-settings:v1': '{"work":999,"rounds":0}' })
  assert.deepEqual(readSettings(), DEFAULT_SETTINGS)
  assert.deepEqual(readHistory(), [])
  assert.deepEqual(readProgress(), {})
  assert.deepEqual(readLessonSettings(), { rounds: 2, work: 30, rest: 30 })
  data.set('roundhouse:learning:v1', JSON.stringify({ stance: { practices: -1 }, jab: { practices: 2, checks: ['true', true], reviewed: 'yes' } }))
  assert.deepEqual(readProgress(), { jab: { practices: 2, reviewed: false, checks: [false, true, false] } })
  globalThis.window.localStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('full') } }
  assert.deepEqual(readProgress(), {})
  assert.doesNotThrow(() => saveProgress({ stance: { practices: 1 } }))
})

test('existing workout modes still issue their original cues and complete', () => {
  for (const mode of ['boxing', 'ground', 'football']) {
    let state = startSession(mode, { ...DEFAULT_SETTINGS, rounds: 1 }, 0)
    state = advanceSession(state, 3000, () => 0.5)
    assert.equal(state.cue.kind, mode === 'boxing' ? 'intro' : 'drill')
    if (mode === 'boxing') assert.equal(state.cue.detail, 'Jab · Cross · Lead hook · Rear hook')
    state = advanceSession(state, state.nextCueAt, () => 0.5)
    assert.ok(state.cue.speech)
    assert.equal(advanceSession(state, state.phaseEnds).phase, 'completed')
  }
})
