import { slugify } from "@/lib/slugify";

/** Clerk rejects `.demo` domains — use example.com for dev operator accounts */
export const OPERATOR_EMAIL_DOMAIN = "example.com";

export function operatorEmail(businessName: string): string {
  return `${slugify(businessName)}@${OPERATOR_EMAIL_DOMAIN}`;
}

export const PRIMARY_OPERATOR_EMAIL = operatorEmail("Sahyadri Trails");

export const DEMO_OPERATOR_EMAILS = [
  operatorEmail("Sahyadri Trails"),
  operatorEmail("Konkan Wave Adventures"),
  operatorEmail("Maval Adventure Co."),
] as const;

export function legacyOperatorEmail(businessName: string): string {
  return `${slugify(businessName)}@bhraman-operators.demo`;
}
