// Sample cards mirroring the mockup so the board renders before Supabase is wired.
// `created_at` is stored as "hours ago" for stable, dependency-free time-ago display.

export const SAMPLE_CARDS = [
  // ---- Wanted ----
  {
    id: 'w1', type: 'wanted', badge: 'new',
    title: 'Front-end developer',
    description:
      "Farmers market app for Raleigh growers. Backend's done, I need someone who cares about how it looks.",
    tags: ['react', 'web', 'design'],
    author_name: 'Maya O.', author_major: 'Business Admin', author_year: "'27",
    hoursAgo: 48,
  },
  {
    id: 'w2', type: 'wanted', badge: 'deadline',
    title: 'Someone who can weld',
    description:
      "Steel frame for a vertical hydroponics rig. Two afternoons, I'll buy the material.",
    tags: ['welding', 'fabrication'],
    author_name: 'Deshawn P.', author_major: 'Mech E', author_year: "'26",
    hoursAgo: 5,
  },
  {
    id: 'w3', type: 'wanted',
    title: '20 beta testers',
    description:
      'Study scheduling app. Fifteen minutes and a free coffee from Port City.',
    tags: ['testing', 'feedback'],
    author_name: 'Ravi S.', author_major: 'CSC', author_year: "'28",
    hoursAgo: 24,
  },
  {
    id: 'w4', type: 'wanted', badge: 'deadline',
    title: 'Pitch deck reviewer',
    description:
      "ALA applications close Friday. Want someone who's read a hundred of these.",
    tags: ['pitch', 'fundraising'],
    author_name: 'Elena M.', author_major: 'Poole', author_year: "'26",
    hoursAgo: 3,
  },
  {
    id: 'w5', type: 'wanted', badge: 'paid',
    title: 'Illustrator',
    description: "Children's book about a wolf who can't howl. 24 spreads.",
    tags: ['illustration', 'design'],
    author_name: 'Junie K.', author_major: 'English', author_year: "'27",
    hoursAgo: 144,
  },
  {
    id: 'w6', type: 'wanted',
    title: 'Chem E, one hour',
    description:
      'Tell me my extraction process is wrong before I spend $400 finding out.',
    tags: ['chemistry', 'process'],
    author_name: 'Tomas R.', author_major: 'Chem E', author_year: "'26",
    hoursAgo: 11,
  },

  // ---- Got it ----
  {
    id: 'g1', type: 'got_it',
    title: 'Full-stack developer',
    description:
      'Next.js and Supabase. Shipped three products. Free most evenings this semester.',
    tags: ['react', 'web', 'supabase'],
    author_name: 'Andre B.', author_major: 'CSC', author_year: "'26",
    hoursAgo: 24,
  },
  {
    id: 'g2', type: 'got_it', badge: 'new',
    title: 'I run the laser cutter',
    description:
      "Certified on the Epilog downstairs. I'll cut your prototype and show you how it works.",
    tags: ['fabrication', 'prototyping'],
    author_name: 'Sam W.', author_major: 'Industrial Design', author_year: "'27",
    hoursAgo: 8,
  },
  {
    id: 'g3', type: 'got_it', status: 'claimed', badge: 'claimed',
    title: 'Welding, MIG and TIG',
    description:
      "Four years in my dad's shop before I got here. Bring a drawing or a napkin.",
    tags: ['welding', 'fabrication'],
    author_name: 'Cole H.', author_major: 'Mech E', author_year: "'26",
    hoursAgo: 48,
  },
  {
    id: 'g4', type: 'got_it', badge: 'paid',
    title: 'Video, shot and cut',
    description:
      "Demo videos and founder interviews. Premiere, and a camera that doesn't embarrass you.",
    tags: ['video', 'marketing'],
    author_name: 'Nia F.', author_major: 'Communication', author_year: "'28",
    hoursAgo: 72,
  },
  {
    id: 'g5', type: 'got_it',
    title: 'Grant writing',
    description:
      'Two SBIR Phase I applications, one funded. Send me your draft.',
    tags: ['grants', 'fundraising'],
    author_name: 'Ayo J.', author_major: 'Postdoc, BME', author_year: '',
    hoursAgo: 168,
  },
  {
    id: 'g6', type: 'got_it',
    title: 'Process engineering',
    description:
      'Separations and extraction. Ask me before you buy equipment, not after.',
    tags: ['chemistry', 'process'],
    author_name: 'Hannah S.', author_major: 'Chem E', author_year: "'27",
    hoursAgo: 9,
  },
]
