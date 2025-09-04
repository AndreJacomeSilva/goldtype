export const allowedDomains = ["@goldenergy.pt", "@basedondata.com", "@wiseout.com"] as const;

export function isAllowedDomain(email: string) {
  const e = email.toLowerCase().trim();
  return allowedDomains.some((d) => e.endsWith(d));
}
