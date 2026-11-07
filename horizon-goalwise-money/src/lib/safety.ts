export const CRISIS = /(can'?t|cannot)\s+pay\s+(my\s+)?rent|evict|bailiff|can'?t\s+cope|cannot\s+cope|suicid|kill myself|end it all/i;
export const BANNED = /guarantee|risk[- ]free|\bbuy\s+(shares\s+in\s+)?[A-Z]{2,5}\b|take (out )?a (new )?(loan|credit card)|payday loan|sure thing/i;
export const SAFE_FALLBACK =
  "I can help with that, but I want to be careful. Your safest next step is the action on your dashboard. This is guidance, not regulated advice.";
export const SUPPORT_LINKS =
  "\n\nYou're not alone. Free help: StepChange (stepchange.org, 0800 138 1111), Citizens Advice (citizensadvice.org.uk), or call your bank's hardship team. If you're struggling to cope, Samaritans are there 24/7 on 116 123.";
