-- ============================================================
-- SAMPLE DATA FOR TESTING
-- Run this AFTER the main schema migration
-- This inserts 30 days of realistic sample transactions
-- ============================================================

-- Get IDs dynamically to avoid hardcoding
DO $$
DECLARE
  v_marcus   uuid;
  v_jordan   uuid;
  v_devon    uuid;
  v_tyler    uuid;
  v_karim    uuid;
  v_cut      uuid;
  v_fade     uuid;
  v_beard    uuid;
  v_cutbeard uuid;
  v_fadebeard uuid;
BEGIN
  SELECT id INTO v_marcus   FROM barbers WHERE name = 'Marcus'  LIMIT 1;
  SELECT id INTO v_jordan   FROM barbers WHERE name = 'Jordan'  LIMIT 1;
  SELECT id INTO v_devon    FROM barbers WHERE name = 'Devon'   LIMIT 1;
  SELECT id INTO v_tyler    FROM barbers WHERE name = 'Tyler'   LIMIT 1;
  SELECT id INTO v_karim    FROM barbers WHERE name = 'Karim'   LIMIT 1;

  SELECT id INTO v_cut      FROM services WHERE name = 'Haircut'             LIMIT 1;
  SELECT id INTO v_fade     FROM services WHERE name = 'Skin Fade'           LIMIT 1;
  SELECT id INTO v_beard    FROM services WHERE name = 'Beard Trim'          LIMIT 1;
  SELECT id INTO v_cutbeard FROM services WHERE name = 'Haircut + Beard'     LIMIT 1;
  SELECT id INTO v_fadebeard FROM services WHERE name = 'Skin Fade + Beard'  LIMIT 1;

  -- Insert sample transactions spread over last 7 days
  INSERT INTO transactions (
    barber_id, service_id, payment_method,
    base_price, hst_amount, total_charged,
    tip_amount, commission_pct, commission_payout, net_revenue,
    created_at
  ) VALUES
    -- Today
    (v_marcus, v_fade,      'cash', 35, 0,     35,    5,  60, 21,   19,   now() - interval '2 hours'),
    (v_jordan, v_cut,       'tap',  30, 3.9,   33.9,  0,  55, 16.5, 17.4, now() - interval '1 hour 30 min'),
    (v_devon,  v_cutbeard,  'cash', 45, 0,     45,    10, 60, 27,   28,   now() - interval '1 hour'),
    (v_marcus, v_cut,       'tap',  30, 3.9,   33.9,  5,  55, 16.5, 17.4, now() - interval '45 min'),
    (v_tyler,  v_fade,      'cash', 35, 0,     35,    0,  55, 19.25,15.75,now() - interval '20 min'),

    -- Yesterday
    (v_marcus,  v_fadebeard,'cash', 50, 0,     50,    10, 60, 30,   30,   now() - interval '1 day 3 hours'),
    (v_karim,   v_cut,      'tap',  30, 3.9,   33.9,  5,  55, 16.5, 17.4, now() - interval '1 day 2 hours'),
    (v_jordan,  v_beard,    'cash', 20, 0,     20,    0,  55, 11,   9,    now() - interval '1 day 1 hour'),
    (v_devon,   v_fade,     'tap',  35, 4.55,  39.55, 5,  60, 21,   18.55,now() - interval '1 day 30 min'),
    (v_marcus,  v_cut,      'cash', 30, 0,     30,    5,  60, 18,   17,   now() - interval '1 day 10 min'),

    -- 2 days ago
    (v_tyler,   v_cut,      'cash', 30, 0,     30,    0,  55, 16.5, 13.5, now() - interval '2 days 4 hours'),
    (v_jordan,  v_fadebeard,'tap',  50, 6.5,   56.5,  10, 55, 27.5, 29,   now() - interval '2 days 3 hours'),
    (v_marcus,  v_fade,     'cash', 35, 0,     35,    7,  60, 21,   21,   now() - interval '2 days 2 hours'),
    (v_karim,   v_cutbeard, 'cash', 45, 0,     45,    5,  55, 24.75,25.25,now() - interval '2 days 1 hour'),
    (v_devon,   v_beard,    'tap',  20, 2.6,   22.6,  0,  60, 12,   12.6, now() - interval '2 days 30 min'),

    -- 3 days ago
    (v_marcus,  v_cut,      'tap',  30, 3.9,   33.9,  5,  55, 16.5, 17.4, now() - interval '3 days 5 hours'),
    (v_jordan,  v_fade,     'cash', 35, 0,     35,    5,  55, 19.25,20.75,now() - interval '3 days 4 hours'),
    (v_tyler,   v_cutbeard, 'tap',  45, 5.85,  50.85, 0,  55, 24.75,26.1, now() - interval '3 days 3 hours'),
    (v_karim,   v_cut,      'cash', 30, 0,     30,    5,  55, 16.5, 18.5, now() - interval '3 days 2 hours'),
    (v_devon,   v_fadebeard,'cash', 50, 0,     50,    10, 60, 30,   30,   now() - interval '3 days 1 hour'),

    -- 4 days ago
    (v_marcus,  v_fade,     'cash', 35, 0,     35,    5,  60, 21,   19,   now() - interval '4 days 6 hours'),
    (v_jordan,  v_cut,      'cash', 30, 0,     30,    0,  55, 16.5, 13.5, now() - interval '4 days 5 hours'),
    (v_devon,   v_beard,    'tap',  20, 2.6,   22.6,  5,  60, 12,   12.6, now() - interval '4 days 4 hours'),
    (v_karim,   v_fade,     'tap',  35, 4.55,  39.55, 0,  55, 19.25,20.3, now() - interval '4 days 3 hours'),
    (v_tyler,   v_cutbeard, 'cash', 45, 0,     45,    10, 55, 24.75,30.25,now() - interval '4 days 2 hours'),

    -- 5 days ago  
    (v_marcus,  v_fadebeard,'tap',  50, 6.5,   56.5,  10, 60, 30,   32.5, now() - interval '5 days 4 hours'),
    (v_jordan,  v_fade,     'tap',  35, 4.55,  39.55, 5,  55, 19.25,20.3, now() - interval '5 days 3 hours'),
    (v_devon,   v_cut,      'cash', 30, 0,     30,    5,  60, 18,   17,   now() - interval '5 days 2 hours'),
    (v_karim,   v_beard,    'cash', 20, 0,     20,    0,  55, 11,   9,    now() - interval '5 days 1 hour'),
    (v_tyler,   v_fade,     'cash', 35, 0,     35,    7,  55, 19.25,22.75,now() - interval '5 days 30 min');

END $$;
