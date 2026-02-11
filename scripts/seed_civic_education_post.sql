-- SEED COMPREHENSIVE CIVIC EDUCATION POST
-- TITLE: Unveiling the Pillar of Democracy: A Comprehensive Guide to Civic Education in Kenya
-- SLUG: what-is-civic-education-kenya-comprehensive-guide

BEGIN;

-- Check if category exists, if not create 'Civic Education 101'
-- This assumes a simplified schema check since we can't run dynamic plpgsql easily here
-- We'll use a specific ID to ensure consistency

-- Link category and post using subquery or CTE
INSERT INTO public.blog_categories (name, description, created_at)
VALUES ('Civic Education 101', 'Foundational knowledge for active citizenship in Kenya.', NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.blog_posts (
  title,
  slug,
  content,
  excerpt,
  author,
  tags,
  status,
  category_id,
  published_at,
  created_at,
  updated_at
) VALUES (
  'The Citizen’s Manual: Because Ignoring the Law is Expensive',
  'what-is-civic-education-kenya-comprehensive-guide',
  '<h1>The Citizen’s Manual: Because Ignoring the Law is Expensive</h1>

<p>Ever looked at a massive pothole and wondered why it has its own zip code while the person "hired" to fix it is currently shopping for a third SUV? Welcome to the wonderful world of being a Kenyan citizen. It is a place where we have the most beautiful Constitution in the world on paper and a "vibes and insha’Allah" approach to actually reading it.</p>

<p>Let us be honest. Most of us treat our Constitution like the "Terms and Conditions" on a software update. We scroll past the legal talk, click "I Agree" because we want the app to work, and then get surprised when we realize we accidentally signed away our right to complain about the data usage.</p>

<p>But here is the thing: Civic Education isn’t a boring lecture you sleep through at a community hall just for the free soda and a piece of bread. It is the user manual for the country you live in. If you bought a phone and it did not work, you would check the manual. If your country is not working, why are we still winging it?</p>

<hr />

<h2>A Little History (The Teargas Edition)</h2>
<p>We were not always this "free" to complain on Twitter. There was a time in Kenya when even thinking about a second political party would get you a one-way ticket to a "hospitality suite" at Nyayo House. The journey from the single-party era to the 2010 Constitution was not a casual stroll. It was a marathon through teargas and absolute resilience.</p>

<p>Our elders did not fight for the right to vote just so we could exchange that power for a packet of unga or a fifty-shilling note once every five years. That is like trading a plot of land in Karen for a bag of salt.</p>

<hr />

<h2>The Rules of the House</h2>
<p>The 2010 Constitution is basically our collective house rules. Article 1 says, "All sovereign power belongs to the people of Kenya." Read that again. It does not say it belongs to the person in the big motorcade. It belongs to YOU. They are just the managers you have hired to keep the grass cut and the water running.</p>

<p>Public participation is not a suggestion; it is a requirement. If a law is passed that makes it illegal to breathe on Tuesdays and you were not there to say "Wait a minute," then technically, you agreed to hold your breath.</p>

<hr />

<h2>From Subject to Citizen</h2>
<p>So, where do we go from here? We need to move from being "Subjects" to being "Citizens." A subject waits to be told what to do and hopes the king is in a good mood. A citizen knows the law, follows the money, and asks the hard questions without blinking.</p>

<p>It is time to stop treating governance like a spectator sport. We are the owners of the team. If the players are not scoring and the coach is selling the stadium seats, we do not just sit in the stands and boo. We check the contracts.</p>

<p>Civic education is the difference between being a passenger in a car driven by a blindfolded man and being the one with the map, the key, and the power to hire a better driver.</p>

<p><strong>Stay educated. Stay loud. Be the Citizen Kenya needs.</strong>',
  'A painfully honest, slightly witty, and deeply Kenyan guide to why knowing your rights is the only way to save your country (and your pocket).',
  'CEKA',
  ARRAY['Civic Education', 'Kenya Constitution', 'National Values', 'Public Participation'],
  'published',
  (SELECT id FROM public.blog_categories WHERE name = 'Civic Education 101' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

COMMIT;
