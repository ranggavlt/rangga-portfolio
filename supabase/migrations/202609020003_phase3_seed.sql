insert into public.profiles (
  id, full_name, professional_title, hero_eyebrow, hero_heading, hero_description, about_heading,
  about_biography, about_secondary, location, availability_text, email, portrait_url, cv_url, footer_text
) values (
  '10000000-0000-0000-0000-000000000001', 'Rangga Ariansyah', 'Full-Stack Web Developer',
  'Independent developer / 2024—now', 'Building digital things that matter.',
  'I’m Rangga Ariansyah — a full-stack web developer translating ambitious ideas into clear, resilient experiences.',
  'Good software should feel inevitable.',
  'I’m Rangga, a full-stack web developer who works across product, interface, and infrastructure. I care about the tiny decisions that make a product feel clear — and the larger systems that let that clarity hold up over time.',
  'Based in Jakarta, available for a thoughtful collaboration anywhere. I’m happiest at the point where design intent meets technical reality: asking what matters, making it tangible, then making it last.',
  'Jakarta, ID / UTC+7', 'Available for select projects', 'hello@rangga.dev',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=86', '',
  'Designed and built with intention.'
) on conflict (id) do nothing;

insert into public.projects (id, slug, title, year, category, short_description, full_description, role, tech, live_url, source_url, status, display_order) values
('20000000-0000-0000-0000-000000000001', 'northstar', 'Northstar / Billing OS', '2024', 'Product systems', 'A calmer way for finance teams to see, forecast, and act on recurring revenue. I shaped the product language and built the interface from data model to deployment.', 'A calmer way for finance teams to see, forecast, and act on recurring revenue. I shaped the product language and built the interface from data model to deployment.', 'Lead engineer · Product partner', array['Next.js','TypeScript','Postgres','AWS'], 'https://northstar.example.com', 'https://github.com/rangga-ariansyah/northstar', 'published', 1),
('20000000-0000-0000-0000-000000000002', 'common-ground', 'Common Ground / Civic Atlas', '2023', 'Editorial platform', 'An editorial mapping platform for local stories and the people moving them forward. Designed for curiosity, built for fast publishing, and tuned for long-form reading.', 'An editorial mapping platform for local stories and the people moving them forward. Designed for curiosity, built for fast publishing, and tuned for long-form reading.', 'Design engineer · Technical lead', array['React','Node.js','Mapbox','GraphQL'], 'https://commonground.example.com', 'https://github.com/rangga-ariansyah/common-ground', 'published', 2),
('20000000-0000-0000-0000-000000000003', 'field-notes', 'Field Notes / Studio archive', '2022', 'Commerce & content', 'A small digital home for an independent studio: part archive, part shop, part open notebook. The system gives every object the same editorial weight as the story around it.', 'A small digital home for an independent studio: part archive, part shop, part open notebook. The system gives every object the same editorial weight as the story around it.', 'Full-stack developer · Systems designer', array['Remix','Prisma','Stripe','Vercel'], 'https://fieldnotes.example.com', 'https://github.com/rangga-ariansyah/field-notes', 'published', 3)
on conflict (slug) do nothing;

insert into public.project_images (id, project_id, src, alt, caption, position) values
('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=86', 'Monochrome analytics dashboard on a monitor', 'A single view of the revenue engine.', 1),
('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=86', 'Team collaborating around a table', 'Decisions, made legible for the whole team.', 2),
('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=86', 'Bright modern workspace with desks', 'The quiet infrastructure behind the screen.', 3),
('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=86', 'Map and notebook on a desk', 'Place as a starting point, not a destination.', 1),
('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=86', 'Laptop displaying a web interface', 'Stories that keep their human scale.', 2),
('21000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=86', 'Crowd gathered at an outdoor event', 'A living index of the city.', 3),
('21000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=86', 'Prints and design materials arranged on a desk', 'The archive is the interface.', 1),
('21000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=86', 'Minimal watch product on a neutral surface', 'Objects with room to speak for themselves.', 2),
('21000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=86', 'Hands arranging printed paper on a desk', 'A flexible system for a changing practice.', 3)
on conflict (project_id, position) do nothing;

insert into public.experiences (id, period, company, role, description, published, display_order) values
('30000000-0000-0000-0000-000000000001', '2024 — now', 'Independent / Jakarta + remote', 'Full-Stack Web Developer', 'Partnering with thoughtful teams to turn complex products into useful, durable digital experiences.', true, 1),
('30000000-0000-0000-0000-000000000002', '2021 — 2024', 'Kita Works', 'Senior Frontend Engineer', 'Led a small product engineering team across design systems, application architecture, and the last mile of launch.', true, 2),
('30000000-0000-0000-0000-000000000003', '2019 — 2021', 'Sora Studio', 'Web Developer', 'Built editorial and commerce experiences for a mix of cultural organizations and independent brands.', true, 3)
on conflict (id) do nothing;

insert into public.education (id, period, institution, degree, detail, display_order) values
('40000000-0000-0000-0000-000000000001', '2015 — 2019', 'Universitas Indonesia', 'B.Sc. Computer Science', 'Human-computer interaction · Distributed systems', 1),
('40000000-0000-0000-0000-000000000002', '2018', 'Recurse Center', 'Independent study', 'A self-directed retreat for programmers and creative technologists.', 2),
('40000000-0000-0000-0000-000000000003', 'always', 'The open web', 'Ongoing practice', 'Reading source code, asking better questions, and shipping the next useful thing.', 3)
on conflict (id) do nothing;

insert into public.organizations (id, name, meta, detail, published, display_order) values
('50000000-0000-0000-0000-000000000001', 'React Indonesia', 'Community · 2021—now', 'A community of engineers sharing practical knowledge around React, product craft, and the web platform. I occasionally host small workshops.', true, 1),
('50000000-0000-0000-0000-000000000002', 'Designing with Code', 'Reading group · 2020—now', 'A monthly conversation about the space between visual systems and the code that makes them real.', true, 2),
('50000000-0000-0000-0000-000000000003', 'Internet explorer club', 'Independent · 2019—now', 'A loose index of generous, strange, and rigorously made websites. Curated with friends, open to everyone.', true, 3)
on conflict (id) do nothing;

insert into public.skills (id, label, skills, display_order) values
('60000000-0000-0000-0000-000000000001', 'Frontend', array['React / Next.js','TypeScript','HTML & CSS','Design systems','Motion & interaction'], 1),
('60000000-0000-0000-0000-000000000002', 'Backend', array['Node.js','Postgres','GraphQL / REST','Data modeling','API architecture'], 2),
('60000000-0000-0000-0000-000000000003', 'Practice', array['Product thinking','Technical direction','Accessibility','Performance','Team rituals'], 3)
on conflict (id) do nothing;

insert into public.social_links (id, platform, url, display_order, enabled) values
('70000000-0000-0000-0000-000000000001', 'GitHub', 'https://github.com/rangga-ariansyah', 1, true),
('70000000-0000-0000-0000-000000000002', 'LinkedIn', 'https://www.linkedin.com/in/rangga-ariansyah', 2, true),
('70000000-0000-0000-0000-000000000003', 'Read.cv', 'https://read.cv/rangga-ariansyah', 3, true)
on conflict (id) do nothing;
