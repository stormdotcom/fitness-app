// Stable IDs are persisted independently of the older, general workout log.
const lesson = (id, title, objective, art, cues, mistakes, steps, review, punches = []) => ({
  id, title, objective, art, cues, mistakes, steps, review, punches,
})

export const MODULES = [
  { id: 'foundation', title: 'Stance and footwork', description: 'Build a comfortable base before throwing a punch.', levels: [
    { title: 'Find your stance', lessons: [lesson('stance', 'Find your stance', 'Find a balanced starting position with a relaxed guard.', 'stance',
      ['Place your {lead} foot forward and {rear} foot back, roughly shoulder-width apart.', 'Keep knees soft, weight comfortable over both feet and rear heel light.', 'Hands near your cheeks, elbows close and chin gently down; look ahead.'],
      ['Standing on a tightrope or spreading your feet too far.', 'Locking your knees, lifting your chin or tensing your shoulders.'],
      ['Set your feet on two separate tracks.', 'Soften your knees and bring up your guard.', 'Relax and rebuild the stance without looking down.'],
      ['I can name my lead and rear sides.', 'I feel balanced without locking my knees.', 'My hands are up and I can look ahead.'])] },
    { title: 'Maintain and reset your stance', lessons: [lesson('reset', 'Maintain and reset your stance', 'Shift weight gently and return to a base that lets you move.', 'reset',
      ['Gently shift a little weight forward and back without leaning outside your feet.', 'Keep knees soft and hands up as your weight moves.', 'Return to centre; a stance is ready to move, not a rigid pose.'],
      ['Rocking so far that a foot must catch you.', 'Freezing the legs or letting the guard drop.'],
      ['Start in your comfortable stance.', 'Shift gently toward the lead leg, then the rear leg.', 'Settle between both feet and check your guard.'],
      ['I shift without falling or taking a catch step.', 'I can settle back into my starting base.', 'I feel free to move in either direction.'])] },
    { title: 'Forward and backward steps', lessons: [lesson('forward-back', 'Forward and backward steps', 'Move a short distance while keeping the same stable base.', 'linear',
      ['Forward: move the lead ({lead}) foot a little, then let the rear foot follow.', 'Backward: move the rear ({rear}) foot first, then let the lead foot follow.', 'Keep steps small and restore the space between your feet after each step.'],
      ['Crossing your feet or bringing them together.', 'Overreaching with a big step or leaning before the feet move.'],
      ['Lead foot, then rear foot: one small step forward.', 'Pause in stance with your guard up.', 'Rear foot, then lead foot: one small step back.'],
      ['The foot nearest my direction moves first.', 'My feet stay apart without crossing.', 'I finish each step balanced with my guard up.'])] },
    { title: 'Sideways movement', lessons: [
      lesson('sideways', 'Left and right steps', 'Move sideways without narrowing or crossing your base.', 'lateral',
        ['To your left: left foot first, then right foot follows.', 'To your right: right foot first, then left foot follows.', 'Keep the same lead foot forward and your hands at your cheeks.'],
        ['Crossing the trailing foot over the other.', 'Dragging the feet together or making a large leap.'],
        ['Take a small step left with your left foot.', 'Bring the right foot across enough to restore your base.', 'Reset, then move right: right foot first.'],
        ['I use the foot nearest the direction first.', 'I keep my original lead foot forward.', 'My guard stays up during both directions.']),
      lesson('pivot', 'A small lead-foot pivot', 'Turn a little around your lead foot while keeping a usable stance.', 'pivot',
        ['Start balanced with soft knees and a light rear heel.', 'Turn a little toward your lead side ({lead}); let the rear foot travel around.', 'Let the lead foot turn with your body; finish facing the new direction in guard.'],
        ['Twisting against a planted knee.', 'Swinging the rear foot so far that your base crosses or collapses.'],
        ['Set your guard and a comfortable base.', 'Make a small turn toward your lead side, allowing both feet to turn.', 'Bring the rear foot around and reset your base.'],
        ['My feet and knees turn comfortably together.', 'I keep space between my feet.', 'I finish balanced and facing the new direction.']),
      lesson('footwork-link', 'Link directions slowly', 'Link small steps and an optional pivot without losing your stance.', 'linear',
        ['Take one small forward step, then reset before stepping back.', 'Step left and right, restoring your base between directions.', 'Add a small lead-side pivot only when balanced; keep your guard.'],
        ['Rushing several directions without a reset.', 'Crossing feet, bouncing uncontrollably or dropping your hands.'],
        ['Forward, reset, then backward and reset.', 'Left, reset, then right and reset.', 'Try one small lead-side pivot, then settle in guard.'],
        ['I restore my base between directions.', 'I can stop balanced at any point.', 'My guard stays comfortable and ready.']),
    ] },
  ] },
  { id: 'straight', title: 'Straight punches and basic defence', description: 'Learn one punch at a time, then add a balanced exit.', levels: [
    { title: 'Jab and return to guard', lessons: [lesson('jab', 'Jab and return to guard', 'Extend the lead hand smoothly and bring it straight back.', 'jab',
      ['Send your lead ({lead}) fist straight out without locking the elbow.', 'Keep your rear hand by your cheek and your chin gently down.', 'Return the jab along the same path to guard before repeating.'],
      ['Reaching with your head or dropping the rear hand.', 'Pulling the hand back before punching or leaving it extended.'],
      ['Begin balanced with both hands in guard.', 'Extend a relaxed lead jab at an imaginary target.', 'Bring the lead hand straight back and check your balance.'],
      ['My rear hand stays beside my cheek.', 'My jab returns to guard every time.', 'I can pause balanced after each jab.'], [1])] },
    { title: 'Rear straight and return to guard', lessons: [lesson('cross', 'Cross and return to guard', 'Deliver a controlled rear straight with a small body turn.', 'cross',
      ['Send your rear ({rear}) fist straight ahead as your rear hip and shoulder turn.', 'Let your rear heel turn naturally; keep the lead hand at your cheek.', 'Return the rear hand to guard and settle back into your base.'],
      ['Over-rotating, locking the elbow or falling over the lead leg.', 'Dropping the lead hand or leaving the rear foot stuck.'],
      ['Start with the rear hand at your cheek.', 'Turn the rear hip and shoulder as the rear hand extends.', 'Bring the hand back and reset your stance.'],
      ['My lead hand stays up.', 'I turn comfortably without losing my base.', 'My rear hand returns to guard.'], [2])] },
    { title: 'Jab-cross and balanced reset', lessons: [lesson('jab-cross', 'Jab-cross and balanced reset', 'Link two straight punches, then pause in guard.', 'combo',
      ['Jab with your lead ({lead}) hand, then cross with your rear ({rear}) hand.', 'Recover one hand to guard as the other extends.', 'After both punches, pause with soft knees and both hands up.'],
      ['Throwing both hands together or leaving the first hand out.', 'Chasing an imaginary target by leaning beyond your feet.'],
      ['Jab and begin recovering the lead hand.', 'Cross while the lead hand protects your cheek.', 'Recover both hands and pause in a balanced stance.'],
      ['I can name and separate the jab and cross.', 'My non-punching hand stays in guard.', 'I reset balanced after every pair.'], [1, 2])] },
    { title: 'Straight punches with movement', lessons: [lesson('straight-exit', 'Straight punches and a step out', 'Step into comfortable range, punch, then move out with your guard.', 'linear',
      ['Take a small step forward and restore your base before a jab or jab-cross.', 'Bring both hands back before a small backward step: rear foot first.', 'Keep eyes ahead; distance and a recovered guard are your basic defensive reset.'],
      ['Punching while feet are crossed or too close together.', 'Leaning backward to escape instead of moving the feet.'],
      ['Step in and settle your feet.', 'Throw a light jab or jab-cross and recover guard.', 'Step back out of imaginary range and reset.'],
      ['I settle my feet before punching.', 'I recover guard before my exit.', 'My backward step preserves my base.'], [1, 2])] },
  ] },
  { id: 'curved', title: 'Hooks and uppercuts', description: 'Learn each curved punch separately before linking them.', levels: [
    ...[
      ['lead-hook', 'Lead hook', 'hook', 'lead', 3],
      ['rear-hook', 'Rear hook', 'hook', 'rear', 4],
      ['lead-uppercut', 'Lead uppercut', 'uppercut', 'lead', 5],
      ['rear-uppercut', 'Rear uppercut', 'uppercut', 'rear', 6],
    ].map(([id, title, art, side, number]) => ({ title, lessons: [lesson(id, title, `Practise a compact ${title.toLowerCase()} and return to guard.`, art,
      art === 'hook' ? [`Turn your ${side} hip and shoulder together; keep a comfortable bend in the elbow.`, `Trace a short, level arc with the ${side} ({${side}}) hand; keep the other hand at your cheek.`, 'Keep the wrist straight, turn the foot naturally and recover guard without spinning past your base.']
        : [`Soften your knees a little without folding at the waist.`, `Use a small leg and hip turn to lift the ${side} ({${side}}) fist on a short upward path.`, 'Keep the other hand by your cheek and recover guard; avoid scooping from below your waist.'],
      art === 'hook' ? ['Swinging a straight arm wide or bending the wrist.', 'Over-rotating or dropping the opposite hand.'] : ['Dropping the hand low to wind up or leaning backward.', 'Locking the legs or lifting your chin.'],
      art === 'hook' ? ['Set your guard and keep the elbow comfortably bent.', `Turn gently and trace a short ${side}-hand arc.`, 'Return the hand to your cheek and reset.'] : ['Set your guard, then soften the knees slightly.', `Lift a compact ${side} uppercut using a small body turn.`, 'Return the hand to guard and settle your base.'],
      ['I keep the opposite hand in guard.', 'My movement stays compact and comfortable.', 'I finish balanced with both hands back.'], [number])] })),
    { title: 'Combine with a reset', lessons: [lesson('curved-combo', 'Link familiar punches', 'Combine familiar punches slowly and recover your guard.', 'combo',
      ['Try jab, cross, lead hook, then stop and reset.', 'Next try lead uppercut, rear uppercut, then stop and reset.', 'Use a compact range and gentle rotation; return each hand to guard.'],
      ['Adding speed before individual punches feel controlled.', 'Throwing long flurries without a balanced finish.'],
      ['Jab, cross, lead hook at an easy pace.', 'Stop with both hands in guard and check your base.', 'Lead uppercut, rear uppercut, then another full reset.'],
      ['I recognise every punch by name.', 'I recover my hands between punches.', 'I can stop balanced after either combination.'], [1, 2, 3, 5, 6])] },
  ] },
  { id: 'guided', title: 'Guided shadowboxing', description: 'Short rounds with one clear purpose. Keep the pace easy.', levels: [
    { title: 'Footwork and guard', lessons: [lesson('round-footwork', 'Footwork and guard', 'Use a whole short round to keep a balanced base while moving.', 'lateral',
      ['Step forward and back slowly, then reset.', 'Step left and right; keep feet apart and guard up.', 'Add a small pivot when comfortable, then pause in stance.'],
      ['Drifting into a narrow base.', 'Treating the round as a speed test.'],
      ['Forward and back with a reset.', 'Left and right with a reset.', 'Small pivot and a quiet guard check.'],
      ['I keep space between my feet.', 'I can change direction without crossing.', 'My guard stays up throughout.'])] },
    { title: 'Jab and movement', lessons: [lesson('round-jab', 'Jab and movement', 'Use a single jab between small steps and defensive resets.', 'jab',
      ['Move a little, settle your base, then jab.', 'Bring the lead hand back before moving again.', 'Step out of imaginary range with your hands up.'],
      ['Reaching for a target that is too far away.', 'Moving with the jab hand still extended.'],
      ['Small step and a balanced pause.', 'One jab, then return to guard.', 'Step back out and reset.'],
      ['I settle before each jab.', 'I return the jab to guard.', 'I leave range with small balanced steps.'], [1])] },
    { title: 'Jab-cross and movement', lessons: [lesson('round-straights', 'Jab-cross and movement', 'Link a familiar pair with a controlled exit.', 'combo',
      ['Step into a comfortable imaginary range and settle.', 'Jab, cross, then recover both hands.', 'Step out or sideways and restore your base.'],
      ['Leaning through the combination.', 'Rushing the exit and crossing the feet.'],
      ['Step in and settle.', 'Jab-cross and guard.', 'Step out, reset and repeat slowly.'],
      ['My feet support both punches.', 'Both hands return to guard.', 'I finish the exit balanced.'], [1, 2])] },
    { title: 'Combinations and defensive resets', lessons: [lesson('round-combinations', 'Simple combinations and defensive resets', 'Choose a short familiar combination, then reset guard and distance.', 'combo',
      ['Alternate jab-cross-lead hook with lead uppercut-rear uppercut.', 'After each combination, recover guard and pause.', 'Take a small step back or sideways; look ahead and reset before repeating.'],
      ['Adding unfamiliar punches or rushing the sequence.', 'Dropping the guard while moving out.'],
      ['Use one familiar short combination.', 'Recover guard and check balance.', 'Move out of imaginary range, then reset.'],
      ['I use only punches I have practised individually.', 'I recover guard after each combination.', 'I reset distance without losing my base.'], [1, 2, 3, 5, 6])] },
  ] },
]

export const LESSONS = MODULES.flatMap((module, moduleIndex) => module.levels.flatMap((level, levelIndex) => level.lessons.map((item, exerciseIndex) => ({ ...item, moduleId: module.id, moduleTitle: module.title, moduleNumber: moduleIndex + 1, levelNumber: levelIndex + 1, exerciseNumber: exerciseIndex + 1 }))))
export const getLesson = id => LESSONS.find(item => item.id === id)
export const nextLesson = progress => LESSONS.find(item => !progress[item.id]?.practices) ?? null
export function sides(stance) {
  return stance === 'Southpaw' ? { lead: 'right', rear: 'left' } : { lead: 'left', rear: 'right' }
}
export function instruction(text, stance) {
  const side = sides(stance)
  return text.replaceAll('{lead}', side.lead).replaceAll('{rear}', side.rear)
}

export function lessonCue(id, stance, serial) {
  const item = getLesson(id)
  const index = serial % item.cues.length
  return { id: `${id}-${index}`, kind: 'lesson', title: item.title, detail: instruction(item.cues[index], stance), speech: null, stance }
}
