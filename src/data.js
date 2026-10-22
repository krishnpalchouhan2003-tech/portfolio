// All site content lives here. Sourced from the resume, GitHub and LinkedIn.
// Project "markets" are plain facts, not performance metrics.

export const profile = {
  first: 'KRISHNPAL',
  last: 'CHOUHAN',
  initials: 'KP',
  role: 'Frontend Engineer',
  domain: 'Casino & Sportsbook',
  location: 'INDORE',
  years: '1.5+', // at GammaStack since March 2025
  email: 'krishnpalchouhan02@gmail.com',
  github: 'https://github.com/krishnpalchouhan2003-tech',
  linkedin: 'https://www.linkedin.com/in/krishn-chouhan-03a972420',
  resume: '/Krishnpal_Chouhan_Resume.pdf',
}

export const manifesto =
  'I build the screens where every millisecond counts — live odds that update without a flicker, casino lobbies that load before the player blinks, and bet slips that never lose a selection. Frontend for products where real money moves in real time.'

// Words (lowercase, no punctuation) that light up neon in the manifesto
export const highlights = ['millisecond', 'live', 'odds', 'real', 'money', 'time']

export const tickerSkills = [
  ['React', 9.8], ['JavaScript', 9.5], ['Next.js', 8.9], ['Redux Toolkit', 9.1], ['Redux Saga', 8.8],
  ['WebSockets', 8.7], ['Tailwind', 9.2], ['Vue', 7.6], ['Highcharts', 7.9], ['REST APIs', 9.0],
]

export const tickerDomain = [
  ['Live Odds', 2.1], ['Bet Slip', 1.85], ['Virtuals', 3.4], ['Casino Lobby', 1.6],
  ['Event Listings', 2.6], ['Deposit Flows', 2.4], ['Result Settlement', 1.95], ['Admin Panels', 2.75],
]

export const projects = [
  {
    code: 'SB-01',
    league: 'Sportsbook',
    year: 'GammaStack',
    title: 'Betwgb',
    blurb:
      'Sportsbook, virtuals and casino platform for the Nigerian market. Real-time odds and bet slip interactions over WebSocket and Redux Saga, with mobile-first betting, deposit flows and game lobbies.',
    stack: ['React', 'Redux Saga', 'WebSockets', 'Tailwind'],
    markets: [['Market', 'Nigeria'], ['Verticals', '3'], ['Odds feed', 'Live']],
    accent: '#00e701',
    live: 'https://betwgb.com',
    repo: null, // client project, private code
  },
  {
    code: 'SB-02',
    league: 'Sportsbook',
    year: 'GammaStack',
    title: 'Betski',
    blurb:
      'Core sportsbook and casino features: live odds, betting workflow management and event-driven UI. Tuned WebSocket event handling for high-frequency updates so the UI stays responsive.',
    stack: ['React', 'Redux Saga', 'WebSockets', 'Tailwind'],
    markets: [['Verticals', '2'], ['Odds feed', 'Live'], ['Updates', 'Hi-freq']],
    accent: '#f5c542',
    live: 'https://betski.com',
    repo: null,
  },
  {
    code: 'BO-03',
    league: 'Back Office',
    year: 'GammaStack',
    title: 'Arc & Gamma Sweep',
    blurb:
      'Internal product suite: admin modules and management dashboards, a reusable UI component library, and secure role-based authentication with standard component patterns.',
    stack: ['React', 'Redux Toolkit', 'REST APIs'],
    markets: [['Products', '2'], ['Access', 'RBAC'], ['UI kit', 'Shared']],
    accent: '#7c8cff',
    live: null, // internal tools
    repo: null,
  },
  {
    code: 'PR-04',
    league: 'Personal',
    year: 'Side project',
    title: 'Mehandi Studio Site',
    blurb:
      'Booking site for a mehendi artist: bridal, groom and baby-shower design galleries with category filters, an image viewer and service packages.',
    stack: ['React', 'React Router', 'Tailwind', 'Vite'],
    markets: [['Galleries', '4'], ['Routing', 'SPA'], ['Hosting', 'Vercel']],
    accent: '#ff3b5c',
    live: 'https://mehandi-webside.vercel.app',
    repo: 'https://github.com/krishnpalchouhan2003-tech/Mehandi-webside',
  },
]

// Slot reels: each reel stops on items[final]
export const reels = [
  { label: 'Interface', items: ['HTML', 'CSS', 'Tailwind', 'React', 'Next.js', 'Vue'], final: 3 },
  { label: 'Data', items: ['REST', 'Redux', 'Saga', 'WebSockets', 'Thunk', 'Highcharts'], final: 3 },
  { label: 'Craft', items: ['Figma', 'Postman', 'Docker', 'Git', 'GitHub', 'GitLab'], final: 3 },
]

export const experience = [
  {
    period: 'Mar 2025 — Now',
    role: 'Solution Engineer (Frontend)',
    company: 'GammaStack · Indore',
    points: [
      'Build sportsbook and casino frontend modules in React for high-concurrency platforms.',
      'Live odds and instant bet feedback through Redux Saga + WebSocket pipelines.',
      'Bet slip, event listings and result settlement flows with backend and QA.',
      'Faster page loads with memoization, lazy loading and leaner state.',
    ],
  },
  {
    period: 'Aug 2021 — Aug 2025',
    role: 'B.Tech, Computer Science',
    company: 'Medi-Caps University · Indore',
    points: ['Computer Science and Engineering.', 'Started at GammaStack in the final year.'],
  },
]
