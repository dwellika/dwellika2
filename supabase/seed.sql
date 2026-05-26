-- ============================================================
-- Dwellika seed data — local dev only
-- Loaded by `supabase db reset` to give you a usable dataset
-- ============================================================

-- Sample announcements
insert into public.announcements (category, title, body, cta_label, cta_url, starts_at, ends_at)
values
  ('event', 'Aurora Art Fair 2026', 'Three days of curated masterworks from 120+ artists.', 'Reserve a Pass', '/events/aurora-2026', now(), now() + interval '30 days'),
  ('workshop', 'Mastering Watercolor with Mira Sen', 'Live workshop streaming on Saturday.', 'Join Live', '/workshops/watercolor-mira', now(), now() + interval '14 days'),
  ('course', 'Digital Sculpture 101', 'New self-paced course just dropped.', 'Enroll', '/courses/digital-sculpture-101', now(), now() + interval '60 days'),
  ('notification', 'Creator Fund applications are open', 'Submit your portfolio for grant consideration.', 'Apply', '/creator-fund', now(), now() + interval '21 days');

-- Sample testimonials
insert into public.testimonials (group_name, author_name, role_label, body, rating)
values
  ('artist', 'Maya Iyer', 'Watercolorist · Mumbai', 'Dwellika gave my work a home that finally feels worthy of it.', 5),
  ('artist', 'Kenji Tanaka', 'Digital Painter · Kyoto', 'The community here cares about craft, not clout.', 5),
  ('seller', 'Auralite Studio', 'Art Supplies · Berlin', 'Our small studio reached collectors we never could before.', 5),
  ('buyer', 'Priya Menon', 'Collector · Bengaluru', 'I have bought four originals in three months. Every shipment is a love letter.', 5);
