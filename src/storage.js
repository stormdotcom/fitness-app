import { DEFAULT_SETTINGS } from './session.js'

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
  const saved = read(SETTINGS, {})
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
    ? saved.filter(entry => entry && typeof entry.id === 'string' && typeof entry.date === 'number' && typeof entry.rounds === 'number' && typeof entry.work === 'number' && ['boxing', 'ground', 'football'].includes(entry.mode))
    : []
}

export function saveHistory(history) {
  write(HISTORY, history)
}
