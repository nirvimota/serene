// src/utils/notificationContent.js
// Static content bank — no logic, just data.
// All tips rotate deterministically based on day-of-year so every user
// sees the same tip on the same calendar day (no randomness per-session).

// ── Phase-based food tips ────────────────────────────────────────────────────
export const FOOD_TIPS_BY_PHASE = {
  period: [
    {
      title: 'Iron-Rich Foods Today',
      body: 'You\'re losing iron during your period. Try lentil soup, dark leafy greens, or a handful of pumpkin seeds to replenish.',
    },
    {
      title: 'Warm Broths & Herbal Teas',
      body: 'Ginger tea reduces prostaglandins that cause cramping. Add honey + lemon for an anti-inflammatory boost.',
    },
    {
      title: 'Dark Chocolate (Really!)',
      body: '70%+ dark chocolate is rich in magnesium, which eases cramps and supports mood. A square or two is your friend today.',
    },
  ],
  follicular: [
    {
      title: 'Probiotic Power',
      body: 'Rising estrogen thrives with a healthy gut. Try Greek yogurt, kimchi, or kefir today to support your microbiome.',
    },
    {
      title: 'Raw Brassicas & Seeds',
      body: 'Broccoli, cauliflower, and pumpkin seeds support estrogen metabolism. Great time for a fresh salad.',
    },
    {
      title: 'Citrus & Vitamin C',
      body: 'Your energy is rising — support it with fresh oranges, kiwi, or bell peppers packed with Vitamin C and antioxidants.',
    },
  ],
  ovulatory: [
    {
      title: 'Cooling & Hydrating Foods',
      body: 'Your body temperature peaks around ovulation. Cucumber, watermelon, and cold-pressed green juices keep you balanced.',
    },
    {
      title: 'Quinoa & Lean Protein',
      body: 'Your metabolism is at its peak. Fuel high-energy days with quinoa, grilled chicken, or edamame for sustained energy.',
    },
    {
      title: 'Fresh Berries',
      body: 'Blueberries and raspberries are antioxidant powerhouses. They support the oxidative stress that comes with the LH surge.',
    },
  ],
  luteal: [
    {
      title: 'Magnesium for Mood',
      body: 'PMS mood swings often stem from low magnesium. Baked sweet potato, dark chocolate, and almonds are your allies today.',
    },
    {
      title: 'Complex Carbs = Calm',
      body: 'Cravings in the luteal phase are real. Reach for oats, brown rice, or lentils — they stabilize blood sugar and ease irritability.',
    },
    {
      title: 'Herbal Tea Ritual',
      body: 'Chamomile reduces anxiety and raspberry leaf supports the uterus during the luteal phase. Make it a daily ritual.',
    },
  ],
  // fallback for 'unknown' phase
  unknown: [
    {
      title: 'Eat the Rainbow Today',
      body: 'Aim for 5+ colors on your plate — each pigment brings different phytonutrients that support hormonal balance.',
    },
    {
      title: 'Stay Anti-Inflammatory',
      body: 'Turmeric, ginger, and omega-3 rich foods like walnuts and flaxseed support hormonal health at any cycle phase.',
    },
    {
      title: 'Whole Foods First',
      body: 'Minimize processed foods today. Your hormones are sensitive to blood sugar spikes — whole grains and legumes are your friends.',
    },
  ],
};

// ── Hydration tips ───────────────────────────────────────────────────────────
export const HYDRATION_TIPS = [
  {
    title: 'Hydration Check-In 💧',
    body: 'Aim for 2–2.5L of water today. Dehydration worsens cramps, fatigue, and mood during your cycle.',
  },
  {
    title: 'Start Your Day with Water 💧',
    body: 'Drink a full glass of water first thing in the morning before coffee. It jumpstarts digestion and balances cortisol.',
  },
  {
    title: 'Electrolytes Matter 💧',
    body: 'Plain water isn\'t always enough. Add a pinch of Himalayan salt or a squeeze of lemon for natural electrolytes.',
  },
  {
    title: 'Herbal Hydration 💧',
    body: 'Hibiscus and peppermint teas count toward your fluid intake and have anti-inflammatory benefits. Brew a pot today.',
  },
  {
    title: 'Hydration = Energy 💧',
    body: 'Even mild dehydration (1–2%) causes brain fog and fatigue. Keep a water bottle at your desk as a visual reminder.',
  },
];

// ── Notification type metadata (color, emoji) ────────────────────────────────
export const NOTIFICATION_META = {
  period_soon: {
    emoji: '🌸',
    colorClass: 'border-rose-400',
    bgClass: 'bg-rose-50',
    iconColor: 'text-rose-500',
    label: 'Period',
  },
  ovulation_soon: {
    emoji: '✨',
    colorClass: 'border-amber-400',
    bgClass: 'bg-amber-50',
    iconColor: 'text-amber-500',
    label: 'Ovulation',
  },
  fertile_window: {
    emoji: '🌿',
    colorClass: 'border-emerald-400',
    bgClass: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    label: 'Fertile Window',
  },
  hydration: {
    emoji: '💧',
    colorClass: 'border-sky-400',
    bgClass: 'bg-sky-50',
    iconColor: 'text-sky-500',
    label: 'Hydration',
  },
  food_tip: {
    emoji: '🥗',
    colorClass: 'border-purple-400',
    bgClass: 'bg-purple-50',
    iconColor: 'text-purple-500',
    label: 'Nutrition',
  },
  symptom_log: {
    emoji: '📓',
    colorClass: 'border-stone-400',
    bgClass: 'bg-stone-50',
    iconColor: 'text-stone-500',
    label: 'Journal',
  },
  cycle_complete: {
    emoji: '📊',
    colorClass: 'border-rose-300',
    bgClass: 'bg-rose-50',
    iconColor: 'text-rose-400',
    label: 'Cycle Data',
  },
};

// ── Deterministic daily rotation ─────────────────────────────────────────────
// Returns the same item every calendar day (rotates with day-of-year),
// so the tip feels "of the day" rather than random.
export function getTipOfDay(arr) {
  if (!arr || arr.length === 0) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return arr[dayOfYear % arr.length];
}
