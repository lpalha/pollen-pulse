/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  PULSE DASHBOARD CONFIGURATION                                  │
 * │                                                                 │
 * │  This file defines every section and metric shown on the        │
 * │  dashboard. It is the ONLY file you need to edit to change      │
 * │  what appears on the page. (You also need to add the SQL        │
 * │  query in app/config/queries.ts — see instructions there.)      │
 * │                                                                 │
 * │  ─── HOW TO ADD A METRIC TO AN EXISTING SECTION ───             │
 * │                                                                 │
 * │  1. Find the Metabase question URL you want to add.             │
 * │     The card ID is the number in the URL:                       │
 * │     /question/66-swaps-weekly → card ID = 66                    │
 * │                                                                 │
 * │  2. Add an entry to the section's `metrics` array below:        │
 * │     {                                                           │
 * │       id: "unique_id",         // any unique string             │
 * │       label: "Display name",   // shown in the table            │
 * │       unit: "Number",          // or "Number (ratio)", etc.     │
 * │       calculation: "How...",   // short description             │
 * │       cardId: 66,              // from step 1                   │
 * │       valueKey: "column_name", // SQL result column name        │
 * │       decimals: 0,             // 0 = integer, 1 = 0.0, etc.   │
 * │     }                                                           │
 * │                                                                 │
 * │  3. Add the SQL in app/config/queries.ts (same card ID)         │
 * │                                                                 │
 * │  ─── HOW TO ADD A NEW SECTION ───                               │
 * │                                                                 │
 * │  1. Add a new object to the SECTIONS array below:               │
 * │     { id: "my_section", label: "My Section", metrics: [...] }   │
 * │                                                                 │
 * │  2. Add SQL templates for each metric in queries.ts             │
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
