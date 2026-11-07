// @ts-nocheck
/* engine.js */
export const Engine = (() => {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normalGen(rand) {
    let spare = null;
    return function () {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let u = 0, v = 0;
      while (u === 0) u = rand();
      while (v === 0) v = rand();
      const m = Math.sqrt(-2 * Math.log(u));
      spare = m * Math.sin(2 * Math.PI * v);
      return m * Math.cos(2 * Math.PI * v);
    };
  }
  const clip = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
  const DAY = 864e5;
  function todayUTC() {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }
  const addDays = (d, k) => new Date(d.getTime() + k * DAY);
  const iso = d => d.toISOString().slice(0, 10);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = d => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  const lastDayOfMonth = d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  function isDue(s, d) {
    if (!s) return false;
    const m = d.getUTCMonth() + 1;
    if (s.months && !s.months.includes(m)) return false;
    if (s.type === 'monthly') {
      const day = Math.min(s.day, lastDayOfMonth(d));
      return d.getUTCDate() === day;
    }
    if (s.type === 'weekly') return d.getUTCDay() === s.weekday;
    if (s.type === 'every') {
      const a = Date.parse(s.anchor);
      const diff = Math.round((d.getTime() - a) / DAY);
      return diff >= 0 ? diff % s.days === 0 : (-diff) % s.days === 0;
    }
    if (s.type === 'annual') return m === s.month && d.getUTCDate() === s.day;
    return false;
  }
  function perMonth(amount, s) {
    if (!s) return 0;
    const activeShare = s.months ? s.months.length / 12 : 1;
    if (s.type === 'monthly') return amount * activeShare;
    if (s.type === 'weekly') return amount * 52 / 12;
    if (s.type === 'every') return amount * (365 / s.days) / 12;
    if (s.type === 'annual') return amount / 12;
    return 0;
  }
  function summarise(p) {
    const income = p.income.reduce((a, i) => a + perMonth(i.amount, i.schedule), 0);
    const bills = p.bills.reduce((a, b) => a + perMonth(b.amount * (b.winter ? 1.1 : 1), b.schedule), 0);
    const annual = (p.annual || []).reduce((a, x) => a + x.amount / 12, 0);
    const flexible = p.varWeekly * 52 / 12;
    const debtMin = p.debts.reduce((a, d) => a + d.min, 0);
    const essentials = bills + annual + flexible * 0.6;
    const outgoings = bills + annual + flexible + debtMin;
    const surplus = income - outgoings;
    const cv = income > 0 ? p.income.reduce((a, i) => a + perMonth(i.amount, i.schedule) * (i.cv || 0), 0) / income : 1;
    return { income, bills, annual, flexible, debtMin, essentials, outgoings, surplus, cv };
  }
  function score(p, fc) {
    const s = summarise(p);
    const bufferMonths = s.essentials > 0 ? p.savings / s.essentials : 0;
    const surplusRatio = s.income > 0 ? s.surplus / s.income : -1;
    const debtRatio = s.income > 0 ? s.debtMin / s.income : 1;
    const checks = Object.values(p.supportChecks || {});
    const supportShare = checks.length ? checks.filter(Boolean).length / checks.length : 0;
    const comps = [
      { key: 'buffer', label: 'Safety buffer', weight: 0.30, value: clip(bufferMonths / 3),
        measure: `${bufferMonths.toFixed(1)} months of essentials saved`, full: '3 months' },
      { key: 'surplus', label: 'Monthly surplus', weight: 0.25, value: clip(surplusRatio / 0.15),
        measure: `${Math.round(surplusRatio * 100)}% of income left over`, full: '15% or more' },
      { key: 'debt', label: 'Debt burden', weight: 0.20, value: clip(1 - debtRatio / 0.30),
        measure: `${Math.round(debtRatio * 100)}% of income on debt repayments`, full: '0%' },
      { key: 'stability', label: 'Income stability', weight: 0.15, value: clip(1 - (s.cv - 0.05) / 0.45),
        measure: `Income varies by about ${Math.round(s.cv * 100)}% month to month`, full: '5% or less' },
      { key: 'support', label: 'Support checked', weight: 0.10, value: supportShare,
        measure: `${checks.filter(Boolean).length} of ${checks.length} support checks done`, full: 'all checks done' },
    ];
    const total = Math.round(100 * comps.reduce((a, c) => a + c.weight * c.value, 0));
    const r = rung(p, s, fc, bufferMonths);
    return { total, comps, bufferMonths, summary: s, ...r };
  }
  const RUNGS = [
    { n: 1, name: 'Stabilise', goal: 'No shortfall in the next 90 days, essentials covered' },
    { n: 2, name: 'Starter buffer', goal: '£500 or 2 weeks of essentials saved' },
    { n: 3, name: 'Clear costly debt', goal: 'Nothing above 15% APR' },
    { n: 4, name: 'Full buffer', goal: '3 months of essentials (6 if income varies or you have dependants)' },
    { n: 5, name: 'Grow', goal: 'Goal-based investing in tax-free wrappers' },
  ];
  function rung(p, s, fc, bufferMonths) {
    const starter = Math.min(500, s.essentials / 2);
    const fullTarget = (s.cv > 0.15 || p.dependants > 0) ? 6 : 3;
    const costly = p.debts.filter(d => d.apr > 15);
    let current, action;
    if ((fc && fc.worstPNeg >= 0.3) || s.surplus < 0) {
      current = 1;
      action = fc && fc.worstPNeg >= 0.3
        ? `Protect ${fmtDate(fc.worstDate)}: there's a ${Math.round(fc.worstPNeg * 100)}% chance you dip below £0. See the fixes in Time Travel.`
        : `Your outgoings are £${Math.round(-s.surplus)} more than your income each month. Let's find room in your bills.`;
    } else if (p.savings < starter) {
      current = 2;
      const need = Math.ceil((starter - p.savings) / 10) * 10;
      action = `Build a starter buffer: £${need} to go. Saving £${Math.max(5, Math.ceil(need / 12))} a week gets you there in about 3 months.`;
    } else if (costly.length) {
      current = 3;
      const top = costly.sort((a, b) => b.apr - a.apr)[0];
      action = `Pay down your ${top.type.replace('_', ' ')} (${top.apr}% APR) first. Every £1 there saves more than any savings account pays.`;
    } else if (bufferMonths < fullTarget) {
      current = 4;
      action = `Grow your buffer to ${fullTarget} months of essentials (£${Math.round(fullTarget * s.essentials).toLocaleString()}). You're ${Math.round(bufferMonths / fullTarget * 100)}% there.`;
    } else {
      current = 5;
      action = `You're ready to invest for your goals. See your plan for a suggested mix.`;
    }
    return { rung: current, action, starter, fullTarget };
  }
  function forecast(p, opts = {}) {
    const days = opts.days || 90;
    const paths = opts.paths || 1000;
    const shocks = opts.shocks || [];
    const fixes = opts.fixes || {};
    const start = opts.start || todayUTC();
    const rand = mulberry32(opts.seed || 42);
    const N = normalGen(rand);
    const balances = Array.from({ length: days }, () => new Float64Array(paths));
    const dates = Array.from({ length: days }, (_, k) => addDays(start, k + 1));
    const fxShock = shocks.filter(s => s.kind === 'fx').reduce((a, s) => a * (1 + s.pct), 1);
    for (let i = 0; i < paths; i++) {
      let bal = p.balance;
      for (let k = 0; k < days; k++) {
        const d = dates[k];
        const month = d.getUTCMonth() + 1;
        const winter = [11, 12, 1, 2].includes(month);
        for (const inc of p.income) {
          if (!isDue(inc.schedule, d)) continue;
          let amt = inc.amount * (1 + (inc.cv || 0) * N());
          const dip = (p.incomeDips || []).find(x => x.month === month && inc.variable);
          if (dip) amt *= dip.factor;
          if (inc.fx) amt *= fxShock;
          for (const s of shocks) if (s.kind === 'income' && k >= s.from && k <= s.to && inc.variable !== false) amt *= (1 - s.pct);
          bal += Math.max(0, amt);
        }
        for (const b of p.bills) {
          if (!isDue(b.schedule, d)) continue;
          let amt = b.amount * (b.winter && winter ? b.winter : 1);
          for (const s of shocks) if (s.kind === 'bill' && b.tag === s.tag && k >= s.from) amt *= s.mult;
          bal -= amt;
        }
        for (const s of shocks) if (s.kind === 'monthly' && k >= s.from && d.getUTCDate() === s.day) bal -= s.amount;
        for (const a of (p.annual || [])) {
          if (fixes.spread && a.spreadable !== false) {
            if (d.getUTCDate() === a.day) bal -= a.amount / 12;
          } else if (isDue({ type: 'annual', month: a.month, day: a.day }, d)) bal -= a.amount;
        }
        for (const db of p.debts) if (d.getUTCDate() === (db.day || 25)) bal -= db.min;
        const daily = p.varWeekly / 7;
        let spend = daily * (1 + (p.varCv || 0.25) * N());
        if (fixes.trimWeekly) spend -= fixes.trimWeekly / 7;
        bal -= Math.max(0, spend);
        for (const s of shocks) if (s.kind === 'oneoff' && k === s.day) bal -= s.amount;
        balances[k][i] = bal;
      }
    }
    const q = (arr, pct) => arr[Math.min(arr.length - 1, Math.floor(pct * arr.length))];
    const p10 = [], p50 = [], p90 = [], pNeg = [];
    for (let k = 0; k < days; k++) {
      const sorted = Array.from(balances[k]).sort((a, b) => a - b);
      p10.push(q(sorted, 0.1)); p50.push(q(sorted, 0.5)); p90.push(q(sorted, 0.9));
      pNeg.push(sorted.filter(x => x < 0).length / paths);
    }
    let worstDay = 0;
    pNeg.forEach((v, k) => { if (v > pNeg[worstDay]) worstDay = k; });
    const firstRiskIdx = pNeg.findIndex(v => v >= 0.3);
    let lowIdx = 0; p10.forEach((v, k) => { if (v < p10[lowIdx]) lowIdx = k; });
    return {
      dates, p10, p50, p90, pNeg,
      worstPNeg: pNeg[worstDay], worstDay, worstDate: dates[worstDay],
      firstRiskIdx, firstRiskDate: firstRiskIdx >= 0 ? dates[firstRiskIdx] : null,
      lowestP10: p10[lowIdx], lowestP10Date: dates[lowIdx],
      spread: (p90[days - 1] - p10[days - 1]),
    };
  }
  function suggestFixes(p, fc, shocks) {
    if (fc.worstPNeg < 0.15) return [];
    const out = [];
    const weeks = Math.max(1, Math.floor((fc.worstDay + 1) / 7));
    const shortfall = Math.max(0, -fc.lowestP10) + 50;
    const trim = Math.min(Math.ceil(shortfall / weeks), Math.round(p.varWeekly * 0.35));
    if ((p.annual || []).some(a => a.spreadable !== false)) {
      const fc2 = forecast(p, { shocks, fixes: { spread: true } });
      out.push({ key: 'spread', title: 'Spread annual bills monthly',
        body: `Ask to pay ${p.annual.filter(a => a.spreadable !== false).map(a => a.label).join(', ')} in 12 monthly instalments instead of one lump.`,
        after: fc2.worstPNeg });
    }
    if (trim > 0) {
      const fc3 = forecast(p, { shocks, fixes: { trimWeekly: trim } });
      out.push({ key: 'trim', amount: trim, title: `Set aside £${trim} a week`,
        body: `Move £${trim} a week from flexible spending (takeaways, subscriptions) into a pot for ${fmtDate(fc.worstDate)}. It's still your money.`,
        after: fc3.worstPNeg });
    }
    if (out.length === 2) {
      const fc4 = forecast(p, { shocks, fixes: { spread: true, trimWeekly: trim } });
      out.push({ key: 'both', title: 'Do both', body: 'Combine the two fixes for the strongest protection.', after: fc4.worstPNeg, amount: trim });
    }
    return out;
  }
  const ASSETS = {
    cash:  { label: 'Cash savings', mu: 0.035, sd: 0.005 },
    bonds: { label: 'Bonds (UK gilts and global)', mu: 0.040, sd: 0.06 },
    equity:{ label: 'Global shares index fund', mu: 0.065, sd: 0.15 },
  };
  const BANDS = [
    null,
    { n: 1, label: 'Careful',     mix: { cash: 0.70, bonds: 0.25, equity: 0.05 }, horizon: 'under 3 years' },
    { n: 2, label: 'Cautious',    mix: { cash: 0.40, bonds: 0.40, equity: 0.20 }, horizon: '3–5 years' },
    { n: 3, label: 'Balanced',    mix: { cash: 0.15, bonds: 0.40, equity: 0.45 }, horizon: '5–10 years' },
    { n: 4, label: 'Growth',      mix: { cash: 0.05, bonds: 0.25, equity: 0.70 }, horizon: '10+ years' },
    { n: 5, label: 'Adventurous', mix: { cash: 0.00, bonds: 0.10, equity: 0.90 }, horizon: '15+ years' },
  ];
  const INFLATION = 0.025;
  function bandStats(band) {
    const m = BANDS[band].mix;
    const mu = m.cash * ASSETS.cash.mu + m.bonds * ASSETS.bonds.mu + m.equity * ASSETS.equity.mu;
    const ve = m.equity * ASSETS.equity.sd, vb = m.bonds * ASSETS.bonds.sd, vc = m.cash * ASSETS.cash.sd;
    const sd = Math.sqrt(ve * ve + vb * vb + vc * vc + 2 * 0.2 * ve * vb);
    return { mu, sd };
  }
  function riskProfile(p, sc) {
    const s = sc.summary;
    const goal = (p.goals || [])[0];
    const years = goal ? Math.max(0.5, goal.year - todayUTC().getUTCFullYear()) : 5;
    let capacity = years < 3 ? 1 : years < 5 ? 2 : years < 10 ? 3 : years < 15 ? 4 : 5;
    const reasons = [`Goal is ${years} years away`];
    if (sc.bufferMonths < 3) { capacity -= 1; reasons.push('buffer under 3 months'); }
    if (s.cv > 0.25) { capacity -= 1; reasons.push('income varies a lot'); }
    if (p.dependants > 1) { capacity -= 1; reasons.push(`${p.dependants} dependants`); }
    capacity = Math.max(1, Math.min(5, capacity));
    const ans = p.attitude || [3, 3, 3];
    const attitude = Math.max(1, Math.min(5, Math.round(ans.reduce((a, b) => a + b, 0) / ans.length)));
    const band = Math.min(capacity, attitude);
    return { capacity, attitude, band, years, reasons, ...BANDS[band] };
  }
  function badYearLossPer1000(band) {
    const { mu, sd } = bandStats(band);
    return Math.max(0, Math.round(-1000 * (mu - 1.65 * sd)));
  }
  function wrappers(p, rp) {
    const out = [];
    const goal = (p.goals || [])[0];
    if (p.employerPension) out.push('Workplace pension first: take the full employer match. It is free money.');
    if (goal && /home|house|deposit|flat/i.test(goal.name) && (p.age || 30) < 40)
      out.push('Lifetime ISA for a first home: the government adds 25% to what you put in (up to £1,000 a year).');
    if (p.dependants > 0 && (p.goals || []).some(g => /child|daughter|son|kid|uni/i.test(g.name)))
      out.push('Junior ISA for your child: tax-free, locked until they turn 18.');
    out.push('Stocks & Shares ISA: up to £20,000 a year with no tax on growth.');
    return out;
  }
  function goalSim({ current = 0, monthly, target, years, band, paths = 2000, seed = 7 }) {
    const months = Math.max(1, Math.round(years * 12));
    const { mu, sd } = bandStats(band);
    const muR = mu - INFLATION;
    const mM = muR / 12, sM = sd / Math.sqrt(12);
    const rand = mulberry32(seed), N = normalGen(rand);
    const yearly = Array.from({ length: Math.ceil(years) + 1 }, () => []);
    let hits = 0;
    for (let i = 0; i < paths; i++) {
      let b = current;
      yearly[0].push(b);
      for (let m = 1; m <= months; m++) {
        const r = Math.exp(mM - sM * sM / 2 + sM * N()) - 1;
        b = b * (1 + r) + monthly;
        if (m % 12 === 0 || m === months) yearly[Math.ceil(m / 12)].push(b);
      }
      if (b >= target) hits++;
    }
    const pct = (arr, q) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(q * (s.length - 1))]; };
    const fan = yearly.filter(a => a.length).map((a, y) => ({ year: y, p10: pct(a, 0.1), p50: pct(a, 0.5), p90: pct(a, 0.9) }));
    return { prob: hits / paths, fan, months, mu, sd };
  }
  function contributionFor(prob, args) {
    let lo = 0, hi = Math.max(50, args.target / Math.max(1, args.years * 12) * 1.6);
    for (let it = 0; it < 18; it++) {
      const mid = (lo + hi) / 2;
      const r = goalSim({ ...args, monthly: mid, paths: 600 });
      if (r.prob >= prob) hi = mid; else lo = mid;
    }
    return Math.ceil(hi / 5) * 5;
  }
  const CATS = [
    ['Rent & housing', /rent|landlord|mortgage|letting|housing/i],
    ['Bills & utilities', /octopus|british gas|edf|eon|e\.on|energy|water|council|broadband|bt |sky|virgin|vodafone|o2|ee |three|phone|tv licen/i],
    ['Groceries', /tesco|sainsbury|asda|aldi|lidl|morrisons|co-op|coop|iceland|waitrose|m&s food/i],
    ['Transport', /tfl|bus|train|rail|uber|bolt|petrol|shell|bp |esso|parking|stagecoach|metrolink/i],
    ['Eating out', /mcdonald|kfc|greggs|nando|deliveroo|just eat|uber eats|costa|starbucks|pret|domino/i],
    ['Subscriptions', /netflix|spotify|disney|amazon prime|apple\.com|google|youtube|gym/i],
    ['Income', /salary|wages|payroll|hmrc|child benefit|universal credit|dwp|transfer from|refund/i],
    ['Debt repayments', /credit card|barclaycard|klarna|loan|clearpay|amex|capital one/i],
    ['Insurance', /insurance|aviva|admiral|direct line|axa/i],
  ];
  function categorise(desc, amount) {
    for (const [cat, re] of CATS) if (re.test(desc)) return cat;
    return amount > 0 ? 'Income' : 'Other spending';
  }
  const normMerchant = d => d.toLowerCase().replace(/[0-9#*]+/g, '').replace(/\s+/g, ' ').trim().split(' ').slice(0, 3).join(' ');
  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const head = lines[0].toLowerCase().split(',').map(h => h.trim());
    const di = head.findIndex(h => h.includes('date'));
    const ti = head.findIndex(h => h.includes('desc') || h.includes('merchant') || h.includes('narrative'));
    const ai = head.findIndex(h => h.includes('amount') || h.includes('value'));
    if (di < 0 || ti < 0 || ai < 0) throw new Error('CSV needs Date, Description and Amount columns');
    const seen = new Set(), tx = [];
    for (const line of lines.slice(1)) {
      const c = line.split(',');
      if (c.length < 3) continue;
      const date = c[di].trim(), desc = c[ti].trim(), amount = parseFloat(c[ai]);
      if (!date || isNaN(amount)) continue;
      const key = `${date}|${amount}|${desc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tx.push({ date, desc, amount, merchant: normMerchant(desc), category: categorise(desc, amount) });
    }
    return tx;
  }
  function detectRecurring(tx) {
    const groups = {};
    for (const t of tx) (groups[t.merchant + (t.amount > 0 ? '+' : '-')] ||= []).push(t);
    const out = [];
    for (const g of Object.values(groups)) {
      if (g.length < 3) continue;
      g.sort((a, b) => a.date.localeCompare(b.date));
      const gaps = g.slice(1).map((t, i) => Math.round((Date.parse(t.date) - Date.parse(g[i].date)) / DAY));
      const gap = gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
      const amts = g.map(t => Math.abs(t.amount));
      const mean = amts.reduce((a, b) => a + b, 0) / amts.length;
      const sd = Math.sqrt(amts.reduce((a, b) => a + (b - mean) ** 2, 0) / amts.length);
      let interval = null;
      if (gap >= 6 && gap <= 8) interval = 'weekly';
      else if (gap >= 13 && gap <= 15) interval = 'fortnightly';
      else if (gap >= 27 && gap <= 28) interval = '4-weekly';
      else if (gap >= 28 && gap <= 31) interval = 'monthly';
      if (!interval) continue;
      const amountsStable = sd / mean <= 0.15;
      const income = g[0].amount > 0;
      if (!amountsStable && !income) continue;
      const last = g[g.length - 1];
      out.push({ label: g[0].desc, category: g[0].category, interval, amount: Math.round(mean), cv: +(sd / mean).toFixed(2),
        income, count: g.length, lastDate: last.date, day: Number(last.date.slice(8, 10)), weekday: new Date(last.date).getUTCDay(),
        gap });
    }
    return out.sort((a, b) => b.amount - a.amount);
  }
  function profileFromStatement(tx, base) {
    const rec = detectRecurring(tx);
    const first = tx.reduce((a, t) => t.date < a ? t.date : a, tx[0].date);
    const last = tx.reduce((a, t) => t.date > a ? t.date : a, tx[0].date);
    const weeks = Math.max(1, (Date.parse(last) - Date.parse(first)) / DAY / 7);
    const recKeys = new Set(rec.map(r => normMerchant(r.label)));
    const flexible = tx.filter(t => t.amount < 0 && !recKeys.has(t.merchant)).reduce((a, t) => a - t.amount, 0) / weeks;
    const sched = r => r.interval === 'weekly' ? { type: 'weekly', weekday: r.weekday }
      : r.interval === 'fortnightly' ? { type: 'every', days: 14, anchor: r.lastDate }
      : r.interval === '4-weekly' ? { type: 'every', days: 28, anchor: r.lastDate }
      : { type: 'monthly', day: r.day };
    const p = JSON.parse(JSON.stringify(base));
    p.income = rec.filter(r => r.income).map(r => ({ label: r.label, amount: r.amount, cv: Math.max(0.02, r.cv), schedule: sched(r), variable: r.cv > 0.08 }));
    p.bills = rec.filter(r => !r.income && r.category !== 'Debt repayments').map(r => ({ label: r.label, amount: r.amount, schedule: sched(r), tag: /rent|mortgage/i.test(r.label) ? 'rent' : /energy|gas|octopus|edf/i.test(r.label) ? 'energy' : 'bill' }));
    p.varWeekly = Math.round(flexible);
    p.balance = Math.round(tx.reduce((a, t) => a + t.amount, base.openingBalance || 0));
    return { profile: p, recurring: rec, weeks: Math.round(weeks) };
  }
  return { forecast, suggestFixes, score, RUNGS, riskProfile, BANDS, ASSETS, INFLATION, bandStats, badYearLossPer1000, wrappers,
    goalSim, contributionFor, parseCSV, detectRecurring, profileFromStatement, categorise, summarise,
    todayUTC, addDays, iso, fmtDate, MONTHS, mulberry32, normalGen, isDue };
})();
