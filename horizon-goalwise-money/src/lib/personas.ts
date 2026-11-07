// @ts-nocheck
import { Engine } from './engine';
/* personas.js */
export const Personas = (() => {
  const amara = {
    id: 'amara', name: 'Amara', age: 34, emoji: '👩🏾‍⚕️',
    blurb: 'Single mum, part-time care worker. Hours change every week.',
    adults: 1, dependants: 1, employerPension: true,
    income: [
      { label: 'Wages (care agency)', amount: 350, cv: 0.22, variable: true, schedule: { type: 'weekly', weekday: 5 } },
      { label: 'Child Benefit', amount: 105, cv: 0, variable: false, schedule: { type: 'every', days: 28, anchor: '2026-11-02' } },
    ],
    incomeDips: [{ month: 1, factor: 0.72 }],
    bills: [
      { label: 'Rent', amount: 750, tag: 'rent', schedule: { type: 'monthly', day: 1 } },
      { label: 'Council Tax', amount: 95, tag: 'bill', schedule: { type: 'monthly', day: 15, months: [4,5,6,7,8,9,10,11,12,1] } },
      { label: 'Energy', amount: 85, tag: 'energy', winter: 1.3, schedule: { type: 'monthly', day: 20 } },
      { label: 'Phone', amount: 22, tag: 'bill', schedule: { type: 'monthly', day: 10 } },
      { label: 'Broadband', amount: 28, tag: 'bill', schedule: { type: 'monthly', day: 10 } },
    ],
    annual: [
      { label: 'Christmas costs', amount: 180, month: 12, day: 15, spreadable: false },
      { label: 'Car insurance renewal', amount: 410, month: 2, day: 3 },
    ],
    varWeekly: 85, varCv: 0.3,
    debts: [{ type: 'credit_card', label: 'Credit card', balance: 900, apr: 29.9, min: 30, day: 25 }],
    balance: 600, savings: 120,
    goals: [{ name: "Home deposit & Zara's future", target: 20000, year: 2033 }],
    attitude: [3, 3, 2],
    supportChecks: { benefits: false, council: false, social: false },
    hasMortgage: false, fx: false,
  };
  const ravi = {
    id: 'ravi', name: 'Ravi', age: 19, emoji: '🧑🏽‍🎓',
    blurb: 'International student. Money arrives from home in rupees; rent is due each term.',
    adults: 1, dependants: 0, employerPension: false,
    income: [
      { label: 'Transfer from family (INR→GBP)', amount: 900, cv: 0.05, variable: false, fx: true, schedule: { type: 'monthly', day: 5 } },
      { label: 'Café job', amount: 140, cv: 0.35, variable: true, schedule: { type: 'weekly', weekday: 4 } },
    ],
    incomeDips: [{ month: 12, factor: 0.5 }],
    bills: [
      { label: 'Phone', amount: 15, tag: 'bill', schedule: { type: 'monthly', day: 12 } },
      { label: 'Gym & subscriptions', amount: 32, tag: 'bill', schedule: { type: 'monthly', day: 3 } },
    ],
    annual: [
      { label: 'Term 2 rent (halls)', amount: 2350, month: 1, day: 12, spreadable: false },
      { label: 'Flight home deposit', amount: 300, month: 12, day: 2, spreadable: false },
    ],
    varWeekly: 85, varCv: 0.3,
    debts: [],
    balance: 1050, savings: 0,
    goals: [{ name: 'Emergency fund then index fund', target: 3000, year: 2029 }],
    attitude: [4, 4, 3],
    supportChecks: { benefits: true, council: false, social: false },
    hasMortgage: false, fx: true,
  };
  const family = {
    id: 'family', name: 'Daniel & Chloe', age: 40, emoji: '👨‍👩‍👧‍👦',
    blurb: 'Two kids, one full salary plus part-time. Mortgage fix ends soon.',
    adults: 2, dependants: 2, employerPension: true,
    income: [
      { label: 'Salary (Daniel)', amount: 2650, cv: 0.02, variable: false, schedule: { type: 'monthly', day: 28 } },
      { label: 'Part-time (Chloe)', amount: 820, cv: 0.12, variable: true, schedule: { type: 'monthly', day: 25 } },
      { label: 'Child Benefit', amount: 180, cv: 0, variable: false, schedule: { type: 'every', days: 28, anchor: '2026-11-03' } },
    ],
    incomeDips: [],
    bills: [
      { label: 'Mortgage (fixed 2.1%)', amount: 980, tag: 'rent', schedule: { type: 'monthly', day: 1 } },
      { label: 'Council Tax', amount: 190, tag: 'bill', schedule: { type: 'monthly', day: 15, months: [4,5,6,7,8,9,10,11,12,1] } },
      { label: 'Energy', amount: 160, tag: 'energy', winter: 1.3, schedule: { type: 'monthly', day: 18 } },
      { label: 'Childcare', amount: 420, tag: 'bill', schedule: { type: 'monthly', day: 2 } },
      { label: 'Car costs', amount: 150, tag: 'bill', schedule: { type: 'monthly', day: 8 } },
      { label: 'Phones & broadband', amount: 75, tag: 'bill', schedule: { type: 'monthly', day: 10 } },
    ],
    annual: [
      { label: 'Christmas costs', amount: 450, month: 12, day: 12, spreadable: false },
      { label: 'Home insurance', amount: 340, month: 1, day: 20 },
    ],
    varWeekly: 205, varCv: 0.2,
    debts: [{ type: 'car_finance', label: 'Car finance', balance: 6000, apr: 7.9, min: 220, day: 20 }],
    balance: 1700, savings: 3800,
    goals: [{ name: "Kids' university fund", target: 30000, year: 2041 }],
    attitude: [3, 4, 3],
    supportChecks: { benefits: true, council: true, social: false },
    hasMortgage: true, fx: false,
  };
  const blank = {
    id: 'me', name: '', age: 30, emoji: '🙂', blurb: '',
    adults: 1, dependants: 0, employerPension: false,
    income: [], incomeDips: [], bills: [], annual: [], varWeekly: 80, varCv: 0.25,
    debts: [], balance: 300, savings: 0, goals: [], attitude: [3, 3, 3],
    supportChecks: { benefits: false, council: false, social: false }, hasMortgage: false, fx: false,
  };
  function statementCSV(p, months = 6) {
    const E = Engine;
    const rand = E.mulberry32(99), N = E.normalGen(rand);
    const end = E.todayUTC(), start = E.addDays(end, -months * 30);
    const rows = ['Date,Description,Amount'];
    const shops = ['TESCO STORES', 'ALDI', 'LIDL', 'GREGGS', 'DELIVEROO', 'TFL TRAVEL', 'STAGECOACH BUS', 'BOOTS', 'PRIMARK', 'COSTA COFFEE'];
    for (let d = start; d <= end; d = E.addDays(d, 1)) {
      const ds = E.iso(d);
      for (const i of p.income) if (E.isDue(i.schedule, d)) rows.push(`${ds},${i.label.toUpperCase()},${(i.amount * (1 + i.cv * N())).toFixed(2)}`);
      for (const b of p.bills) if (E.isDue(b.schedule, d)) rows.push(`${ds},${b.label.toUpperCase()} DD,${(-b.amount).toFixed(2)}`);
      for (const db of p.debts) if (d.getUTCDate() === (db.day || 25)) rows.push(`${ds},${db.label.toUpperCase()} PAYMENT,${(-db.min).toFixed(2)}`);
      const n = rand() < 0.6 ? 1 : rand() < 0.5 ? 2 : 0;
      for (let k = 0; k < n; k++) {
        const amt = Math.max(1.5, (p.varWeekly / 7 / 0.85) * (1 + 0.5 * N()));
        rows.push(`${ds},${shops[Math.floor(rand() * shops.length)]},${(-amt).toFixed(2)}`);
      }
    }
    return rows.join('\n');
  }
  return { amara, ravi, family, blank, list: [amara, ravi, family], statementCSV };
})();

// Portfolio demo amounts (added alongside the persona data, not part of the engine maths).
export const PERSONA_INVESTED: Record<string, number> = { amara: 0, ravi: 0, family: 8500 };
