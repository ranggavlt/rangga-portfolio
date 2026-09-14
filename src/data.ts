// Raw seed-input shapes — intentionally simpler than domain/types.ts.
// These are transformed into full domain types by src/repository/seed.ts.
type SeedProjectImage = {
  src: string
  alt: string
  caption: string
}

type SeedProject = {
  id: string
  title: string
  year: string
  category: string
  description: string
  role: string
  tech: string[]
  live: string
  source: string
  images: [SeedProjectImage, SeedProjectImage, SeedProjectImage]
}

export const projects: SeedProject[] = [
  {
    id: 'northstar',
    title: 'Northstar / Billing OS',
    year: '2024',
    category: 'Product systems',
    description:
      'A calmer way for finance teams to see, forecast, and act on recurring revenue. I shaped the product language and built the interface from data model to deployment.',
    role: 'Lead engineer · Product partner',
    tech: ['Next.js', 'TypeScript', 'Postgres', 'AWS'],
    live: 'https://northstar.example.com',
    source: 'https://github.com/rangga-ariansyah/northstar',
    // TODO: ganti dengan screenshot project nyata via /admin/projects
    images: [
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23d4d4ce'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23b8b8b1'/%3E%3Crect x='240' y='200' width='700' height='40' rx='4' fill='%23e7e7e2'/%3E%3Crect x='240' y='260' width='400' height='260' rx='4' fill='%23e7e7e2'/%3E%3Crect x='660' y='260' width='480' height='120' rx='4' fill='%23e7e7e2'/%3E%3Crect x='660' y='400' width='480' height='120' rx='4' fill='%23e7e7e2'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ENorthstar · Screenshot 01%3C/text%3E%3C/svg%3E`,
        alt: 'Northstar billing dashboard — screenshot coming soon',
        caption: 'A single view of the revenue engine.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23d4d4ce'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23b8b8b1'/%3E%3Crect x='240' y='200' width='500' height='40' rx='4' fill='%23e7e7e2'/%3E%3Crect x='240' y='260' width='1120' height='200' rx='4' fill='%23e7e7e2'/%3E%3Crect x='240' y='480' width='340' height='220' rx='4' fill='%23e7e7e2'/%3E%3Crect x='600' y='480' width='340' height='220' rx='4' fill='%23e7e7e2'/%3E%3Crect x='960' y='480' width='400' height='220' rx='4' fill='%23e7e7e2'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ENorthstar · Screenshot 02%3C/text%3E%3C/svg%3E`,
        alt: 'Northstar team view — screenshot coming soon',
        caption: 'Decisions, made legible for the whole team.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23d4d4ce'/%3E%3Crect x='200' y='160' width='320' height='580' rx='6' fill='%23b8b8b1'/%3E%3Crect x='540' y='160' width='860' height='580' rx='6' fill='%23b8b8b1'/%3E%3Crect x='220' y='200' width='280' height='20' rx='3' fill='%23e7e7e2'/%3E%3Crect x='220' y='240' width='280' height='460' rx='3' fill='%23c8c8c1'/%3E%3Crect x='560' y='200' width='820' height='520' rx='3' fill='%23e7e7e2'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ENorthstar · Screenshot 03%3C/text%3E%3C/svg%3E`,
        alt: 'Northstar infrastructure view — screenshot coming soon',
        caption: 'The quiet infrastructure behind the screen.',
      },
    ],
  },
  {
    id: 'common-ground',
    title: 'Common Ground / Civic Atlas',
    year: '2023',
    category: 'Editorial platform',
    description:
      'An editorial mapping platform for local stories and the people moving them forward. Designed for curiosity, built for fast publishing, and tuned for long-form reading.',
    role: 'Design engineer · Technical lead',
    tech: ['React', 'Node.js', 'Mapbox', 'GraphQL'],
    live: 'https://commonground.example.com',
    source: 'https://github.com/rangga-ariansyah/common-ground',
    // TODO: ganti dengan screenshot project nyata via /admin/projects
    images: [
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23cdd0cc'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23adb0ab'/%3E%3Ccircle cx='700' cy='450' r='200' fill='%23c8ccc7'/%3E%3Ccircle cx='700' cy='450' r='8' fill='%23686861'/%3E%3Ccircle cx='620' cy='390' r='6' fill='%23686861'/%3E%3Ccircle cx='780' cy='480' r='6' fill='%23686861'/%3E%3Ccircle cx='660' cy='520' r='6' fill='%23686861'/%3E%3Crect x='960' y='200' width='400' height='500' rx='4' fill='%23c8ccc7'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ECommon Ground · Screenshot 01%3C/text%3E%3C/svg%3E`,
        alt: 'Common Ground map view — screenshot coming soon',
        caption: 'Place as a starting point, not a destination.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23cdd0cc'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23adb0ab'/%3E%3Crect x='240' y='200' width='1120' height='60' rx='4' fill='%23c8ccc7'/%3E%3Crect x='240' y='280' width='720' height='420' rx='4' fill='%23c8ccc7'/%3E%3Crect x='980' y='280' width='380' height='200' rx='4' fill='%23c8ccc7'/%3E%3Crect x='980' y='500' width='380' height='200' rx='4' fill='%23c8ccc7'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ECommon Ground · Screenshot 02%3C/text%3E%3C/svg%3E`,
        alt: 'Common Ground article view — screenshot coming soon',
        caption: 'Stories that keep their human scale.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23cdd0cc'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23adb0ab'/%3E%3Crect x='240' y='200' width='350' height='500' rx='4' fill='%23c8ccc7'/%3E%3Crect x='610' y='200' width='350' height='500' rx='4' fill='%23c8ccc7'/%3E%3Crect x='980' y='200' width='380' height='500' rx='4' fill='%23c8ccc7'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3ECommon Ground · Screenshot 03%3C/text%3E%3C/svg%3E`,
        alt: 'Common Ground index view — screenshot coming soon',
        caption: 'A living index of the city.',
      },
    ],
  },
  {
    id: 'field-notes',
    title: 'Field Notes / Studio archive',
    year: '2022',
    category: 'Commerce & content',
    description:
      'A small digital home for an independent studio: part archive, part shop, part open notebook. The system gives every object the same editorial weight as the story around it.',
    role: 'Full-stack developer · Systems designer',
    tech: ['Remix', 'Prisma', 'Stripe', 'Vercel'],
    live: 'https://fieldnotes.example.com',
    source: 'https://github.com/rangga-ariansyah/field-notes',
    // TODO: ganti dengan screenshot project nyata via /admin/projects
    images: [
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23c8c5be'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23a8a59e'/%3E%3Crect x='240' y='200' width='260' height='360' rx='3' fill='%23d4d1cb'/%3E%3Crect x='520' y='200' width='260' height='360' rx='3' fill='%23d4d1cb'/%3E%3Crect x='800' y='200' width='260' height='360' rx='3' fill='%23d4d1cb'/%3E%3Crect x='1080' y='200' width='280' height='360' rx='3' fill='%23d4d1cb'/%3E%3Crect x='240' y='580' width='1120' height='120' rx='3' fill='%23c0bdb6'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3EField Notes · Screenshot 01%3C/text%3E%3C/svg%3E`,
        alt: 'Field Notes archive grid — screenshot coming soon',
        caption: 'The archive is the interface.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23c8c5be'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23a8a59e'/%3E%3Crect x='240' y='200' width='560' height='500' rx='3' fill='%23d4d1cb'/%3E%3Crect x='820' y='200' width='540' height='240' rx='3' fill='%23d4d1cb'/%3E%3Crect x='820' y='460' width='540' height='60' rx='3' fill='%23c0bdb6'/%3E%3Crect x='820' y='540' width='540' height='40' rx='3' fill='%23c0bdb6'/%3E%3Crect x='820' y='600' width='200' height='60' rx='3' fill='%23a8a59e'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3EField Notes · Screenshot 02%3C/text%3E%3C/svg%3E`,
        alt: 'Field Notes product detail — screenshot coming soon',
        caption: 'Objects with room to speak for themselves.',
      },
      {
        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23c8c5be'/%3E%3Crect x='200' y='160' width='1200' height='580' rx='6' fill='%23a8a59e'/%3E%3Crect x='240' y='200' width='1120' height='80' rx='3' fill='%23d4d1cb'/%3E%3Crect x='240' y='300' width='740' height='400' rx='3' fill='%23d4d1cb'/%3E%3Crect x='1000' y='300' width='360' height='190' rx='3' fill='%23d4d1cb'/%3E%3Crect x='1000' y='510' width='360' height='190' rx='3' fill='%23d4d1cb'/%3E%3Ctext x='800' y='780' text-anchor='middle' font-family='monospace' font-size='28' fill='%23686861'%3EField Notes · Screenshot 03%3C/text%3E%3C/svg%3E`,
        alt: 'Field Notes content layout — screenshot coming soon',
        caption: 'A flexible system for a changing practice.',
      },
    ],
  },
]

export const experience = [
  {
    period: '2024 — now',
    company: 'Independent / Jakarta + remote',
    role: 'Full-Stack Web Developer',
    description: 'Partnering with thoughtful teams to turn complex products into useful, durable digital experiences.',
  },
  {
    period: '2021 — 2024',
    company: 'Kita Works',
    role: 'Senior Frontend Engineer',
    description: 'Led a small product engineering team across design systems, application architecture, and the last mile of launch.',
  },
  {
    period: '2019 — 2021',
    company: 'Sora Studio',
    role: 'Web Developer',
    description: 'Built editorial and commerce experiences for a mix of cultural organizations and independent brands.',
  },
]

export const education = [
  {
    period: '2015 — 2019',
    school: 'Universitas Indonesia',
    degree: 'B.Sc. Computer Science',
    detail: 'Human-computer interaction · Distributed systems',
  },
  {
    period: '2018',
    school: 'Recurse Center',
    degree: 'Independent study',
    detail: 'A self-directed retreat for programmers and creative technologists.',
  },
  {
    period: 'always',
    school: 'The open web',
    degree: 'Ongoing practice',
    detail: 'Reading source code, asking better questions, and shipping the next useful thing.',
  },
]

export const organizations = [
  {
    name: 'React Indonesia',
    meta: 'Community · 2021—now',
    detail: 'A community of engineers sharing practical knowledge around React, product craft, and the web platform. I occasionally host small workshops.',
  },
  {
    name: 'Designing with Code',
    meta: 'Reading group · 2020—now',
    detail: 'A monthly conversation about the space between visual systems and the code that makes them real.',
  },
  {
    name: 'Internet explorer club',
    meta: 'Independent · 2019—now',
    detail: 'A loose index of generous, strange, and rigorously made websites. Curated with friends, open to everyone.',
  },
]

export const skillGroups = [
  {
    label: 'Frontend',
    skills: ['React / Next.js', 'TypeScript', 'HTML & CSS', 'Design systems', 'Motion & interaction'],
  },
  {
    label: 'Backend',
    skills: ['Node.js', 'Postgres', 'GraphQL / REST', 'Data modeling', 'API architecture'],
  },
  {
    label: 'Practice',
    skills: ['Product thinking', 'Technical direction', 'Accessibility', 'Performance', 'Team rituals'],
  },
]

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/rangga-ariansyah' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rangga-ariansyah' },
  { label: 'Read.cv', href: 'https://read.cv/rangga-ariansyah' },
]
