import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceSession, DEFAULT_SETTINGS, pickCue, scheduleCue, startSession } from './session.js'

test('boxing calls all four punches and permits an immediate repeat', () => {
  const settings = { ...DEFAULT_SETTINGS, movement: false }
  for (let number = 1; number <= 4; number++) {
    const cue = pickCue('boxing', settings, 'Orthodox', String(number), () => (number - 0.5) / 4)
    assert.deepEqual(cue.numbers, [number])
    assert.equal(cue.speech, String(number))
  }
})

test('beginner has a clear gap between opening numbers and no position changes', () => {
  const settings = { ...DEFAULT_SETTINGS, work: 120 }
  let state = startSession('boxing', settings, 0)
  let now = 3000
  state = advanceSession(state, now, () => 0)
  for (let number = 1; number <= 4; number++) {
    assert.equal(state.cue.kind, 'intro')
    assert.deepEqual(state.cue.numbers, [number])
    assert.equal(state.cue.speech, String(number))
    assert.equal(state.direction, null)
    now += 500
    state = scheduleCue(state, now, state.cueSerial)
    assert.equal(state.nextCueAt, now + 3200, 'a gap follows each spoken number')
    now = state.nextCueAt
    state = advanceSession(state, now, () => 0)
  }
  assert.equal(state.cue.kind, 'combo')
  assert.deepEqual(state.cue.numbers, [1])
  assert.equal(state.direction, null)
  for (let i = 0; i < 5; i++) {
    state = advanceSession(state, state.nextCueAt, () => 0)
    assert.equal(state.cue.kind, 'combo')
    assert.deepEqual(state.cue.numbers, [1], 'a single number may repeat')
    assert.equal(state.direction, null)
  }
})

test('higher levels announce clockwise and anticlockwise changes after the opening', () => {
  const settings = { ...DEFAULT_SETTINGS, level: 'Medium', work: 120, switchStance: false }
  let state = startSession('boxing', settings, 0)
  state = advanceSession(state, 3000)
  for (let i = 0; i < 4; i++) state = advanceSession(state, state.nextCueAt)
  assert.equal(state.cue.title, 'Change clockwise')
  assert.equal(state.cue.speech, 'Change clockwise')
  assert.equal(state.direction, 'clockwise')

  for (let i = 0; i < 3; i++) {
    const values = state.cue.kind === 'movement' ? [0] : [0.9, 0]
    state = advanceSession(state, state.nextCueAt, () => values.shift())
    assert.equal(state.cue.id, '1')
    assert.equal(state.direction, 'clockwise')
  }

  state = advanceSession(state, state.nextCueAt)
  assert.equal(state.cue.title, 'Change anticlockwise')
  assert.equal(state.cue.speech, 'Change anticlockwise')
  assert.equal(state.direction, 'counterclockwise')
  assert.equal(state.punchesSinceDirection, 0)
})

test('higher levels call faster and allow more frequent random position changes', () => {
  const settings = { ...DEFAULT_SETTINGS, switchStance: false }
  const cue = { kind: 'combo', id: '1' }
  const gaps = ['Beginner', 'Medium', 'Intermediate'].map(level => {
    const state = { ...startSession('boxing', { ...settings, level }, 0), phase: 'working', cue, cueSerial: 1 }
    return scheduleCue(state, 5000, 1).nextCueAt - 5000
  })
  assert.deepEqual(gaps, [2650, 1950, 1400])
  const pick = level => {
    const values = [0.25, 0]
    return pickCue('boxing', { ...settings, level }, 'Orthodox', '1', () => values.shift(), 'clockwise')
  }
  assert.equal(pick('Medium').kind, 'combo')
  assert.equal(pick('Intermediate').id, 'counterclockwise')
})
