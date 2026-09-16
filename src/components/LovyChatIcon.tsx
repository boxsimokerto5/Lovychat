import React from 'react';

interface LovyChatIconProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export function LovyChatIcon({ className = '', size = 40, withText = false }: LovyChatIconProps) {
  if (withText) {
    return (
      <img
        src="/assets/lovychat-logo.svg"
        alt="LovyChat"
        width={size}
        height={size}
        className={`inline-block select-none object-contain ${className}`}
      />
    );
  }

  // Pure SVG icon mark without text for compact headers/avatars
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="compBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D285" />
          <stop offset="35%" stopColor="#00BA71" />
          <stop offset="70%" stopColor="#019154" />
          <stop offset="100%" stopColor="#016238" />
        </linearGradient>

        <linearGradient id="compGlossGrad" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="compHeartGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#027D4C" />
          <stop offset="50%" stopColor="#015D37" />
          <stop offset="100%" stopColor="#014327" />
        </linearGradient>

        <filter id="compBubbleShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#013A20" floodOpacity="0.32" />
        </filter>

        <filter id="compHeartShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#012B18" floodOpacity="0.25" />
        </filter>

        <clipPath id="compSquircleClip">
          <rect x="12" y="12" width="488" height="488" rx="118" ry="118" />
        </clipPath>
      </defs>

      {/* Main Squircle Background */}
      <rect x="12" y="12" width="488" height="488" rx="118" ry="118" fill="url(#compBgGrad)" />

      {/* Diagonal Gloss Highlight */}
      <g clipPath="url(#compSquircleClip)">
        <path d="M 0 0 L 512 0 L 512 160 C 370 170 210 240 100 370 C 50 430 20 480 0 512 Z" fill="url(#compGlossGrad)" />
      </g>

      {/* Sparkles */}
      <g transform="translate(440, 105)">
        <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#E2FFF0" opacity="0.85" />
      </g>
      <g transform="translate(85, 345)">
        <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 12 Z" fill="#E2FFF0" opacity="0.8" />
      </g>

      {/* Layered Background Bubble */}
      <g opacity="0.28" transform="translate(232, 185) scale(0.92) translate(-232, -185)">
        <path d="M 150 160 C 150 115 190 85 240 85 C 290 85 330 115 330 160 C 330 178 322 195 310 208 L 316 232 C 317 236 313 239 309 237 L 285 226 C 271 232 256 235 240 235 C 190 235 150 205 150 160 Z" fill="#FFFFFF" />
        <path d="M 240 142 C 235 132 222 125 210 130 C 196 136 195 152 205 165 L 240 195 L 275 165 C 285 152 284 136 270 130 C 258 125 245 132 240 142 Z" fill="#015230" opacity="0.4" />
      </g>

      {/* Main Speech Bubble Shape */}
      <g filter="url(#compBubbleShadow)">
        <path d="M 256 160
                 C 336 160 415 186 415 272
                 C 415 348 350 382 288 382
                 C 264 382 238 376 216 388
                 L 174 416
                 C 161 425 148 418 148 402
                 L 148 372
                 C 112 355 95 318 95 272
                 C 95 186 176 160 256 160 Z"
              fill="#FFFFFF" />
      </g>

      {/* Heart inside Speech Bubble */}
      <g filter="url(#compHeartShadow)">
        <path d="M 256 338
                 C 250 338 214 308 178 268
                 C 142 228 125 198 126 166
                 C 127 132 153 112 186 112
                 C 215 112 242 129 256 150
                 C 270 129 297 112 326 112
                 C 359 112 385 132 386 166
                 C 387 198 370 228 334 268
                 C 298 308 262 338 256 338 Z"
              transform="translate(256, 248) scale(0.68) translate(-256, -225)"
              fill="url(#compHeartGrad)" />
        
        {/* Heart Glossy Crescent Shine */}
        <path d="M 216 195
                 C 210 205 210 222 215 236
                 C 217 240 214 245 209 243
                 C 204 241 201 234 199 226
                 C 196 212 198 198 206 189
                 C 210 184 218 188 216 195 Z"
              fill="#FFFFFF" opacity="0.92" />
      </g>
    </svg>
  );
}

export default LovyChatIcon;
