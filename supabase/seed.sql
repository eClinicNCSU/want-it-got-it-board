-- ============================================================
--  Optional seed data — the mockup's sample cards, pre-approved.
--  Run AFTER schema.sql, in the Supabase SQL Editor, to verify the
--  board + realtime with real database rows. Delete anytime with:
--    delete from public.cards;   (card_private cascades)
-- ============================================================

with new_cards as (
  insert into public.cards
    (type, title, description, tags, author_name, author_major, author_year,
     is_paid, deadline, status, created_at)
  values
    ('wanted', 'Front-end developer',
     'Farmers market app for Raleigh growers. Backend''s done, I need someone who cares about how it looks.',
     '{react,web,design}', 'Maya O.', 'Business Admin', '''27',
     false, null, 'approved', now() - interval '2 days'),
    ('wanted', 'Someone who can weld',
     'Steel frame for a vertical hydroponics rig. Two afternoons, I''ll buy the material.',
     '{welding,fabrication}', 'Deshawn P.', 'Mech E', '''26',
     false, current_date + 3, 'approved', now() - interval '5 hours'),
    ('wanted', '20 beta testers',
     'Study scheduling app. Fifteen minutes and a free coffee from Port City.',
     '{testing,feedback}', 'Ravi S.', 'CSC', '''28',
     false, null, 'claimed', now() - interval '1 day'),
    ('wanted', 'Pitch deck reviewer',
     'ALA applications close Friday. Want someone who''s read a hundred of these.',
     '{pitch,fundraising}', 'Elena M.', 'Poole', '''26',
     false, current_date + 4, 'approved', now() - interval '3 hours'),
    ('wanted', 'Illustrator',
     'Children''s book about a wolf who can''t howl. 24 spreads.',
     '{illustration,design}', 'Junie K.', 'English', '''27',
     true, null, 'approved', now() - interval '6 days'),
    ('wanted', 'Chem E, one hour',
     'Tell me my extraction process is wrong before I spend $400 finding out.',
     '{chemistry,process}', 'Tomas R.', 'Chem E', '''26',
     false, null, 'approved', now() - interval '11 hours'),
    ('got_it', 'Full-stack developer',
     'Next.js and Supabase. Shipped three products. Free most evenings this semester.',
     '{react,web,supabase}', 'Andre B.', 'CSC', '''26',
     false, null, 'approved', now() - interval '1 day'),
    ('got_it', 'I run the laser cutter',
     'Certified on the Epilog downstairs. I''ll cut your prototype and show you how it works.',
     '{fabrication,prototyping}', 'Sam W.', 'Industrial Design', '''27',
     false, null, 'approved', now() - interval '8 hours'),
    ('got_it', 'Welding, MIG and TIG',
     'Four years in my dad''s shop before I got here. Bring a drawing or a napkin.',
     '{welding,fabrication}', 'Cole H.', 'Mech E', '''26',
     false, null, 'approved', now() - interval '2 days'),
    ('got_it', 'Video, shot and cut',
     'Demo videos and founder interviews. Premiere, and a camera that doesn''t embarrass you.',
     '{video,marketing}', 'Nia F.', 'Communication', '''28',
     true, null, 'approved', now() - interval '3 days'),
    ('got_it', 'Grant writing',
     'Two SBIR Phase I applications, one funded. Send me your draft.',
     '{grants,fundraising}', 'Ayo J.', 'Postdoc, BME', null,
     false, null, 'approved', now() - interval '7 days'),
    ('got_it', 'Process engineering',
     'Separations and extraction. Ask me before you buy equipment, not after.',
     '{chemistry,process}', 'Hannah S.', 'Chem E', '''27',
     false, null, 'approved', now() - interval '9 hours')
  returning id
)
insert into public.card_private (card_id, contact)
select id, 'seed-demo@ncsu.edu' from new_cards;
