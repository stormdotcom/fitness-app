import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LESSONS } from './curriculum.js'

test('every lesson renders its content, stance, practice controls, review and navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  try {
    const { LessonPage, LearningPath, LessonComplete } = await server.ssrLoadModule('/src/Learning.jsx')
    const noop = () => {}
    for (const stance of ['Orthodox', 'Southpaw']) for (const lesson of LESSONS) {
      const html = renderToStaticMarkup(createElement(LessonPage, {
        lesson, stance, setStance: noop, options: { rounds: 2, work: 30, rest: 30 },
        setOption: noop, bell: true, setBell: noop, start: noop, open: noop, go: noop, saveReview: noop,
      }))
      for (const label of ['Your objective:', 'Keep these cues in mind', 'Common mistakes', 'Rest between rounds', 'Review after practice', 'Start practice', 'Previous lesson', 'Next lesson', 'phone recording']) assert.ok(html.includes(label), `${lesson.id}: ${label}`)
      assert.ok(html.includes(`Lead = ${stance === 'Southpaw' ? 'right' : 'left'}`))
      assert.ok(html.includes(`Rear = ${stance === 'Southpaw' ? 'left' : 'right'}`))
      assert.doesNotMatch(html, /\{lead\}|\{rear\}/)
      assert.match(html, /name="work" checked=""/)
      assert.doesNotMatch(html, /<video|type="file"|technique score:\s*\d/i)
      if (lesson.moduleId === 'foundation') assert.doesNotMatch(html, /Punch [1-6]/)
      for (const number of lesson.punches) assert.ok(html.includes(`Punch ${number}`))
    }
    const path = renderToStaticMarkup(createElement(LearningPath, { progress: { stance: { practices: 1 } }, open: noop, go: noop }))
    assert.match(path, /1 of 19 lessons practised/)
    assert.match(path, /<h2>Maintain and reset your stance<\/h2>/)
    assert.match(path, /Self-review pending/)
    const complete = renderToStaticMarkup(createElement(LessonComplete, { lesson: LESSONS[0], state: { round: 2, settings: { work: 30 } }, progress: { practices: 1 }, saveReview: noop, repeat: noop, open: noop, go: noop }))
    assert.match(complete, /Practice complete/)
    assert.match(complete, /Save self-review/)
    assert.match(complete, /Repeat lesson/)
    assert.match(complete, /Open next lesson/)
    const last = renderToStaticMarkup(createElement(LessonComplete, { lesson: LESSONS.at(-1), state: { round: 1, settings: { work: 30 } }, progress: { practices: 1 }, saveReview: noop, repeat: noop, open: noop, go: noop }))
    assert.doesNotMatch(last, /Open next lesson/)
  } finally {
    await server.close()
  }
})
