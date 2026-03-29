/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  PULSE DASHBOARD CONFIGURATION                                  │
 * │                                                                 │
 * │  This is the ONLY file you need to edit to add metrics or       │
 * │  sections to the dashboard. The SQL lives in Metabase — Pulse   │
 * │  fetches it automatically from the card ID. No SQL in the       │
 * │  codebase.                                                      │
 * │                                                                 │
 * │  ─── HOW TO ADD A METRIC TO AN EXISTING SECTION ───             │
 * │                                                                 │
 * │  1. Create the question in Metabase. The SQL must:              │
 * │     - Use {{granularity}} for DATE_TRUNC (day/week/month)       │
 * │     - Return a column called period_start                       │
 * │     - Return a value column (you pick the name)                 │
 * │                                                                 │
 * │  2. Get the card ID from the Metabase URL:                      │
 * │     /question/66-swaps-weekly → card ID = 66                    │
 * │                                                                 │
 * │  3. Add an entry to the section's `metrics` array below:        │
 * │     {                                                           │
 * │       id: "unique_id",         // any unique string             │
 * │       label: "Display name",   // shown in the table            │
 * │       calculation: "How...",   // tooltip on hover (info icon)  │
 * │       cardId: 66,              // from step 2                   │
 * │       decimals: 0,             // 0 = integer, 1 = 0.0, etc.   │
 * │       suffix: "%",            // optional — appended to values  │
 * │     }                                                           │
 * │                                                                 │
 * │  That's it. No other files need editing.                        │
 * │                                                                 │
 * │  ─── HOW TO ADD A NEW SECTION ───                               │
 * │                                                                 │
 * │  Add a new object to the SECTIONS array:                        │
 * │  { id: "my_section", label: "My Section", metrics: [...] }      │
 * │                                                                 │
 * │  ─── HOW IT WORKS ───                                           │
 * │                                                                 │
 * │  The API route fetches the card's SQL from Metabase at runtime, │
 * │  replaces {{granularity}} with the selected value, and runs it. │
 * │  If you update the SQL in Metabase, the dashboard picks it up   │
 * │  automatically on the next request.                             │
 * │                                                                 │
 * └─────────────────────────────────────────────────────────────────┘
 */

export interface MetricConfig {
  /** Unique ID for this metric (used internally — any string, must be unique) */
  id: string;
  /** Display label shown in the table row */
  label: string;
  /** Short description shown on hover via info icon */
  calculation: string;
  /** Metabase card ID — the number from the question URL */
  cardId: number;
  /** Decimal places for display (0 = integer, 1 = 0.0, 2 = 0.00) */
  decimals: number;
  /** Optional suffix appended after values, e.g. "%" */
  suffix?: string;
}

export interface SectionConfig {
  /** Unique ID for this section */
  id: string;
  /** Display label shown in the dark section header bar */
  label: string;
  /** Metrics displayed under this section */
  metrics: MetricConfig[];
}

// =====================================================================
//  SECTIONS — add new sections or metrics here
// =====================================================================

export const SECTIONS: SectionConfig[] = [
  // ── Swaps ──────────────────────────────────────────────────────
  {
    id: "swaps",
    label: "Swaps",
    metrics: [
      {
        id: "completed_swaps",
        label: "Completed swaps",
        calculation: "Count of battery swaps",
        cardId: 66,
        decimals: 0,
      },
      {
        id: "swaps_per_vehicle",
        label: "Swaps / vehicle",
        calculation: "Completed swaps / active vehicles",
        cardId: 67,
        decimals: 1,
      },
      {
        id: "swaps_per_slot",
        label: "Swaps / slot",
        calculation: "Completed swaps / total slots",
        cardId: 68,
        decimals: 2,
      },
      {
        id: "swaps_per_site",
        label: "Swaps / site",
        calculation: "Completed swaps / active sites",
        cardId: 69,
        decimals: 1,
      },
    ],
  },

  // ── Users ──────────────────────────────────────────────────────
  {
    id: "users",
    label: "Users",
    metrics: [
      {
        id: "active_users",
        label: "Active users",
        calculation: "New users (first swap in period)",
        cardId: 74,
        decimals: 0,
      },
      {
        id: "active_clients",
        label: "Active clients",
        calculation: "New clients (first swap in period)",
        cardId: 75,
        decimals: 0,
      },
      {
        id: "users_with_swaps",
        label: "Users with swaps",
        calculation: "Unique users with ≥1 swap",
        cardId: 76,
        decimals: 0,
      },
      {
        id: "clients_with_swaps",
        label: "Clients with swaps",
        calculation: "Unique clients with ≥1 swap",
        cardId: 77,
        decimals: 0,
      },
    ],
  },

  // ── Experience ──────────────────────────────────────────────────
  {
    id: "experience",
    label: "Experience",
    metrics: [
      {
        id: "avg_soc_in",
        label: "Avg. SoC at swap in",
        calculation: "Average state of charge of returned battery",
        cardId: 79,
        decimals: 1,
        suffix: "%",
      },
      {
        id: "avg_soc_out",
        label: "Avg. SoC at swap out",
        calculation: "Average state of charge of dispensed battery",
        cardId: 78,
        decimals: 1,
        suffix: "%",
      },
    ],
  },

  // ── Add more sections below ────────────────────────────────────
  // {
  //   id: "revenue",
  //   label: "Revenue",
  //   metrics: [
  //     {
  //       id: "total_revenue",
  //       label: "Total revenue",
  //       calculation: "Sum of all invoices",
  //       cardId: 99,
  //       decimals: 2,
  //     },
  //   ],
  // },
];
