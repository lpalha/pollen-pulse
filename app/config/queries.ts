/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SQL TEMPLATES FOR METABASE QUERIES                             │
 * │                                                                 │
 * │  Each key is a Metabase card ID (the number from the URL).      │
 * │  {G} is replaced at runtime with 'day', 'week', or 'month'.    │
 * │                                                                 │
 * │  ─── HOW TO ADD A NEW QUERY ───                                 │
 * │                                                                 │
 * │  1. Get the card ID from the Metabase question URL              │
 * │     e.g. /question/66-swaps-weekly → card ID = 66               │
 * │                                                                 │
 * │  2. Copy the SQL from the Metabase question editor              │
 * │                                                                 │
 * │  3. Replace the granularity string (inside DATE_TRUNC)          │
 * │     with {G}. For example:                                      │
 * │       DATE_TRUNC('week', ...)  →  DATE_TRUNC('{G}', ...)       │
 * │                                                                 │
 * │  4. The query MUST return exactly two columns:                  │
 * │     - period_start  (timestamptz — from DATE_TRUNC)             │
 * │     - a value column whose name matches the valueKey            │
 * │       you set in app/config/dashboard.ts                        │
 * │                                                                 │
 * │  5. Add a matching metric entry in app/config/dashboard.ts      │
 * │     with the same cardId and valueKey                           │
 * │                                                                 │
 * │  ─── EXAMPLE ───                                                │
 * │                                                                 │
 * │  "99": `                                                        │
 * │    SELECT                                                       │
 * │      DATE_TRUNC('{G}', created_at AT TIME ZONE 'Europe/Lisbon') │
 * │        AS period_start,                                         │
 * │      SUM(amount) AS total_revenue                               │
 * │    FROM invoices                                                │
 * │    GROUP BY 1                                                   │
 * │    ORDER BY 1 ASC`,                                             │
 * │                                                                 │
 * └─────────────────────────────────────────────────────────────────┘
 */

export const CARD_SQL: Record<string, string> = {
  // ── Swaps (cards 66–69) ────────────────────────────────────────

  "66": `
    SELECT
      DATE_TRUNC('{G}', start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(*) AS completed_swaps
    FROM swaps
    WHERE end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "67": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT d.vehicle_id), 0), 2) AS swaps_per_vehicle
    FROM swaps s
    JOIN docks d ON s.dock_id = d.id
    WHERE s.end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "68": `
    SELECT
      DATE_TRUNC('{G}', start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM slots), 0), 2) AS swaps_per_slot
    FROM swaps
    WHERE end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "69": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT st.site_id), 0), 2) AS swaps_per_site
    FROM swaps s
    JOIN stations st ON s.station_id = st.id
    WHERE s.end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  // ── Users (cards 74–77) ────────────────────────────────────────

  "74": `
    SELECT
      DATE_TRUNC('{G}', first_swap AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(DISTINCT vehicle_id) AS active_users
    FROM (
      SELECT d.vehicle_id, MIN(s.start_time) AS first_swap
      FROM swaps s
      JOIN docks d ON d.id = s.dock_id
      WHERE s.end_time IS NOT NULL
      GROUP BY d.vehicle_id
    ) t
    GROUP BY 1
    ORDER BY 1 ASC`,

  "75": `
    SELECT
      DATE_TRUNC('{G}', first_swap AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(DISTINCT billing_info_id) AS active_clients
    FROM (
      SELECT v.billing_info_id, MIN(s.start_time) AS first_swap
      FROM swaps s
      JOIN docks d ON d.id = s.dock_id
      JOIN vehicles v ON v.id = d.vehicle_id
      WHERE s.end_time IS NOT NULL AND v.billing_info_id IS NOT NULL
      GROUP BY v.billing_info_id
    ) t
    GROUP BY 1
    ORDER BY 1 ASC`,

  "76": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(DISTINCT d.vehicle_id) AS users_with_swaps
    FROM swaps s
    JOIN docks d ON d.id = s.dock_id
    WHERE s.end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "77": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(DISTINCT v.billing_info_id) AS clients_with_swaps
    FROM swaps s
    JOIN docks d ON d.id = s.dock_id
    JOIN vehicles v ON v.id = d.vehicle_id
    WHERE s.end_time IS NOT NULL AND v.billing_info_id IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  // ── Add more queries below ─────────────────────────────────────
};
