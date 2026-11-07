# Roundhouse coach voice

These original synthetic recordings were generated for Roundhouse with Kokoro-82M v1.0, voice `af_heart`, using the `kokoro-js` JavaScript API. They are AI-generated, not recordings of a human coach.

Model and license: https://huggingface.co/hexgrad/Kokoro-82M (Apache-2.0).
Generator: https://github.com/hexgrad/kokoro/tree/main/kokoro.js (Apache-2.0).

Regenerate from the project root with `node scripts/generate-voice.mjs`. The first run downloads the model; the deployed app only loads the generated WAV files and never downloads or runs the model. The phrase manifest is derived from `src/session.js`.

Recordings play at their original pitch and speed. Cue pace controls the gap between workout calls.
