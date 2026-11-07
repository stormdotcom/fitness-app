import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw } from 'lucide-react'
import { RingArt } from './Artwork.jsx'
import { MODULES, LESSONS, instruction, nextLesson, sides } from './curriculum.js'
import { PUNCHES, formatTime } from './session.js'

export function LearningPath({ progress, open, go }) {
  const next = nextLesson(progress)
  const count = LESSONS.filter(item => progress[item.id]?.practices).length
  return <section className="wrap learning-page" aria-labelledby="learning-title">
    <div className="learning-intro">
      <div><p className="learning-label">Your beginner boxing path</p><h1 id="learning-title">Build your base.<br />Then build your boxing.</h1><p>Small steps, short rounds and time to review. Start with your stance and return to any lesson whenever you need.</p>
        <div className="next-lesson"><span>{next ? 'Recommended next lesson' : 'All lessons practised — keep reviewing'}</span><h2>{next?.title ?? 'Revisit your foundations'}</h2><button className="button primary" onClick={() => open(next?.id ?? 'stance')}>{next ? 'Open lesson' : 'Review stance'} <ArrowRight size={18} /></button></div>
      </div><div className="learning-ring"><RingArt /></div>
    </div>
    <div className="path-progress"><strong>{count} of {LESSONS.length} lessons practised</strong><progress max={LESSONS.length} value={count} aria-label="Lessons practised" /><p>Saved in this browser. Practice completion records time spent; it does not certify technique or mastery.</p></div>
    <div className="module-list">{MODULES.map((module, index) => {
      const items = LESSONS.filter(item => item.moduleId === module.id)
      return <section className="learning-module" key={module.id} aria-labelledby={`module-${module.id}`}>
        <div className="module-heading"><span className="module-number">Module {index + 1}</span><h2 id={`module-${module.id}`}>{module.title}</h2><p>{module.description}</p><span>{items.filter(item => progress[item.id]?.practices).length} / {items.length} practised</span></div>
        <ol className="level-list">{module.levels.map((level, levelIndex) => <li key={level.title}><h3><span>Level {levelIndex + 1}</span> {level.title}</h3><ul>{level.lessons.map(item => <li key={item.id}><button className={`lesson-link${next?.id === item.id ? ' recommended' : ''}`} onClick={() => open(item.id)}><span>{item.title}<small>{progress[item.id]?.practices ? `Practised ${progress[item.id].practices}× · ${progress[item.id].reviewed ? 'Self-review saved' : 'Self-review pending'}` : next?.id === item.id ? 'Recommended next' : 'Ready to explore'}</small></span>{progress[item.id]?.practices ? <Check size={18} aria-label="Practised" /> : <ArrowRight size={18} />}</button></li>)}</ul></li>)}</ol>
      </section>
    })}</div>
    <div className="other-workouts"><h2>More ways to train</h2><p>Your original boxing cue trainer, bodyweight and football workouts are still available. For boxing, learn the techniques above before trying mixed cues.</p><button className="button outline" onClick={() => go('workouts')}>Open other workouts <ArrowRight size={18} /></button></div>
  </section>
}

export function PunchLabels({ numbers }) {
  return numbers.length > 0 && <ul className="lesson-punches" aria-label="Punch key, not lesson numbers">{numbers.map(number => <li key={number}><span>Punch {number}</span> {PUNCHES[number - 1]}</li>)}</ul>
}

// Schematic rear view: screen left/right match the learner's own sides.
// Mirroring geometry for southpaw swaps the lead/rear sides, never the text.
function Body({ action, rear = false }) {
  const guardLeft = 'M104 70 L83 89 L92 47'
  const guardRight = 'M116 70 L138 89 L129 47'
  const actionLeft = action === 'jab' ? 'M104 70 L72 45 L51 20' : action === 'hook' ? 'M104 70 L72 62 L90 33' : action === 'uppercut' ? 'M104 70 L81 86 L91 58' : guardLeft
  return <g>
    <circle cx="111" cy="32" r="14" fill="#fbfcff" stroke="#142443" strokeWidth="4" />
    <path d="M106 50 L99 107 L119 110 L119 51" fill="#c8d5fb" stroke="#142443" strokeWidth="4" strokeLinejoin="round" />
    <path d="M103 108 L90 133 L82 165 M115 110 L133 145 L145 184" stroke="#142443" strokeWidth="9" fill="none" strokeLinecap="round" />
    <g transform={rear ? 'translate(222 0) scale(-1 1)' : undefined}><path d={actionLeft} stroke="#244bdd" strokeWidth="9" fill="none" strokeLinecap="round" /><path d={guardRight} stroke="#142443" strokeWidth="9" fill="none" strokeLinecap="round" /></g>
    <ellipse cx="79" cy="170" rx="13" ry="6" fill="#244bdd" /><ellipse cx="149" cy="190" rx="13" ry="6" fill="#142443" />
    {action !== 'guard' && <path transform={rear ? 'translate(222 0) scale(-1 1)' : undefined} d={action === 'hook' ? 'M60 27 Q73 9 91 22 l-7-1 m7 1-2-7' : action === 'uppercut' ? 'M63 87 Q57 65 72 48 l-8 3 m8-3-1 9' : 'M44 55 L29 29 l1 9 m-1-9 8 4'} stroke="#b55612" strokeWidth="3" fill="none" />}
  </g>
}

export function LessonIllustration({ lesson, stance }) {
  const [step, setStep] = useState(0)
  const side = sides(stance)
  const footwork = ['stance', 'reset', 'linear', 'lateral', 'pivot'].includes(lesson.art)
  const rear = lesson.id.startsWith('rear') || lesson.art === 'cross'
  const action = step !== 1 ? 'guard' : lesson.art === 'cross' || lesson.art === 'combo' ? 'jab' : lesson.art
  const shift = step === 1 && lesson.art === 'linear' ? 'translate(0 -18)' : step === 1 && lesson.art === 'lateral' ? 'translate(-22 0)' : step === 1 && lesson.art === 'pivot' ? 'rotate(-20 35 83)' : undefined
  const captions = lesson.art === 'combo'
    ? ['Set your guard and a comfortable base.', 'Example: extend the lead jab, with the rear hand in guard. Follow the named practice sequence below for the full combination.', 'Recover both hands and settle in your base before repeating.']
    : lesson.steps
  return <figure className="lesson-illustration">
    <div className="illustration-top"><strong>{footwork ? 'Stance study' : 'Punch path study'}</strong><span>{stance} · rear view</span></div>
    <svg viewBox="0 0 420 240" role="img" aria-label={`${stance}: ${footwork ? `${side.lead} lead foot forward, ${side.rear} rear foot back` : `${rear ? side.rear : side.lead} hand ${action}, other hand in guard`}. ${captions[step]}`}>
      <path d="M20 208 H400" stroke="#dbe3f5" strokeWidth="2" />
      <g transform={`translate(35 8) ${stance === 'Southpaw' ? 'translate(222 0) scale(-1 1)' : ''}`}><Body action={footwork ? 'guard' : action} rear={rear} /></g>
      <g transform="translate(260 10)">
        <text x="65" y="19" textAnchor="middle" fontSize="12" fill="#52617a">Facing forward ↑</text>
        <g transform={stance === 'Southpaw' ? 'translate(130 0) scale(-1 1)' : undefined}>
          <path d="M35 45 V185 M100 45 V185" stroke="#b5c4ed" strokeWidth="2" strokeDasharray="4 5" />
          <g transform={shift}><ellipse cx="35" cy="83" rx="12" ry="25" fill="#244bdd" /><ellipse cx="100" cy="144" rx="12" ry="25" fill="#142443" transform="rotate(25 100 144)" /></g>
          {step === 1 && ['linear', 'lateral', 'pivot'].includes(lesson.art) && <path d={lesson.art === 'linear' ? 'M64 110 V60 l-5 9 m5-9 5 9' : lesson.art === 'lateral' ? 'M75 110 H15 l9-5 m-9 5 9 5' : 'M30 125 Q38 166 78 175 l-6-8 m6 8-10 2'} fill="none" stroke="#b55612" strokeWidth="3" />}
        </g>
        <text x="65" y="209" textAnchor="middle" fontSize="12" fill="#244bdd">Lead = {side.lead}</text><text x="65" y="226" textAnchor="middle" fontSize="12" fill="#142443">Rear = {side.rear}</text>
      </g>
    </svg>
    <div className="demo-controls" aria-label="Illustration stages">{['Set', 'Move', 'Reset'].map((label, index) => <button key={label} aria-pressed={step === index} onClick={() => setStep(index)}>{label}</button>)}</div>
    <figcaption>{instruction(captions[step], stance)}<small>Schematic guide to position and direction. Move slowly; this is not a form assessment.</small></figcaption>
  </figure>
}

function Choice({ label, name, values, value, set, format = String }) {
  return <fieldset className="option-field"><legend>{label}</legend><div className="option-grid">{values.map(option => <label key={option} className={`option${value === option ? ' selected' : ''}`}><input type="radio" name={name} checked={value === option} onChange={() => set(name, option)} /><span>{format(option)}</span></label>)}</div></fieldset>
}

export function ReviewMethod() {
  return <details className="review-method"><summary>Use a mirror or optional phone recording</summary><p><strong>Mirror:</strong> place it far enough away to see your head, hands and feet. Glance at your base between repetitions; keep your head facing forward while moving.</p><p><strong>Phone recording:</strong> use your phone’s own camera app on a stable support. Use landscape orientation at about waist-to-chest height, far enough back to keep your whole body, including your feet, in frame throughout each step. Record a short test first and keep the floor clear.</p><p>Keep this timer visible on another device if you record on your phone; switching away from this tab pauses the timer. You can also practise a short untimed take in the camera app, then return here.</p><p>Afterward, replay slowly and use the lesson checklist to choose one thing to repeat. A video or timer cannot confirm correct form. Recording is optional; this app never requests camera access or uploads video.</p></details>
}

export function LessonPage({ lesson, stance, setStance, options, setOption, bell, setBell, start, open, go, progress, saveReview }) {
  const index = LESSONS.findIndex(item => item.id === lesson.id)
  return <section className="wrap inner-page lesson-page" aria-labelledby="lesson-title">
    <button className="back-button" onClick={() => go('train')}><ArrowLeft size={18} /> Learning path</button>
    <p className="learning-label">Module {lesson.moduleNumber}: {lesson.moduleTitle} / Level {lesson.levelNumber}{lesson.moduleId === 'foundation' && lesson.levelNumber === 4 ? ` / Exercise ${lesson.exerciseNumber}` : ''}</p>
    <h1 className="page-title" id="lesson-title">{lesson.title}</h1><p className="page-intro"><strong>Your objective:</strong> {lesson.objective}</p>
    <div className="lesson-layout"><div className="lesson-content">
      <Choice label="Your stance" name="stance" values={['Orthodox', 'Southpaw']} value={stance} set={(_, value) => setStance(value)} />
      <p className="stance-explainer">Orthodox: left side leads, right side is rear. Southpaw: right side leads, left side is rear. Choose the stance that feels comfortable and keep it for this lesson.</p>
      <LessonIllustration key={lesson.id} lesson={lesson} stance={stance} />
      <PunchLabels numbers={lesson.punches} />
      <div className="technique-notes"><h2>Keep these cues in mind</h2><ul>{lesson.cues.map(cue => <li key={cue}>{instruction(cue, stance)}</li>)}</ul><h2>Common mistakes</h2><ul>{lesson.mistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul></div>
      <ReviewMethod />
    </div><aside className="lesson-practice"><div className="session-plan"><h2>Practise this lesson</h2><p>Practise solo shadowboxing without contact. Clear enough space for small steps, ease in gently and stop if anything hurts.</p>
      <Choice label="Short rounds" name="rounds" values={[1, 2, 3]} value={options.rounds} set={setOption} />
      <Choice label="Practice per round" name="work" values={[30, 45, 60]} value={options.work} set={setOption} format={formatTime} />
      <Choice label="Rest between rounds" name="rest" values={[15, 30, 45, 60]} value={options.rest} set={setOption} format={formatTime} />
      <label className="plain-check"><input type="checkbox" checked={bell} onChange={event => setBell(event.target.checked)} /> Round bell</label>
      <p className="audio-note">Lesson cues appear on screen. Spoken technique clips are not available for these lessons.</p><p>{formatTime(options.rounds * options.work + (options.rounds - 1) * options.rest)} plus ready cues</p>
      <button className="button primary start-button" onClick={start}><Play size={18} /> Start practice</button>
    </div><div className="lesson-review-preview"><h2>Review after practice</h2><ul>{lesson.review.map(item => <li key={item}>{item}</li>)}</ul><p>Notice one thing to repeat. A completed round means you practised, not that you mastered the skill.</p></div></aside></div>
    {progress?.practices > 0 && <SelfReview key={`${lesson.id}-${progress.practices}`} lesson={lesson} progress={progress} save={saveReview} />}
    <nav className="lesson-navigation" aria-label="Lesson navigation"><button className="button outline" disabled={index === 0} onClick={() => open(LESSONS[index - 1].id)}><ArrowLeft size={18} /> Previous lesson</button><button className="button outline" disabled={index === LESSONS.length - 1} onClick={() => open(LESSONS[index + 1].id)}>Next lesson <ArrowRight size={18} /></button></nav>
  </section>
}

export function SelfReview({ lesson, progress, save }) {
  const [checks, setChecks] = useState(() => lesson.review.map((_, index) => progress?.checks?.[index] === true))
  const [saved, setSaved] = useState(progress?.reviewed === true)
  return <div className="self-review"><h2>Your self-review</h2><p>Check only what you noticed. Leave uncertain items unchecked and revisit them next time. This is your observation, not a technique score.</p><fieldset><legend>After a mirror check or video replay</legend>{lesson.review.map((item, index) => <label className="plain-check" key={item}><input type="checkbox" checked={checks[index]} onChange={event => { setChecks(previous => previous.map((value, i) => i === index ? event.target.checked : value)); setSaved(false) }} />{item}</label>)}</fieldset><button className="button outline" onClick={() => { save(lesson.id, checks); setSaved(true) }}>Save self-review</button>{saved && <p role="status">Self-review saved. Repeat anything that still feels uncertain.</p>}</div>
}

export function LessonComplete({ lesson, state, progress, saveReview, repeat, open, go }) {
  const following = LESSONS[LESSONS.findIndex(item => item.id === lesson.id) + 1]
  return <section className="wrap inner-page" aria-labelledby="lesson-complete-title"><p className="learning-label">{lesson.title}</p><h1 className="page-title" id="lesson-complete-title">Practice complete.</h1><p className="page-intro">You finished {state.round} {state.round === 1 ? 'round' : 'rounds'} ({formatTime(state.round * state.settings.work)} of practice). The timer records practice, not mastery. Review what you noticed before deciding whether to repeat.</p><SelfReview key={`${lesson.id}-${progress?.practices ?? 0}`} lesson={lesson} progress={progress} save={saveReview} /><ReviewMethod /><div className="summary-actions"><button className="button primary" onClick={repeat}><RotateCcw size={18} /> Repeat lesson</button>{following && <button className="button outline" onClick={() => open(following.id)}>Open next lesson <ArrowRight size={18} /></button>}<button className="button outline" onClick={() => go('train')}>Learning path</button></div></section>
}
