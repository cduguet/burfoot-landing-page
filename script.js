/* ============================================================
   BURFOOT & CO. — interactions
   - patch placement (scattered around each branch section)
   - nav theme shift per section
   - reveal on scroll
   - impact counters count-up
   - subtle parallax on backdrops
   ============================================================ */

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- PATCH LIBRARY ---------- */
  // Each patch is {no, name, lat, svg}
  const patches = {
    forest: [
      {
        no: "07",
        name: "Lady Fern",
        lat: "Athyrium filix-femina",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="#5a7347" stroke="#1e2f18" stroke-width="1.4"><path d="M60 14 C62 34, 62 56, 60 106" stroke="#2e4422" stroke-width="2.2" fill="none"/>
        <path d="M60 24 C50 22, 40 30, 36 36 C42 38, 52 32, 60 28 Z"/>
        <path d="M60 24 C70 22, 80 30, 84 36 C78 38, 68 32, 60 28 Z"/>
        <path d="M60 38 C48 36, 36 44, 30 52 C40 54, 52 46, 60 42 Z"/>
        <path d="M60 38 C72 36, 84 44, 90 52 C80 54, 68 46, 60 42 Z"/>
        <path d="M60 54 C46 52, 32 62, 26 70 C38 72, 52 62, 60 58 Z"/>
        <path d="M60 54 C74 52, 88 62, 94 70 C82 72, 68 62, 60 58 Z"/>
        <path d="M60 72 C46 72, 32 82, 28 90 C40 90, 52 82, 60 78 Z"/>
        <path d="M60 72 C74 72, 88 82, 92 90 C80 90, 68 82, 60 78 Z"/>
        </g></svg>`
      },
      {
        no: "12",
        name: "Pine Marten",
        lat: "Martes martes",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#1e2f18" stroke-width="1.2" fill="#7a4a24"><path d="M18 72 Q18 58 34 54 L52 52 Q66 48 76 54 L92 62 Q104 68 102 82 L94 92 L78 94 L66 88 L48 92 L32 92 L20 86 Z"/>
        <path d="M22 54 L18 44 L28 48 Z M36 52 L32 42 L42 46 Z" fill="#7a4a24"/>
        <ellipse cx="80" cy="70" rx="6" ry="4" fill="#f1e9d4"/>
        <circle cx="82" cy="70" r="1.5" fill="#1e2f18"/>
        <circle cx="92" cy="62" r="1.5" fill="#1e2f18"/>
        </g></svg>`
      },
      {
        no: "19",
        name: "Coral Fungus",
        lat: "Mycena chlorophos",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#1e2f18" stroke-width="1.2"><path d="M24 96 L34 78 L44 96 Z M40 96 L48 72 L58 96 Z M54 96 L62 68 L72 96 Z M68 96 L78 74 L88 96 Z" fill="#d18c4a"/>
        <rect x="22" y="96" width="74" height="8" rx="2" fill="#4a3324"/>
        <path d="M34 78 L34 90 M48 72 L48 92 M62 68 L62 90 M78 74 L78 90" stroke="#8a5a2e"/>
        </g></svg>`
      },
      {
        no: "23",
        name: "Tawny Owl",
        lat: "Strix aluco",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#1e2f18" stroke-width="1.2" fill="#8a6a3a"><ellipse cx="60" cy="66" rx="32" ry="38"/>
        <path d="M32 44 L44 34 L46 50 Z M88 44 L76 34 L74 50 Z" fill="#6a4a1e"/>
        <circle cx="48" cy="60" r="9" fill="#f1e9d4"/><circle cx="72" cy="60" r="9" fill="#f1e9d4"/>
        <circle cx="48" cy="60" r="3.5" fill="#1e2f18"/><circle cx="72" cy="60" r="3.5" fill="#1e2f18"/>
        <path d="M56 70 L60 78 L64 70 Z" fill="#c97842"/>
        <path d="M42 82 Q50 92 60 86 Q70 92 78 82" stroke="#6a4a1e" fill="none"/>
        </g></svg>`
      },
      {
        no: "28",
        name: "Red Deer",
        lat: "Cervus elaphus",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#1e2f18" stroke-width="1.2" fill="#8a5a2e"><path d="M30 78 L30 62 Q30 50 44 50 L72 50 Q86 50 86 62 L86 78 L82 98 L76 98 L74 82 L42 82 L40 98 L34 98 Z"/>
        <path d="M80 54 Q92 42 96 22 M96 22 L90 32 M96 22 L102 30 M80 54 Q88 50 94 46"/>
        <circle cx="82" cy="58" r="1.5" fill="#1e2f18"/>
        </g></svg>`
      },
      {
        no: "31",
        name: "Stag Beetle",
        lat: "Lucanus cervus",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#1e2f18" stroke-width="1.2" fill="#3a2418"><ellipse cx="60" cy="70" rx="24" ry="30"/>
        <ellipse cx="60" cy="48" rx="14" ry="10"/>
        <path d="M50 36 L42 26 L48 32 L44 20 M70 36 L78 26 L72 32 L76 20" fill="none"/>
        <path d="M60 44 L60 96" stroke="#1e2f18"/>
        <path d="M38 72 L26 76 M82 72 L94 76 M40 86 L26 92 M80 86 L94 92"/>
        </g></svg>`
      }
    ],
    ocean: [
      {
        no: "02",
        name: "Orca",
        lat: "Orcinus orca",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2" fill="#1a1f2a"><path d="M14 66 Q30 46 60 46 Q92 46 104 58 L98 66 L104 74 Q92 86 60 86 Q30 86 14 66 Z"/>
        <path d="M98 66 L110 60 L110 72 Z"/>
        <path d="M60 46 L60 30 L68 46" fill="#1a1f2a"/>
        <path d="M30 70 Q40 66 50 70 Q40 76 30 70 M40 76 Q48 74 54 78" fill="#f1e9d4"/>
        <circle cx="30" cy="68" r="2" fill="#f1e9d4"/>
        </g></svg>`
      },
      {
        no: "06",
        name: "Giant Clam",
        lat: "Tridacna gigas",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2"><path d="M20 80 Q20 50 60 46 Q100 50 100 80 Q100 92 60 92 Q20 92 20 80 Z" fill="#d8c298"/>
        <path d="M30 80 Q34 60 60 58 Q86 60 90 80" fill="#4c8390"/>
        <path d="M36 76 Q50 70 60 68 Q70 70 84 76" fill="#7eb5bf" opacity=".6"/>
        <path d="M30 80 L28 86 M42 78 L42 86 M54 76 L54 88 M66 76 L66 88 M78 78 L78 86 M90 80 L92 86" fill="none"/>
        </g></svg>`
      },
      {
        no: "11",
        name: "Starfish",
        lat: "Asterias rubens",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2" fill="#c97842"><path d="M60 16 L72 52 L110 54 L80 76 L92 110 L60 90 L28 110 L40 76 L10 54 L48 52 Z"/>
        <circle cx="60" cy="58" r="3" fill="#081d24"/>
        <circle cx="48" cy="68" r="2" fill="#081d24"/>
        <circle cx="72" cy="68" r="2" fill="#081d24"/>
        <circle cx="54" cy="78" r="2" fill="#081d24"/>
        <circle cx="66" cy="78" r="2" fill="#081d24"/>
        </g></svg>`
      },
      {
        no: "14",
        name: "Reef Coral",
        lat: "Acropora cervicornis",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2" fill="#c58b7a"><path d="M60 106 L60 66 C60 58 54 54 48 54 C40 54 36 44 36 36 M60 66 C60 58 66 54 72 54 C80 54 84 44 84 36 M60 80 C60 74 52 70 48 64 C42 58 38 50 38 40 M60 80 C60 74 68 70 72 64 C78 58 82 50 82 40 M60 92 C60 88 56 82 54 78 C50 72 44 68 44 60 M60 92 C60 88 64 82 66 78 C70 72 76 68 76 60" fill="none" stroke-width="5" stroke-linecap="round"/>
        <circle cx="36" cy="36" r="5"/><circle cx="84" cy="36" r="5"/><circle cx="38" cy="40" r="4"/><circle cx="82" cy="40" r="4"/>
        <path d="M30 106 L90 106" stroke="#5c2a26" stroke-width="3"/>
        </g></svg>`
      },
      {
        no: "18",
        name: "Octopus",
        lat: "Octopus vulgaris",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2" fill="#a85c4a"><ellipse cx="60" cy="44" rx="28" ry="24"/>
        <path d="M36 60 Q28 90 18 106 M46 62 Q40 92 36 108 M56 64 Q56 96 54 110 M64 64 Q64 96 66 110 M74 62 Q80 92 84 108 M84 60 Q92 90 102 106" fill="none" stroke-width="6" stroke-linecap="round"/>
        <circle cx="50" cy="40" r="5" fill="#f1e9d4"/><circle cx="70" cy="40" r="5" fill="#f1e9d4"/>
        <circle cx="50" cy="40" r="2" fill="#081d24"/><circle cx="70" cy="40" r="2" fill="#081d24"/>
        </g></svg>`
      },
      {
        no: "22",
        name: "Conus Shell",
        lat: "Conus marmoreus",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#081d24" stroke-width="1.2" fill="#f1e9d4"><path d="M60 14 Q80 40 84 62 Q88 88 60 106 Q32 88 36 62 Q40 40 60 14 Z"/>
        <path d="M60 22 Q74 42 76 62 M60 22 Q46 42 44 62 M50 50 Q60 46 70 50 M46 66 Q60 60 74 66 M44 80 Q60 76 76 80 M46 92 Q60 90 74 92" fill="none" stroke="#8a5a3a" stroke-width="1"/>
        </g></svg>`
      }
    ],
    jungle: [
      {
        no: "04",
        name: "Toucan",
        lat: "Ramphastos toco",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2"><path d="M34 70 Q30 50 44 40 Q60 30 74 40 Q86 48 86 64 Q86 84 70 92 Q50 98 40 90 Q32 84 34 70 Z" fill="#1e2a14"/>
        <path d="M72 52 Q100 50 108 60 Q100 66 72 66 Z" fill="#e49c3a"/>
        <path d="M72 52 Q100 50 108 60 L96 58 L86 56 L76 54 Z" fill="#c97842"/>
        <path d="M72 52 L76 44" stroke="#e49c3a" stroke-width="3"/>
        <circle cx="66" cy="56" r="6" fill="#f1e9d4"/>
        <circle cx="66" cy="56" r="3" fill="#0f1507"/>
        <path d="M52 86 Q58 98 72 96 Q66 90 56 88" fill="#f1e9d4"/>
        </g></svg>`
      },
      {
        no: "09",
        name: "Spider Monkey",
        lat: "Ateles geoffroyi",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2" fill="#4a3218"><circle cx="60" cy="50" r="20"/>
        <ellipse cx="60" cy="52" rx="12" ry="10" fill="#b08850"/>
        <circle cx="52" cy="48" r="2" fill="#0f1507"/>
        <circle cx="68" cy="48" r="2" fill="#0f1507"/>
        <path d="M54 56 Q60 60 66 56" fill="none"/>
        <path d="M42 64 Q32 80 28 96 L40 90 Q44 76 50 70"/>
        <path d="M78 64 Q88 80 92 96 L80 90 Q76 76 70 70"/>
        <path d="M56 70 Q50 90 52 106 L58 100 Q60 86 62 78"/>
        <path d="M60 70 L60 102 Q66 110 74 102 Q78 98 76 92" fill="none" stroke-width="3" stroke-linecap="round"/>
        </g></svg>`
      },
      {
        no: "13",
        name: "Red-Eyed Frog",
        lat: "Agalychnis callidryas",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2" fill="#6a8a3d"><path d="M18 74 Q18 54 36 46 Q48 40 60 42 Q72 40 84 46 Q102 54 102 74 Q102 92 80 96 Q60 98 40 96 Q18 92 18 74 Z"/>
        <circle cx="42" cy="44" r="10" fill="#c97842"/>
        <circle cx="78" cy="44" r="10" fill="#c97842"/>
        <circle cx="42" cy="44" r="4" fill="#0f1507"/>
        <circle cx="78" cy="44" r="4" fill="#0f1507"/>
        <path d="M24 82 Q26 100 18 106 M96 82 Q94 100 102 106" fill="#6a8a3d"/>
        <path d="M34 94 Q44 102 54 98 M66 98 Q76 102 86 94" fill="none"/>
        </g></svg>`
      },
      {
        no: "17",
        name: "Orchid",
        lat: "Phalaenopsis amabilis",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2"><path d="M60 112 Q62 86 60 60" stroke="#4a3a18" fill="none" stroke-width="2"/>
        <path d="M60 60 L54 106 M60 60 L66 106" stroke="#4a3a18" fill="none" stroke-width="1"/>
        <ellipse cx="60" cy="40" rx="14" ry="8" fill="#f1e9d4"/>
        <ellipse cx="44" cy="48" rx="12" ry="9" fill="#f1e9d4"/>
        <ellipse cx="76" cy="48" rx="12" ry="9" fill="#f1e9d4"/>
        <ellipse cx="50" cy="60" rx="10" ry="6" fill="#f1e9d4"/>
        <ellipse cx="70" cy="60" rx="10" ry="6" fill="#f1e9d4"/>
        <ellipse cx="60" cy="54" rx="7" ry="9" fill="#c58b7a"/>
        <path d="M58 54 L62 54 M58 58 L62 58" stroke="#5c2a26"/>
        </g></svg>`
      },
      {
        no: "21",
        name: "Morpho",
        lat: "Morpho peleides",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2"><path d="M60 30 L60 92" stroke="#0f1507" fill="none" stroke-width="2"/>
        <path d="M60 40 Q30 24 14 42 Q10 58 24 70 Q40 82 60 70 Z" fill="#3a6a94"/>
        <path d="M60 40 Q90 24 106 42 Q110 58 96 70 Q80 82 60 70 Z" fill="#3a6a94"/>
        <path d="M60 70 Q44 78 34 92 Q44 96 58 90 Z" fill="#5c8aa8"/>
        <path d="M60 70 Q76 78 86 92 Q76 96 62 90 Z" fill="#5c8aa8"/>
        <path d="M60 26 L56 22 M60 26 L64 22" stroke="#0f1507" fill="none"/>
        </g></svg>`
      },
      {
        no: "26",
        name: "Monstera",
        lat: "Monstera deliciosa",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#0f1507" stroke-width="1.2"><path d="M60 112 Q60 80 60 48" stroke="#4a3a18" fill="none" stroke-width="2"/>
        <path d="M60 48 C 24 44 12 70 20 98 C 36 92 50 80 60 68 M60 48 C 96 44 108 70 100 98 C 84 92 70 80 60 68" fill="#3a5a22"/>
        <path d="M30 62 L42 66 M26 76 L42 78 M30 90 L46 86 M90 62 L78 66 M94 76 L78 78 M90 90 L74 86" fill="#1e2a14" stroke="#1e2a14" stroke-width="3" stroke-linecap="round"/>
        </g></svg>`
      }
    ],
    garden: [
      {
        no: "03",
        name: "English Rose",
        lat: "Rosa gallica",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#5c2a26" stroke-width="1.2"><path d="M60 112 Q60 82 60 58" stroke="#3a5024" fill="none" stroke-width="2"/>
        <ellipse cx="40" cy="86" rx="10" ry="5" transform="rotate(-30 40 86)" fill="#6b8a5a"/>
        <ellipse cx="80" cy="86" rx="10" ry="5" transform="rotate(30 80 86)" fill="#6b8a5a"/>
        <circle cx="60" cy="46" r="26" fill="#c58b7a"/>
        <circle cx="60" cy="46" r="18" fill="#a8685a"/>
        <path d="M60 46 L72 38 L74 52 L60 52 L60 46 Z M60 46 L48 38 L46 52 L60 52 Z" fill="#8a4c42"/>
        <circle cx="60" cy="46" r="6" fill="#5c2a26"/>
        </g></svg>`
      },
      {
        no: "08",
        name: "Honeybee",
        lat: "Apis mellifera",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3a2418" stroke-width="1.2"><ellipse cx="60" cy="66" rx="28" ry="20" fill="#e4c884"/>
        <rect x="48" y="48" width="8" height="36" fill="#3a2418"/>
        <rect x="64" y="48" width="8" height="36" fill="#3a2418"/>
        <ellipse cx="42" cy="52" rx="16" ry="10" transform="rotate(-20 42 52)" fill="#f1e9d4" opacity=".7"/>
        <ellipse cx="78" cy="52" rx="16" ry="10" transform="rotate(20 78 52)" fill="#f1e9d4" opacity=".7"/>
        <circle cx="36" cy="62" r="3" fill="#3a2418"/>
        <path d="M32 62 L20 58 M32 62 L20 66" fill="none"/>
        </g></svg>`
      },
      {
        no: "15",
        name: "Hedgehog",
        lat: "Erinaceus europaeus",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3a2418" stroke-width="1.2"><path d="M18 86 Q22 48 60 48 Q100 48 102 86 Z" fill="#6a4a2e"/>
        <g stroke="#3a2418" stroke-width="1.5">
          <path d="M26 80 L22 70 M32 74 L30 62 M40 70 L38 56 M48 66 L46 52 M56 64 L54 50 M64 64 L64 50 M72 66 L74 52 M80 70 L82 56 M88 74 L90 62 M96 80 L100 70"/>
        </g>
        <ellipse cx="28" cy="82" rx="14" ry="10" fill="#d4a894"/>
        <circle cx="22" cy="82" r="2" fill="#3a2418"/>
        <circle cx="32" cy="76" r="2" fill="#3a2418"/>
        <path d="M36 96 L40 104 M50 96 L54 104 M68 96 L72 104 M84 96 L88 104" stroke="#3a2418" fill="none"/>
        </g></svg>`
      },
      {
        no: "20",
        name: "Red Fox",
        lat: "Vulpes vulpes",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3a2418" stroke-width="1.2" fill="#c97842"><path d="M24 80 Q24 64 40 62 L56 56 Q66 48 78 56 L92 66 Q108 74 102 88 L94 94 L80 92 L70 86 L52 92 L36 94 L24 86 Z"/>
        <path d="M30 62 L26 50 L36 56 M46 58 L44 46 L52 52" fill="#c97842"/>
        <path d="M60 60 Q70 66 72 72 Q62 72 58 68" fill="#f1e9d4"/>
        <circle cx="80" cy="72" r="1.8" fill="#3a2418"/>
        <circle cx="92" cy="68" r="1.5" fill="#3a2418"/>
        <path d="M40 90 Q30 110 10 108 L20 102 L22 96" fill="#c97842"/>
        <path d="M14 104 L8 110" stroke="#f1e9d4" stroke-width="2" fill="none"/>
        </g></svg>`
      },
      {
        no: "25",
        name: "Bluebell",
        lat: "Hyacinthoides non-scripta",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3a2418" stroke-width="1.2"><path d="M54 112 Q56 80 58 50" stroke="#3a5024" fill="none" stroke-width="2"/>
        <path d="M58 48 Q52 58 56 68 Q62 66 60 50 Z" fill="#6a5a9a"/>
        <path d="M60 58 Q54 68 58 78 Q64 76 62 60 Z" fill="#6a5a9a"/>
        <path d="M62 68 Q56 78 60 88 Q66 86 64 70 Z" fill="#6a5a9a"/>
        <path d="M64 78 Q58 88 62 98 Q68 96 66 80 Z" fill="#6a5a9a"/>
        <path d="M50 108 L40 112 M56 108 L50 114" stroke="#3a5024" fill="none"/>
        </g></svg>`
      },
      {
        no: "29",
        name: "Brown Hare",
        lat: "Lepus europaeus",
        svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g stroke="#3a2418" stroke-width="1.2" fill="#a8754a"><path d="M24 80 Q22 60 36 54 Q48 50 54 54 Q60 42 72 46 Q78 44 80 58 Q88 70 94 82 Q96 92 90 96 L80 96 L76 90 L60 92 L44 94 L28 94 L22 88 Z"/>
        <path d="M68 50 Q70 26 74 20 Q80 26 80 50 M54 52 Q52 30 54 24 Q60 30 62 52" fill="#a8754a"/>
        <circle cx="78" cy="60" r="1.8" fill="#3a2418"/>
        <path d="M76 68 Q82 70 82 74" fill="none"/>
        <path d="M44 94 L40 108 M56 94 L54 106 M68 92 L70 106" stroke="#3a2418" fill="none"/>
        </g></svg>`
      }
    ]
  };

  /* ---------- PATCH PLACEMENT ---------- */
  // drop patches around each branch section with controlled randomness
  function renderPatchesInto(section, set) {
    const positions = [
      // left column
      { top: "6%",  left: "4%",   tilt: -4 },
      { top: "28%", left: "12%",  tilt: 3 },
      { top: "58%", left: "6%",   tilt: -2 },
      { top: "78%", left: "18%",  tilt: 5 },
      // right column
      { top: "20%", right: "14%", tilt: 3 },
      { top: "50%", right: "6%",  tilt: -3 },
      { top: "76%", right: "20%", tilt: 4 }
    ];
    // mirror layout for right-anchored header sections so patches fall on opposite side
    const rightAnchored = section.classList.contains("branch--ocean") ||
                          section.classList.contains("branch--garden");
    set.forEach((p, i) => {
      const pos = positions[i % positions.length];
      const patch = document.createElement("figure");
      patch.className = "patch";
      patch.style.setProperty("--tilt", pos.tilt + "deg");
      if (rightAnchored) {
        // for right-headers we anchor patches to the opposite side
        if (pos.left) patch.style.right = pos.left, patch.style.left = "auto";
        else if (pos.right) patch.style.left = pos.right, patch.style.right = "auto";
        patch.style.top = pos.top;
      } else {
        Object.entries(pos).forEach(([k, v]) => {
          if (k === "tilt") return;
          patch.style[k] = v;
        });
      }
      patch.innerHTML = `
        <div class="patch__art">${p.svg}</div>
        <div class="patch__meta">
          <span>№ ${p.no}</span>
          <em>${p.name}</em>
          <span>${p.lat}</span>
        </div>`;
      section.appendChild(patch);
    });
  }

  // hook to each section
  renderPatchesInto($("#forest"),  patches.forest);
  renderPatchesInto($("#ocean"),   patches.ocean);
  renderPatchesInto($("#jungle"),  patches.jungle);
  renderPatchesInto($("#garden"),  patches.garden);

  /* ---------- NAV THEME SHIFT ---------- */
  const nav = $("[data-nav]");
  const darkSections = new Set(["prologue", "forest", "ocean", "jungle", "story", "mission", "shop"]);
  const onView = entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const s = e.target.dataset.section;
      if (!s) return;
      if (darkSections.has(s)) nav.dataset.theme = "dark";
      else nav.removeAttribute("data-theme");
    });
  };
  const navObs = new IntersectionObserver(onView, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  $$("[data-section]").forEach(el => navObs.observe(el));

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealTargets = [
    ".hero__meta", ".hero__title .line", ".hero__portrait", ".hero__lede", ".scroll-cue",
    ".prologue__kicker", ".prologue__quote", ".prologue__byline", ".prologue__note",
    ".branch__header", ".branch__header > *",
    ".story__kicker", ".story__title", ".story__body", ".story__spread",
    ".sustain__kicker", ".sustain__title", ".sustain__lede", ".ledger__row", ".sustain__notes > div",
    ".mission__kicker", ".mission__title", ".mission__lede", ".counter", ".partners li",
    ".shop__title", ".shop__lede", ".card", ".signup"
  ];
  revealTargets.forEach(sel => $$(sel).forEach((el, i) => {
    el.setAttribute("data-reveal", "");
    el.style.transitionDelay = Math.min(i * 60, 400) + "ms";
  }));

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        revealObs.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

  $$("[data-reveal]").forEach(el => revealObs.observe(el));

  /* ---------- COUNTERS ---------- */
  const runCounters = () => {
    $$("[data-counter-target]").forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const target = +el.dataset.counterTarget;
      const num = $("[data-num]", el);
      const dur = reduce ? 0 : 1800;
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  const missionSec = $("#mission");
  if (missionSec) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { runCounters(); counterObs.disconnect(); } });
    }, { threshold: 0.25 });
    counterObs.observe(missionSec);
  }

  /* ---------- GENTLE PARALLAX ON BACKDROPS ---------- */
  if (!reduce) {
    const layers = [];
    $$(".branch__backdrop").forEach(el => {
      const sec = el.closest("section");
      layers.push({ el, sec });
    });
    const onScroll = () => {
      const vh = window.innerHeight;
      for (const { el, sec } of layers) {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const progress = (vh - r.top) / (vh + r.height);
        const offset = (progress - 0.5) * 60;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    let tick = false;
    window.addEventListener("scroll", () => {
      if (!tick) { requestAnimationFrame(() => { onScroll(); tick = false; }); tick = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- PATCH DRIFT (subtle) ---------- */
  if (!reduce) {
    $$(".patch").forEach((p, i) => {
      const dur = 6 + (i % 5);
      const delay = (i % 6) * .4;
      p.style.animation = `patchDrift ${dur}s ease-in-out ${delay}s infinite alternate`;
    });
    const style = document.createElement("style");
    style.textContent = `@keyframes patchDrift {
      0%   { transform: rotate(var(--tilt, -2deg)) translateY(0); }
      100% { transform: rotate(calc(var(--tilt, -2deg) + 1deg)) translateY(-6px); }
    }`;
    document.head.appendChild(style);
  }
})();
