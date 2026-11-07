import { DEFAULT_SETTINGS } from './session.js'
import { LESSONS } from './curriculum.js'

const SETTINGS = 'roundhouse:settings:v1'
const HISTORY = 'roundhouse:history:v1'
export const ROUND_OPTIONS = [1, 3, 5]
export const WORK_OPTIONS = [30, 60, 120, 180]
export const REST_OPTIONS = [15, 30, 45, 60]
export const LEVELS = ['Beginner', 'Medium', 'Intermediate']
export const SPEEDS = ['Slow', 'Steady', 'Fast']
export const STANCES = ['Orthodox', 'Southpaw']

function read(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The current visit can continue with in-memory data.
  }
}

export function readSettings() {
  const saved = read(SETTINGS, {}) || {}
  const options = { rounds: ROUND_OPTIONS, work: WORK_OPTIONS, rest: REST_OPTIONS, level: LEVELS, speed: SPEEDS, stance: STANCES }
  return Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, defaultValue]) => {
    const valid = options[key] ? options[key].includes(saved[key]) : typeof saved[key] === typeof defaultValue
    return [key, valid ? saved[key] : defaultValue]
  }))
}

export function saveSettings(settings) {
  write(SETTINGS, settings)
}

export function readHistory() {
  const saved = read(HISTORY, [])
  return Array.isArray(saved)
    ? saved.filter(entry => entry && typeof entry.id === 'string' && Number.isFinite(entry.date) && Math.abs(entry.date) <= 8640000000000000 && Number.isInteger(entry.rounds) && entry.rounds > 0 && Number.isFinite(entry.work) && entry.work > 0 && ['boxing', 'ground', 'football'].includes(entry.mode))
    : []
}

export function saveHistory(history) {
  write(HISTORY, history)
}

export function readProgress() {
  const saved = read('roundhouse:learning:v1', {})
  return Object.fromEntries(LESSONS.flatMap(({ id, review }) => {
    const value = saved?.[id]
    if (!value || !Number.isInteger(value.practices) || value.practices < 1) return []
    return [[id, { practices: value.practices, reviewed: value.reviewed === true, checks: review.map((_, index) => value.checks?.[index] === true) }]]
  }))
}

export function saveProgress(progress) { write('roundhouse:learning:v1', progress) }

export function recordPractice(progress, lessonId) {
  if (!LESSONS.some(item => item.id === lessonId)) return progress
  const previous = progress[lessonId]
  return { ...progress, [lessonId]: { practices: (previous?.practices ?? 0) + 1, reviewed: false, checks: [] } }
}

export function readLessonSettings() {
  const saved = read('roundhouse:lesson-settings:v1', {})
  return {
    rounds: [1, 2, 3].includes(saved?.rounds) ? saved.rounds : 2,
    work: [30, 45, 60].includes(saved?.work) ? saved.work : 30,
    rest: REST_OPTIONS.includes(saved?.rest) ? saved.rest : 30,
  }
}
export function saveLessonSettings(settings) { write('roundhouse:lesson-settings:v1', settings) }
