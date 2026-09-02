export type ProjectImage = {
  src: string
  alt: string
  caption: string
}

export type Project = {
  id: string
  title: string
  year: string
  category: string
  description: string
  role: string
  tech: string[]
  live: string
  source: string
  images: [ProjectImage, ProjectImage, ProjectImage]
}

export const projects: Project[] = [
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
    images: [
      {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=86',
        alt: 'Monochrome analytics dashboard on a monitor',
        caption: 'A single view of the revenue engine.',
      },
      {
        src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=86',
        alt: 'Team collaborating around a table',
        caption: 'Decisions, made legible for the whole team.',
      },
      {
        src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=86',
        alt: 'Bright modern workspace with desks',
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
    images: [
      {
        src: 'https://images.unsplash.com/photo-1524666041070-9c876415a7d5?auto=format&fit=crop&w=1600&q=86',
        alt: 'Map and notebook on a desk',
        caption: 'Place as a starting point, not a destination.',
      },
      {
        src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=86',
        alt: 'Laptop displaying a web interface',
        caption: 'Stories that keep their human scale.',
      },
      {
        src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=86',
        alt: 'Crowd gathered at an outdoor event',
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
    images: [
      {
        src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=86',
        alt: 'Prints and design materials arranged on a desk',
        caption: 'The archive is the interface.',
      },
      {
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=86',
        alt: 'Minimal watch product on a neutral surface',
        caption: 'Objects with room to speak for themselves.',
      },
      {
        src: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=86',
        alt: 'Hands arranging printed paper on a desk',
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
