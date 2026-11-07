import type { Lang } from "./coach";

const D = {
  portfolio: { en: "Portfolio", hi: "पोर्टफोलियो", pl: "Portfel" },
  time: { en: "Time travel", hi: "टाइम ट्रैवल", pl: "Podróż w czasie" },
  goals: { en: "Goals", hi: "लक्ष्य", pl: "Cele" },
  plan: { en: "Plan", hi: "योजना", pl: "Plan" },
  briefing: { en: "Briefing", hi: "समाचार", pl: "Wiadomości" },
  help: { en: "Help", hi: "सहायता", pl: "Pomoc" },
  settings: { en: "Settings", hi: "सेटिंग्स", pl: "Ustawienia" },
  talk: { en: "Talk to PointUs", hi: "PointUs से बात करें", pl: "Porozmawiaj z PointUs" },
  why: { en: "Why?", hi: "क्यों?", pl: "Dlaczego?" },
  listen: { en: "Read aloud", hi: "सुनें", pl: "Przeczytaj" },
  score: { en: "Resilience Score", hi: "मज़बूती स्कोर", pl: "Wynik odporności" },
  next: { en: "Next action", hi: "अगला कदम", pl: "Następny krok" },
  logout: { en: "Log out", hi: "लॉग आउट", pl: "Wyloguj" },
} as const;

export type TKey = keyof typeof D;
export const t = (k: TKey, l: Lang) => D[k][l];
export const VOICE: Record<Lang, string> = { en: "en-GB", hi: "hi-IN", pl: "pl-PL" };
