# 🛡️ KavachPay

> **Trigger. Verify. Pay.**
> Automatic income protection for food delivery workers — when the weather stops them working, KavachPay pays them instantly.

Guidewire DEVTrails 2026 | Team : The boys

**Team**
- R S Kirithic
- Madhav S
- Ankith U Davey
- Ashwin S

---

## What is KavachPay?

KavachPay is a parametric income insurance platform built for Zomato and Swiggy delivery partners in Indian metro cities. It watches for weather and environmental disruptions in a worker's delivery zone, verifies they were active and got affected, and transfers money to their UPI account automatically.

No claim form. No phone call. No waiting.

The entire flow — detection, verification, payout — happens without the worker doing anything after their morning check-in.

---

## The Problem

A Swiggy delivery partner in Bengaluru earns roughly ₹700–₹900 on a good working day. When heavy rain hits, that number goes to zero. Orders dry up, roads become dangerous, and the platform offers no protection.

This is not rare. Indian metros see dozens of such disruption events every monsoon season — heavy rainfall, AQI spikes, sudden curfews. Workers lose 20–30% of their monthly income to events entirely outside their control, with no recourse and no safety net.

Traditional insurance products are not designed for this. They require monthly premiums, lengthy claim processes, and proof of loss — all of which are misaligned with how gig workers actually earn and live.

KavachPay is built from scratch around the gig worker's reality: weekly income, daily risk, and zero tolerance for paperwork.

---

## How It Works

**Step 1 — Worker checks in**
At the start of their shift, the worker taps "Start My Day" on the KavachPay app. This single tap is their declaration of intent to work. It replaces complex GPS tracking entirely.

**Step 2 — System monitors conditions**
Every 30 minutes, KavachPay polls live weather and AQI data for each active delivery zone. The moment a threshold is crossed, a disruption event is created for that zone.

**Step 3 — Activity is verified**
For each worker in the affected zone, the system checks: did they start their day? Are they currently inactive? If yes — they were planning to work and got disrupted. That is a valid claim.

**Step 4 — Fraud checks run automatically**
Five independent checks run in sequence: work intent, historical work patterns, zone-wide correlation, a self-declaration prompt, and KavachScore evaluation. All automated, all instant.

**Step 5 — Payout fires**
Workers who pass all checks receive a UPI transfer within minutes. The amount depends on disruption severity. No human reviews it. No approval queue.

---

## Disruption Triggers

| Event | Threshold | Payout Level |
|---|---|---|
| Rainfall | 50–75mm → Minor / 75–100mm → Moderate / 100mm+ → Severe | 30% / 65% / 100% |
| Air Quality | AQI 200–300 → Minor / 300–400 → Moderate / 400+ → Severe | 30% / 65% / 100% |
| Flood Alert | Active NDMA warning in zone | 100% |
| Curfew or Zone Closure | Admin-confirmed closure | 100% |
| Extreme Heat | Temperature above 45°C | 30% |

All triggers use live API data. No self-reporting. No manual verification.

---

## Weekly Pricing

KavachPay charges a weekly premium because that is how delivery workers think about money. A ₹49 deduction on Monday feels manageable. A ₹200 monthly charge feels like a risk.

The base premium is ₹49 per week. It adjusts based on three factors: the flood risk profile of the worker's zone, their claim history, and how long they have been on the platform. New workers in high-risk zones pay up to ₹80 per week. Experienced workers in safer zones pay the base rate.

Coverage is always 65% of the worker's average weekly income — calculated from their signup data and adjusted over time.

Crucially, a legitimate claim never raises a worker's premium. Pricing reflects where you work, not whether you've claimed before.

---

## KavachScore

Every worker on KavachPay has a KavachScore — a number between 300 and 900 that reflects their claim reliability. Think of it as a trust rating for insurance.

It starts at 750 for everyone. It goes up when claims are verified clean, when workers honestly decline payouts they don't need, or when they renew their policy without gaps. It goes down when fraud flags are raised.

The score determines payout speed:

- **750 and above** — transfer fires instantly
- **500 to 749** — transfer delayed by 2 hours
- **Below 500** — flagged for manual admin review

A higher KavachScore also unlocks lower premiums over time, giving workers a real incentive to engage honestly with the system.

---

## Fraud Detection

KavachPay runs five checks on every claim before approving a payout.

1. **Work intent** — did the worker tap Start My Day before the disruption?
2. **Day pattern** — does the worker usually work on this day of the week?
3. **Zone correlation** — are at least 3 other workers in the same zone also inactive?
4. **Self declaration** — worker confirms via in-app prompt that they were impacted
5. **KavachScore gate** — workers in the Red tier are held for manual review

Any single flag alone does not block a payout. Two or more flags together mark a claim as suspicious and pause auto-approval. This keeps honest workers protected while filtering out fraud without requiring a human investigator.

---

## Data Sources

| Source | What It Provides |
|---|---|
| OpenWeatherMap API | Live rainfall, temperature, weather alerts |
| WAQI API (aqicn.org) | Live AQI and PM2.5 per city zone |
| Python Faker + custom script | 1,000 synthetic worker profiles for testing |
| Razorpay Test Mode | Simulated UPI payouts (no real money) |

Delivery platform data (order counts, earnings) is simulated since Zomato and Swiggy APIs are not publicly available.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS |
| Backend | Python / Flask |
| Database | Firebase Firestore |
| AI and Logic | Python (rule-based engine) |
| Weather | OpenWeatherMap API |
| AQI | WAQI API |
| Payments | Razorpay Test Mode |
| Hosting | Vercel (frontend), Render (backend) |

---

## Repo Structure

```
kavachpay/
├── frontend/     →  React app, worker UI, dashboard
├── backend/      →  Flask API, trigger engine, claim logic
├── ml/           →  Premium calculator, fraud checks, KavachScore
├── docs/         →  Architecture diagram, research notes
└── README.md
```

---

## Project Timeline

**Weeks 1–2 (March 4–20) — Research and Design**
We spent the first two weeks deeply understanding the problem before writing a single line of code. This meant studying how delivery workers actually earn, mapping out which disruptions affect them most, and designing the premium model from scratch. The KavachScore concept and the 5-layer fraud system were both defined during this period. We also set up the repo, finalized the tech stack, and built early UI wireframes to agree on the product direction as a team.

**Weeks 3–4 (March 21 – April 4) — Building the Core**
This is where the product comes together. The worker onboarding flow goes live, the Flask backend connects to Firebase, and the premium calculator runs on real signup data. The weather trigger engine starts polling OpenWeatherMap every 30 minutes — and when a threshold is crossed, a claim record is created automatically in the database. By the end of Week 4, a worker should be able to sign up, see their premium, and watch a claim appear when a disruption is simulated. The full Trigger → Verify → Pay loop works end to end.

**Weeks 5–6 (April 5–17) — Hardening and Demo**
The final stretch focuses on making the product trustworthy and demo-ready. All five fraud detection layers are activated and connected to the claim pipeline. Razorpay test mode is wired in so payouts actually fire to a simulated UPI account. The worker dashboard shows KavachScore, earnings protected, and payout history. The admin view shows zone-level disruption activity and loss ratios. The last few days are reserved for recording the final walkthrough video and putting together the pitch deck.

---

## Why KavachPay Matters

India has over 12 million gig delivery workers. None of them have income insurance designed for how they actually work. KavachPay is not a modified version of an existing product — it is built ground-up for the weekly, weather-exposed, paperwork-allergic reality of the gig worker.

The goal is simple: when something outside their control stops them from earning, they should not have to fight to get compensated. They should just get paid.

---

**Video:** *(link)*
