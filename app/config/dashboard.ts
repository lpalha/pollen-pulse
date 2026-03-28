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
 * │       unit: "Number",          // or "Number (ratio)", etc.     │
 * │       calculation: "How...",   // short description             │
 * │       cardId: 66,              // from step 2                   │
 * │       valueKey: "column_name", // the value column name in SQL  │
 * │       decimals: 0,             // 0 = integer, 1 = 0.0, etc.   │
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
  /** Unit column text, e.g. "Number", "Number (ratio)", "%" */
  unit: string;
  /** Short description of how this metric is calculated */
  calculation: string;
  /** Metabase card ID — the number from the question URL */
  cardId: number;
  /** Column name in the SQL result that holds the metric value */
  valueKey: string;
  /** Decimal places for display (0 = integer, 1 = 0.0, 2 = 0.00) */
  decimals: number;
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
        unit: "Number",
        calculation: "Count of battery swaps",
        cardId: 66,
        valueKey: "completed_swaps",
        decimals: 0,
      },
      {
        id: "swaps_per_vehicle",
        label: "Swaps / vehicle",
        unit: "Number (ratio)",
        calculation: "Completed swaps / active vehicles",
        cardId: 67,
        valueKey: "swaps_per_vehicle",
        decimals: 1,
      },
      {
        id: "swaps_per_slot",
        label: "Swaps / slot",
        unit: "Number (ratio)",
        calculation: "Completed swaps / total slots",
        cardId: 68,
        valueKey: "swaps_per_slot",
        decimals: 2,
      },
      {
        id: "swaps_per_site",
        label: "Swaps / site",
        unit: "Number (ratio)",
        calculation: "Completed swaps / active sites",
        cardId: 69,
        valueKey: "swaps_per_site",
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
        unit: "Number",
        calculation: "New users (first swap in period)",
        cardId: 74,
        valueKey: "active_users",
        decimals: 0,
      },
      {
        id: "active_clients",
        label: "Active clients",
        unit: "Number",
        calculation: "New clients (first swap in period)",
        cardId: 75,
        valueKey: "active_clients",
        decimals: 0,
      },
      {
        id: "users_with_swaps",
        label: "Users with swaps",
        unit: "Number",
        calculation: "Unique users with ≥1 swap",
        cardId: 76,
        valueKey: "users_with_swaps",
        decimals: 0,
      },
      {
        id: "clients_with_swaps",
        label: "Clients with swaps",
        unit: "Number",
        calculation: "Unique clients with ≥1 swap",
        cardId: 77,
        valueKey: "clients_with_swaps",
        decimals: 0,
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
  //       unit: "EUR",
  //       calculation: "Sum of all invoices",
  //       cardId: 99,
  //       valueKey: "total_revenue",
  //       decimals: 2,
  //     },
  //   ],
  // },
];
