const COMMON = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com", "hotmail.co.uk", "yahoo.co.uk", "btinternet.com", "aol.com", "protonmail.com", "googlemail.com"];
const KNOWN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmail.co": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com", "outllok.com": "outlook.com", "outlook.co": "outlook.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "icloud.co": "icloud.com",
};
export const DISPOSABLE = ["mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com", "temp-mail.org", "yopmail.com", "sharklasers.com", "trashmail.com"];

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const local = email.slice(0, at);
  const dom = email.slice(at + 1).toLowerCase().trim();
  if (!dom || COMMON.includes(dom)) return null;
  if (KNOWN_TYPOS[dom]) return `${local}@${KNOWN_TYPOS[dom]}`;
  let best: string | null = null, bestD = 3;
  for (const c of COMMON) { const dd = lev(dom, c); if (dd < bestD) { bestD = dd; best = c; } }
  return best && bestD <= 2 ? `${local}@${best}` : null;
}

export function isDisposable(email: string) {
  const dom = email.split("@")[1]?.toLowerCase().trim() ?? "";
  return DISPOSABLE.some((d) => dom === d || dom.endsWith("." + d));
}

export function passwordStrength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(4, s);
  return { score, label: ["Too weak", "Weak", "Okay", "Good", "Strong"][score] };
}
