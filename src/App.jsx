import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, Bell, Check, ChevronRight, Clock3,
  Footprints, History, Info, Play, Pause, RotateCcw, Square, Timer, Volume2, X,
} from 'lucide-react'
import { Brand, DirectionArt, ModeArt, RingArt } from './Artwork.jsx'
import { formatTime, MODES, PUNCHES } from './session.js'
import { LEVELS, REST_OPTIONS, ROUND_OPTIONS, SPEEDS, STANCES, WORK_OPTIONS, readHistory, readSettings, saveHistory, saveSettings } from './storage.js'
import useTraining from './useTraining.js'
import { getLesson } from './curriculum.js'
import { LearningPath, LessonPage, LessonComplete, PunchLabels } from './Learning.jsx'
import { readProgress, saveProgress, recordPractice, readLessonSettings, saveLessonSettings } from './storage.js'

const NAV = [['train', 'Learn boxing'], ['workouts', 'Workouts'], ['history', 'My sessions']]
const NAV_LABEL = { train: 'Learn boxing', lesson: 'Learn boxing', workouts: 'Workouts', setup: 'Workouts', session: 'Learn boxing', history: 'My sessions' }
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function Header({ view, go }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <button className="brand-button" aria-label="Roundhouse home" onClick={() => go('train')}><Brand /></button>
        <nav aria-label="Main navigation">
          {NAV.map(([id, label]) => (
            <button key={id} className={NAV_LABEL[view] === label ? 'nav-active' : ''} aria-current={NAV_LABEL[view] === label ? 'page' : undefined} onClick={() => go(id)}>
              {id === 'history' && <History size={16} aria-hidden="true" />}{label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Home({ choose, go }) {
  return (
    <>
      <section className="hero wrap" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="hero-stamp"><span /> The guided training club</div>
          <h1 id="home-title">Find your rhythm.<br />Own your round.</h1>
          <p>Train at your pace with timed rounds and real-time cues for boxing, bodyweight work and football.</p>
          <div className="hero-actions">
            <a href="#modes" className="button primary">Choose a workout <ArrowDown size={19} /></a>
            <button className="button text-button" onClick={() => go('guide')}>How it works <ChevronRight size={17} /></button>
          </div>
        </div>
        <div className="hero-visual">
          <RingArt />
          <div className="visual-stamp"><span /> In the ring <span className="stamp-divider" /> Round 01</div>
        </div>
      </section>

      <section className="wrap modes" id="modes" aria-labelledby="modes-title">
        <div className="section-heading">
          <div><div className="section-kicker">Training modes</div><h2 id="modes-title">Choose your workout.</h2></div>
          <p>Set your rounds, follow the cues and keep moving.</p>
        </div>
        <div className="mode-grid">
          {Object.entries(MODES).map(([id, mode]) => (
            <article className={`mode-card mode-${id}`} key={id}>
              <div className="mode-card-top">
                <div className="mode-icon"><ModeArt mode={id} /></div>
                <span className="mode-tag">{mode.tag}</span>
              </div>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
              <button className="mode-action" onClick={() => choose(id)} aria-label={`Set up ${mode.title.toLowerCase()}`}>Set up session <ArrowRight size={19} /></button>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function PunchKey({ count = PUNCHES.length }) {
  return <ol className="punch-key">{PUNCHES.slice(0, count).map((punch, index) => <li key={punch}><span>{index + 1}</span>{punch}</li>)}</ol>
}

function Options({ label, name, values, settings, set, format = String }) {
  return (
    <fieldset className="option-field">
      <legend>{label}</legend>
      <div className="option-grid">
        {values.map(value => (
          <label className={`option${settings[name] === value ? ' selected' : ''}`} key={value}>
            <input type="radio" name={name} checked={settings[name] === value} onChange={() => set(name, value)} />
            <span>{format(value)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Toggle({ name, label, checked, set, Icon }) {
  return (
    <label className="toggle-row">
      <span className="toggle-label">{Icon && <Icon size={17} aria-hidden="true" />}{label}</span>
      <input type="checkbox" checked={checked} onChange={event => set(name, event.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  )
}

function Setup({ mode, settings, set, start, testAudio, go }) {
  const details = MODES[mode]
  const [audioNote, setAudioNote] = useState('')
  const config = { settings, set }
  const testingEnabled = settings.voice || settings.bell
  const total = settings.rounds * settings.work + (settings.rounds - 1) * settings.rest
  return (
    <section className="wrap inner-page" aria-labelledby="setup-title">
      <button className="back-button" onClick={() => go('workouts')}><ArrowLeft size={18} /> All workouts</button>
      <div className="inner-heading">
        <div className="mode-icon"><ModeArt mode={mode} /></div>
        <div><div className="section-kicker">Session setup</div><h1 id="setup-title">{details.title}</h1></div>
      </div>
      <div className="setup-layout">
        <div className="setup-card">
          <div className="setting-group">
            <h2><Timer size={22} /> Round timer</h2>
            <Options label="Rounds" name="rounds" values={ROUND_OPTIONS} {...config} />
            <Options label="Work per round" name="work" values={WORK_OPTIONS} format={formatTime} {...config} />
            <Options label="Rest between rounds" name="rest" values={REST_OPTIONS} format={formatTime} {...config} />
          </div>
          <div className="setting-group">
            <h2><Footprints size={22} /> Training cues</h2>
            <Options label="Level" name="level" values={LEVELS} {...config} />
            <Options label="Cue pace" name="speed" values={SPEEDS} {...config} />
            {mode === 'boxing' && <>
              <Options label="Starting stance" name="stance" values={STANCES} {...config} />
              {settings.level === 'Beginner'
                ? <p className="audio-note">Beginner keeps your chosen stance and position. Medium and Intermediate add position changes.</p>
                : <><Toggle name="movement" label="Clockwise and anticlockwise position changes" checked={settings.movement} set={set} /><Toggle name="switchStance" label="Stance switches" checked={settings.switchStance} set={set} /></>}
            </>}
          </div>
          <div className="setting-group">
            <h2><Volume2 size={22} /> Sound</h2>
            <Toggle name="voice" label="Natural coach voice" checked={settings.voice} set={set} Icon={Volume2} />
            <p className="audio-note">AI-generated voice. Cue pace changes the time between calls.</p>
            <Toggle name="bell" label="Round bell" checked={settings.bell} set={set} Icon={Bell} />
            <button className="button outline small" disabled={!testingEnabled} onClick={() => setAudioNote(testAudio(settings, setAudioNote))}>
              <Play size={15} /> Test audio
            </button>
            {audioNote && testingEnabled && <span className="audio-note" role="status">{audioNote}</span>}
          </div>
        </div>

        <aside className="setup-aside">
          <div className="session-plan">
            <div className="section-kicker">Your session</div>
            <h2>{settings.rounds} {settings.rounds === 1 ? 'round' : 'rounds'}</h2>
            <ul>
              <li><Clock3 size={17} /> Work <strong>{formatTime(settings.work)} per round</strong></li>
              {settings.rounds > 1 && <li><Pause size={17} /> Rest <strong>{formatTime(settings.rest)} between rounds</strong></li>}
              <li><Timer size={17} /> Total <strong>{formatTime(total)} plus ready cues</strong></li>
            </ul>
            <button className="button primary start-button" onClick={start}><Play size={19} fill="currentColor" /> Start session</button>
          </div>
          <div className="workout-guide">
            <h2>{mode === 'boxing' ? 'Know your punches' : 'Before you start'}</h2>
            <p>{details.instructions}</p>
            {mode === 'boxing' && <><p>Start with your guard, then hear 1, 2, 3 and 4 with a gap between each call. Beginner continues with single punches that can repeat. Higher levels add quicker, more varied calls and position changes.</p><PunchKey count={4} /></>}
            <p className="equipment"><strong>You’ll need</strong> {details.equipment}</p>
            <div className="warmup"><Info size={18} /><span>{details.warmup}</span></div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Cue({ state, seconds }) {
  if (state.phase === 'preparing') {
    const guard = state.mode === 'boxing' && seconds === 1
    return <div className="cue-text" aria-live="polite"><div className="cue-label">Round {state.round} coming up</div><h2>{guard ? 'Guard up.' : 'Get ready.'}</h2><p>{state.mode === 'boxing' ? 'Set your feet and bring your hands up.' : 'Get into position for the first cue.'}</p></div>
  }
  if (state.phase === 'resting') {
    return <div className="cue-text"><div className="cue-label">Round {state.round} complete</div><h2>{seconds <= 10 ? 'Next round soon.' : 'Take a breather.'}</h2><p>{seconds <= 10 ? 'Get back into position.' : 'Relax your shoulders and take a few steady breaths.'}</p></div>
  }
  const cue = state.cue
  return (
    <div className="cue-text" aria-live="polite" aria-atomic="true">
      <div className="cue-label">{({ lesson: 'Current exercise', combo: 'Punch call', movement: 'Position change', switch: 'Stance change', drill: 'Current drill', intro: 'Punch check' })[cue.kind]}</div>
      {cue.kind === 'movement' && <div className="direction"><DirectionArt clockwise={cue.id === 'clockwise'} /></div>}
      <h2 className={cue.numbers ? 'combo' : undefined}>{cue.numbers ? cue.numbers.join(' – ') : cue.title}</h2>
      <p>{cue.detail}</p>
    </div>
  )
}

function Session({ snapshot, pause, resume, requestEnd }) {
  const { state, seconds } = snapshot
  const { mode, round, settings, phase, stance } = state
  const lesson = getLesson(settings.lessonId)
  const paused = state.pausedAt !== null
  const phaseLabel = { preparing: 'Get ready', working: 'Work', resting: 'Rest' }[phase]
  return (
    <section className="wrap live-page" aria-labelledby="session-title">
      <div className="live-heading">
        <div><div className="section-kicker">{lesson ? `Module ${lesson.moduleNumber} · Level ${lesson.levelNumber}` : 'Training session'}</div><h1 id="session-title">{lesson?.title ?? MODES[mode].title}</h1></div>
        <div className="round-heading"><strong>Round {round} of {settings.rounds}</strong><div className="round-pips" aria-hidden="true">{Array.from({ length: settings.rounds }, (_, i) => <span className={i < round ? 'filled' : ''} key={i} />)}</div></div>
      </div>
      <div className={`training-board phase-${phase}${lesson ? ' lesson-board' : ''}`}>
        <div className="board-top">
          <span className="phase-chip"><span /> {paused ? 'Paused' : phaseLabel}</span>
          {mode === 'boxing' && <div className="board-status">{phase === 'working' && !lesson && state.direction && <span className="direction-chip"><DirectionArt clockwise={state.direction === 'clockwise'} /> Keep circling {state.direction === 'clockwise' ? 'clockwise' : 'anticlockwise'}</span>}<span className="stance-chip">{stance} stance</span></div>}
        </div>
        <div className="timer-value" role="timer" aria-label={`${seconds} seconds remaining`}>{formatTime(seconds)}</div>
        <Cue state={state} seconds={seconds} />
        <progress className="phase-progress" max={state.phaseDuration / 1000} value={seconds} aria-label={`${phaseLabel} time remaining`} />
      </div>
      <div className="live-controls">
        <button className="button primary" onClick={paused ? resume : pause}>{paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}{paused ? 'Resume session' : 'Pause session'}</button>
        <button className="button outline" onClick={requestEnd}><Square size={16} /> End session</button>
      </div>
      {paused && <p className="pause-note" role="status">The timer pauses when you leave this tab. Resume when you’re ready.</p>}
      {mode === 'boxing' && <div className="live-key">{lesson ? <PunchLabels numbers={lesson.punches} /> : <PunchKey count={4} />}</div>}
    </section>
  )
}

function Complete({ state, trainAgain, go }) {
  const { mode, settings } = state
  return (
    <section className="wrap inner-page summary-page" aria-labelledby="complete-title">
      <div className="summary-card">
        <div className="completion-icon"><Check size={34} /></div>
        <div className="section-kicker">{MODES[mode].title}</div>
        <h1 id="complete-title">Session complete.</h1>
        <p>You finished {settings.rounds} {settings.rounds === 1 ? 'round' : 'rounds'}. Take a moment to cool down.</p>
        <div className="summary-stats">
          <div><strong>{settings.rounds}</strong><span>Rounds completed</span></div>
          <div><strong>{formatTime(settings.rounds * settings.work)}</strong><span>Work time</span></div>
        </div>
        <div className="summary-actions">
          <button className="button primary" onClick={trainAgain}><RotateCcw size={18} /> Train again</button>
          <button className="button outline" onClick={() => go('history')}><History size={18} /> My sessions</button>
        </div>
      </div>
    </section>
  )
}

function Guide({ go }) {
  return (
    <section className="wrap inner-page" aria-labelledby="guide-title">
      <button className="back-button" onClick={() => go('train')}><ArrowLeft size={18} /> Train</button>
      <div className="section-kicker">The Roundhouse guide</div><h1 className="page-title" id="guide-title">How it works.</h1>
      <p className="page-intro">Start with Learn boxing for the beginner path: read the objective, explore the illustration, practise a short round, then self-review. Other workouts keep the original mixed cue trainer, bodyweight and football sessions.</p>
      <ol className="guide-steps">
        <li><span>1</span><div><h2>Set your rounds.</h2><p>Choose your work and rest time, difficulty and cue pace. Try the audio preview before starting.</p></div></li>
        <li><span>2</span><div><h2>Follow each cue.</h2><p>In boxing, throw the numbers in order. In ground workout and football, repeat the drill until the next cue.</p></div></li>
        <li><span>3</span><div><h2>Rest, then reset.</h2><p>The bell marks round boundaries. The final ten seconds of rest count down before a brief ready cue.</p></div></li>
      </ol>
      <div className="workout-guide guide-punch"><h2>The boxing punch key</h2><PunchKey /><p>Orthodox leads with your left foot. Southpaw leads with your right.</p></div>
      <button className="button primary" onClick={() => go('train')}>Choose a workout <ArrowRight size={18} /></button>
    </section>
  )
}

function Sessions({ history, go }) {
  return (
    <section className="wrap inner-page" aria-labelledby="history-title">
      <button className="back-button" onClick={() => go('train')}><ArrowLeft size={18} /> Train</button>
      <div className="section-kicker">Training log</div><h1 className="page-title" id="history-title">My sessions.</h1>
      <p className="page-intro">Your completed sessions on this device.</p>
      {history.length ? (
        <ul className="history-list">
          {history.map(entry => (
            <li key={entry.id}>
              <div className="mode-icon"><ModeArt mode={entry.mode} /></div>
              <div><h2>{getLesson(entry.lessonId)?.title ?? MODES[entry.mode].title}</h2><time dateTime={new Date(entry.date).toISOString()}>{dateFormat.format(entry.date)}</time>{entry.lessonId && <small className="history-practice">Practice completed · technique not assessed</small>}</div>
              <div className="history-work"><strong>{entry.rounds} {entry.rounds === 1 ? 'round' : 'rounds'}</strong><span>{formatTime(entry.work * entry.rounds)} work time</span></div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-card"><History size={31} /><h2>No sessions yet.</h2><p>Finish your first session and you’ll see it here.</p><button className="button primary" onClick={() => go('train')}>Choose a workout <ArrowRight size={18} /></button></div>
      )}
    </section>
  )
}

function EndDialog({ onKeep, onEnd }) {
  const dialog = useRef(null)
  useEffect(() => { dialog.current.showModal() }, [])
  return (
    <dialog ref={dialog} className="end-dialog" aria-labelledby="end-title" onCancel={event => { event.preventDefault(); onKeep() }}>
      <button className="dialog-close" onClick={onKeep} aria-label="Close confirmation"><X size={22} /></button>
      <h2 id="end-title">End this session?</h2>
      <p>Ending now discards this session from your training log.</p>
      <div className="dialog-actions">
        <button className="button outline" onClick={onKeep} autoFocus>Keep training</button>
        <button className="button danger" onClick={onEnd}>End session</button>
      </div>
    </dialog>
  )
}

export default function App() {
  const [view, setView] = useState('train')
  const [mode, setMode] = useState('boxing')
  const [settings, setSettings] = useState(readSettings)
  const [history, setHistory] = useState(readHistory)
  const [progress, setProgress] = useState(readProgress)
  const [lessonId, setLessonId] = useState('stance')
  const [lessonOptions, setLessonOptions] = useState(readLessonSettings)
  const [confirmation, setConfirmation] = useState(null)
  const main = useRef(null)
  const hasNavigated = useRef(false)
  const recordedSession = useRef(null)
  const { snapshot, start, pause, resume, end, testAudio, stopAudio } = useTraining()
  const finished = snapshot?.state.phase === 'completed' ? snapshot.state : null

  useEffect(() => { saveSettings(settings) }, [settings])
  useEffect(() => { saveHistory(history) }, [history])
  useEffect(() => { saveProgress(progress) }, [progress])
  useEffect(() => { saveLessonSettings(lessonOptions) }, [lessonOptions])
  useEffect(() => {
    if (!finished || recordedSession.current === finished) return
    recordedSession.current = finished
    const date = Date.now()
    const entry = { id: globalThis.crypto?.randomUUID?.() ?? String(date), date, mode: finished.mode, rounds: finished.round, work: finished.settings.work, ...(finished.settings.lessonId ? { lessonId: finished.settings.lessonId } : {}) }
    setHistory(previous => [entry, ...previous].slice(0, 100))
    if (finished.settings.lessonId) setProgress(previous => recordPractice(previous, finished.settings.lessonId))
  }, [finished])

  useEffect(() => {
    if (!hasNavigated.current) return
    window.scrollTo(0, 0)
    main.current.focus({ preventScroll: true })
  }, [view, finished, lessonId])

  function navigate(destination) {
    if (destination === view) return
    hasNavigated.current = true
    setView(destination)
  }

  function requestEnd(destination = snapshot?.state.settings.lessonId ? 'lesson' : 'setup') {
    setConfirmation({ destination, resume: snapshot?.state.pausedAt === null })
    pause()
  }

  function go(destination) {
    if (view === 'session' && snapshot && !finished) {
      requestEnd(destination)
      return
    }
    if (view === 'session') end()
    if (view === 'setup' && destination !== 'setup') stopAudio()
    navigate(destination)
  }

  function choose(nextMode) {
    setMode(nextMode)
    navigate('setup')
  }

  function openLesson(id) {
    setLessonId(id)
    if (view === 'session') end()
    stopAudio()
    hasNavigated.current = true
    navigate('lesson')
  }

  function saveReview(id, checks) {
    setProgress(previous => previous[id] ? { ...previous, [id]: { ...previous[id], checks, reviewed: true } } : previous)
  }

  const lesson = getLesson(lessonId)
  const finishedLesson = getLesson(finished?.settings.lessonId)

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header view={view === 'session' && !snapshot?.state.settings.lessonId ? 'setup' : view} go={go} />
      <main id="main" ref={main} tabIndex={-1}>
        {view === 'train' && <LearningPath progress={progress} open={openLesson} go={go} choose={choose} />}
        {view === 'workouts' && <Home choose={choose} go={go} />}
        {view === 'lesson' && <LessonPage key={lessonId} lesson={lesson} stance={settings.stance} setStance={stance => setSettings(previous => ({ ...previous, stance }))} options={lessonOptions} setOption={(name, value) => setLessonOptions(previous => ({ ...previous, [name]: value }))} bell={settings.bell} setBell={bell => setSettings(previous => ({ ...previous, bell }))} open={openLesson} go={go} progress={progress[lessonId]} saveReview={saveReview} start={() => { start('boxing', { ...settings, ...lessonOptions, lessonId, level: 'Beginner', speed: 'Steady', movement: false, switchStance: false, voice: false }); navigate('session') }} />}
        {view === 'guide' && <Guide go={go} />}
        {view === 'history' && <Sessions history={history} go={go} />}
        {view === 'setup' && <Setup mode={mode} settings={settings} set={(name, value) => setSettings(previous => ({ ...previous, [name]: value }))} testAudio={testAudio} go={go} start={() => { start(mode, settings); navigate('session') }} />}
        {view === 'session' && snapshot && (finished
          ? finishedLesson ? <LessonComplete lesson={finishedLesson} state={finished} progress={progress[finishedLesson.id]} saveReview={saveReview} repeat={() => openLesson(finishedLesson.id)} open={openLesson} go={go} /> : <Complete state={finished} trainAgain={() => go('setup')} go={go} />
          : <Session snapshot={snapshot} pause={pause} resume={resume} requestEnd={() => requestEnd()} />)}
      </main>
      <footer className="site-footer"><div className="wrap footer-inner"><Brand /><span>Guided training for your next round.</span></div></footer>
      {confirmation && <EndDialog onKeep={() => { if (confirmation.resume) resume(); setConfirmation(null) }} onEnd={() => { end(); navigate(confirmation.destination); setConfirmation(null) }} />}
    </>
  )
}
