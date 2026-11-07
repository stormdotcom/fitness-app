export function trimSilence(samples, sampleRate) {
  let start = 0
  let end = samples.length - 1
  while (start < end && Math.abs(samples[start]) < 0.004) start++
  while (end > start && Math.abs(samples[end]) < 0.004) end--
  return samples.slice(Math.max(0, start - Math.round(sampleRate * 0.04)), Math.min(samples.length, end + Math.round(sampleRate * 0.08)))
}
