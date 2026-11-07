export const MODES = {
  boxing: {
    title: 'Boxing',
    tag: 'Shadowboxing',
    description: 'Find your flow with called punch combos, stance switches and footwork.',
    equipment: 'Open floor space',
    instructions: 'Keep your hands up and your knees soft. Throw each numbered punch from your current stance.',
    warmup: 'Warm up with easy footwork, shoulder rolls and light punches before starting.',
  },
  ground: {
    title: 'Ground workout',
    tag: 'Bodyweight',
    description: 'Build strength and control with guided bodyweight blocks.',
    equipment: 'Open floor space, mat optional',
    instructions: 'Repeat the called movement at a pace you can control. Hold static movements until the next cue.',
    warmup: 'Start with an easy march and a few comfortable squats and arm circles.',
  },
  football: {
    title: 'Football',
    tag: 'Ball control',
    description: 'Sharpen your touch with short, repeatable footwork drills.',
    equipment: 'Football and a clear practice area',
    instructions: 'Repeat the called drill until the next cue. Keep the ball close and alternate feet when you can.',
    warmup: 'Ease in with a light jog and gentle touches in a clear space.',
  },
}

export const DEFAULT_SETTINGS = {
  rounds: 3,
  work: 60,
  rest: 30,
  level: 'Beginner',
  speed: 'Steady',
  stance: 'Orthodox',
  movement: true,
  switchStance: true,
  voice: true,
  bell: true,
}

export const PUNCHES = ['Jab', 'Cross', 'Lead hook', 'Rear hook']

const COMBOS = {
  Beginner: [[1], [2], [1, 2], [1, 1], [1, 3], [2, 3], [1, 4]],
  Medium: [[1, 2], [1, 3], [2, 3], [1, 1, 2], [1, 2, 3], [2, 3, 2], [1, 4, 1], [3, 2, 3]],
  Intermediate: [[1, 2, 3], [2, 3, 2], [3, 2, 3], [1, 1, 2, 3], [1, 2, 3, 2], [2, 3, 2, 3], [1, 2, 3, 2, 3], [1, 4, 1, 2, 3]],
}

const DRILLS = {
  ground: {
    Beginner: [['Bodyweight squats', 'Sit back and stand tall.'], ['Reverse lunges', 'Step back and alternate legs.'], ['High plank', 'Hold a straight line through your hips.'], ['Glute bridges', 'Drive through your heels and lower slowly.']],
    Medium: [['Tempo squats', 'Take three counts to lower, then stand.'], ['Reverse lunges', 'Step back and alternate legs.'], ['Plank shoulder taps', 'Tap opposite shoulders and keep your hips steady.'], ['Dead bugs', 'Lower opposite arm and leg, then switch.']],
    Intermediate: [['Squat pulses', 'Pulse twice at the bottom before standing.'], ['Lateral lunges', 'Sit into one hip, then alternate sides.'], ['Mountain climbers', 'Alternate knee drives from a high plank.'], ['Single-leg glute bridges', 'Lift one foot and switch legs halfway through.']],
  },
  football: {
    Beginner: [['Toe taps', 'Tap the top of the ball with alternating feet.'], ['Sole rolls', 'Roll the ball across your body and switch feet.'], ['Inside touches', 'Move the ball between the insides of your feet.'], ['Close dribbling', 'Take small touches while moving around your space.']],
    Medium: [['Inside-outside touches', 'Use the inside then outside of one foot. Switch feet.'], ['Pull-push touches', 'Pull the ball back with your sole, then push it forward.'], ['Sole rolls', 'Roll across your body and catch with the other foot.'], ['Figure-eight dribbling', 'Dribble around two markers in a figure eight.']],
    Intermediate: [['V-pulls', 'Pull back with your sole and push diagonally. Alternate feet.'], ['L-turns', 'Pull back, then touch the ball behind your standing leg.'], ['Inside-outside touches', 'Change direction sharply after each outside touch.'], ['Figure-eight dribbling', 'Accelerate out of each turn and keep the ball close.']],
  },
}

const MOVEMENTS = [
  { id: 'clockwise', kind: 'movement', title: 'Move clockwise', detail: 'Circle to your right in small steps.' },
  { id: 'counterclockwise', kind: 'movement', title: 'Move anticlockwise', detail: 'Circle to your left in small steps.' },
]

// Keep the generated voice pack in sync with every phrase the trainer can call.
export function voicePhrases() {
  return [...new Set([
    'Ready.', 'Guard.', 'Zero. Ready.', 'Rest.',
    'One, two, three, four.', 'Ready. Guard. One, two, three, four.',
    ...Array.from({ length: 11 }, (_, i) => String(i)),
    ...Object.values(COMBOS).flat().map(combo => combo.join(', ')),
    ...MOVEMENTS.map(cue => cue.title),
    'Switch stance. Orthodox.', 'Switch stance. Southpaw.',
    ...Object.values(DRILLS).flatMap(levels => Object.values(levels).flat().map(([title]) => title)),
  ])]
}

export function pickCue(mode, settings, stance, previous, random = Math.random) {
  if (mode !== 'boxing') {
    const available = DRILLS[mode][settings.level].filter(([title]) => title !== previous)
    const [title, detail] = available[Math.floor(random() * available.length)]
    return { id: title, kind: 'drill', title, detail, speech: title, stance }
  }

  const movementChance = { Beginner: 0.12, Medium: 0.22, Intermediate: 0.3 }[settings.level]
  const footwork = [
    ...(settings.movement ? MOVEMENTS : []),
    ...(settings.switchStance ? [{ id: 'switch', kind: 'switch', title: 'Switch stance' }] : []),
  ].filter(cue => cue.id !== previous)

  if (footwork.length && random() < movementChance) {
    const cue = footwork[Math.floor(random() * footwork.length)]
    if (cue.kind === 'switch') {
      const next = stance === 'Orthodox' ? 'Southpaw' : 'Orthodox'
      return { ...cue, stance: next, detail: next === 'Orthodox' ? 'Lead with your left foot.' : 'Lead with your right foot.', speech: `Switch stance. ${next}.` }
    }
    return { ...cue, stance, speech: cue.title }
  }

  const available = COMBOS[settings.level].filter(combo => combo.join('-') !== previous)
  const numbers = available[Math.floor(random() * available.length)]
  return {
    id: numbers.join('-'), kind: 'combo', title: numbers.join(' · '), numbers,
    detail: numbers.map(number => PUNCHES[number - 1]).join(' · '),
    speech: numbers.join(', '), stance,
  }
}

const PREPARATION = 3000

export function startSession(mode, settings, now) {
  return {
    mode, settings, round: 1, phase: 'preparing', phaseEnds: now + PREPARATION,
    phaseDuration: PREPARATION, stance: settings.stance, cue: null,
    cueSerial: 0, nextCueAt: null, pausedAt: null,
  }
}

function issueCue(state, now, random) {
  const cue = state.mode === 'boxing' && state.cueSerial === 0
    ? {
        id: 'punch-check', kind: 'intro', title: 'Punch check', numbers: [1, 2, 3, 4],
        detail: PUNCHES.join(' · '), speech: 'One, two, three, four.', stance: state.stance,
      }
    : pickCue(state.mode, state.settings, state.stance, state.cue?.id, random)
  return { ...state, cue, stance: cue.stance, cueSerial: state.cueSerial + 1, nextCueAt: now + 10000 }
}

export function advanceSession(state, now, random = Math.random) {
  if (state.pausedAt !== null || state.phase === 'completed') return state

  if (now >= state.phaseEnds) {
    if (state.phase === 'preparing') {
      const phaseDuration = state.settings.work * 1000
      return issueCue({ ...state, phase: 'working', phaseEnds: now + phaseDuration, phaseDuration }, now, random)
    }
    if (state.phase === 'resting') {
      return {
        ...state, round: state.round + 1, phase: 'preparing', phaseEnds: now + PREPARATION,
        phaseDuration: PREPARATION, nextCueAt: null,
      }
    }
    if (state.round >= state.settings.rounds) {
      return { ...state, phase: 'completed', nextCueAt: null }
    }

    const phaseDuration = state.settings.rest * 1000
    return { ...state, phase: 'resting', phaseEnds: now + phaseDuration, phaseDuration, nextCueAt: null }
  }

  if (state.phase === 'working' && now >= state.nextCueAt) {
    return issueCue(state, now, random)
  }
  return state
}

export function pauseSession(state, now) {
  return state.pausedAt === null && state.phase !== 'completed' ? { ...state, pausedAt: now } : state
}

export function resumeSession(state, now) {
  if (state.pausedAt === null) return state
  const shift = now - state.pausedAt
  return {
    ...state, pausedAt: null, phaseEnds: state.phaseEnds + shift,
    nextCueAt: state.nextCueAt === null ? null : state.nextCueAt + shift,
  }
}

export function scheduleCue(state, now, serial) {
  if (state.phase !== 'working' || state.pausedAt !== null || state.cueSerial !== serial) return state
  const speedFactor = { Slow: 1.3, Steady: 1, Fast: 0.72 }[state.settings.speed]
  const gap = state.mode === 'boxing'
    ? { Beginner: 2650, Medium: 1950, Intermediate: 1400 }[state.settings.level]
    : { Beginner: 10500, Medium: 9000, Intermediate: 7500 }[state.settings.level]
  return { ...state, nextCueAt: now + Math.round(gap * speedFactor) }
}

export function remainingSeconds(state, now) {
  return Math.max(0, Math.ceil((state.phaseEnds - (state.pausedAt ?? now)) / 1000))
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
