export function Brand({ light = false }) {
  return (
    <span className={`brand${light ? ' brand-light' : ''}`}>
      <img src="/roundhouse.svg" alt="" width="36" height="36" />
      <span>roundhouse<span className="brand-period">.</span></span>
    </span>
  )
}

function Glove({ transform, fill }) {
  return (
    <g transform={transform}>
      <path d="M-45 19Q-58 3-61-18q-3-18 9-24 10-6 24 5l2-31q2-27 23-32 14-4 26 2 15-2 24 8 15 3 20 15 9 13 7 42-2 37-19 53l-8 20h-80z" fill={fill} stroke="#142443" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M-26-34q8 6 9 17 2 11-2 23m5-51q17-12 51-8m-2-32q10 8 8 26m14-17q6 8 4 18M-29 17q29 12 83 1" fill="none" stroke="#142443" strokeWidth="3.4" strokeLinecap="round"/>
      <path d="M-36 29q45 7 90-2l-2 37q-46 9-87-1z" fill="#fbfcff" stroke="#142443" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M-29 47q38 7 73-1" fill="none" stroke="#244bdd" strokeWidth="3.3"/>
      <path d="M-14-78q8-11 24-11" fill="none" stroke="#fbfcff" strokeWidth="4" strokeLinecap="round" opacity=".8"/>
    </g>
  )
}

export function RingArt() {
  return (
    <svg className="ring-art" viewBox="0 0 560 440" fill="none" aria-hidden="true">
      <defs>
        <pattern id="art-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0v26" stroke="#5170e9" strokeWidth=".8"/>
        </pattern>
        <clipPath id="ring-clip"><path d="M77 226 298 107l212 118-224 125z"/></clipPath>
      </defs>
      <path d="M0 0h560v440H0z" fill="#244bdd"/>
      <path d="M0 0h560v440H0z" fill="url(#art-grid)" opacity=".55"/>
      <path d="M-22 384 500 95m-476 328L542 134m-480 326 515-286" stroke="#7f9af6" strokeWidth="1" opacity=".45"/>
      <circle cx="292" cy="214" r="140" stroke="#a5b6fc" strokeWidth="1" strokeDasharray="3 7"/>
      <circle cx="292" cy="214" r="175" stroke="#a5b6fc" strokeWidth="1" opacity=".4"/>
      <path d="m77 226 221-119 212 118-224 125z" fill="#8ba7ff" stroke="#142443" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M79 227v25l206 126 224-126v-27L286 350z" fill="#172a76" stroke="#142443" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M287 351v24" stroke="#8ba7ff" strokeWidth="2"/>
      <g clipPath="url(#ring-clip)" opacity=".65">
        <path d="m124 225 174-94 163 94-176 99z" stroke="#f8faff" strokeWidth="2"/>
        <ellipse cx="292" cy="224" rx="86" ry="37" stroke="#eaf0ff" strokeWidth="2"/>
        <path d="M40 196 284 346m36-194 196 109m-379-89 257 140" stroke="#d5dfff" strokeWidth="1"/>
      </g>
      <g stroke="#eef3ff" strokeWidth="3" strokeLinejoin="round">
        <path d="m87 198 210-116 203 115-212 122z"/>
        <path d="m87 183 210-116 203 115-212 122z"/>
        <path d="m87 168 210-116 203 115-212 122z"/>
      </g>
      <path d="M87 158v74m210-191v72m203 45v76m-213 48v77" stroke="#142443" strokeWidth="13" strokeLinecap="round"/>
      <path d="M87 158v74m210-191v72m203 45v76m-213 48v77" stroke="#f6a355" strokeWidth="7" strokeLinecap="round"/>
      <path d="M196 96l-22-12m15 35-32-2m268 9 17-16m-8 38 25-1" stroke="#eaf0ff" strokeWidth="3" strokeLinecap="round"/>
      <Glove transform="translate(242 177) rotate(-24) scale(.85)" fill="#f6a355"/>
      <Glove transform="translate(351 158) rotate(21) scale(-.89 .89)" fill="#ffbd7d"/>
      <path d="M286 290 88 169m200 121 212-123" stroke="#f8faff" strokeWidth="3" strokeLinejoin="round" opacity=".85"/>
      <path d="M46 64h35m-35 0v35m468 277h-35m35 0v-35" stroke="#eef3ff" strokeWidth="2"/>
      <path d="M52 381h55m-55 9h31m412-314h-55m55-9h-31" stroke="#8ba7ff" strokeWidth="2"/>
    </svg>
  )
}

export function ModeArt({ mode }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true">
      {mode === 'boxing' && <Glove transform="translate(29 33) rotate(-18) scale(.25)" fill="#f6a355"/>}
      {mode === 'ground' && <>
        <path d="M13 44h36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="m22 31 10-5 8 7 4 10m-15-15-7 9-9 5m19-15 6-7 6 2" stroke="currentColor" strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="33" cy="19" r="4.5" fill="currentColor"/>
        <path d="M16 21h7m-11 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      </>}
      {mode === 'football' && <>
        <circle cx="31" cy="30" r="15" stroke="currentColor" strokeWidth="2.6"/>
        <path d="m31 24 6 4-2 7h-8l-2-7z" fill="currentColor"/>
        <path d="m31 24 1-9m5 13 9-2m-11 9 5 7m-13-7-5 7m3-14-8-4" stroke="currentColor" strokeWidth="2"/>
      </>}
    </svg>
  )
}

export function DirectionArt({ clockwise }) {
  return (
    <svg viewBox="0 0 108 72" fill="none" aria-hidden="true">
      <g transform={clockwise ? undefined : 'translate(108 0) scale(-1 1)'}>
        <ellipse cx="54" cy="37" rx="37" ry="25" stroke="currentColor" strokeWidth="3" strokeDasharray="3 6" opacity=".45"/>
        <path d="M17 37c0-14 17-25 37-25 17 0 32 8 36 19m-12-3 13 5 5-11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m42 40 5-9m13 9 5-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
