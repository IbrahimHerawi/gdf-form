export type LeadInput = {
  fullName: string;
  email: string;
  company: string;
  phone: string;
};

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[0-9\s\-().]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

export function validateLead(raw: Record<string, unknown>): {
  data: LeadInput | null;
  errors: FieldErrors;
} {
  const data: LeadInput = {
    fullName: clean(raw.fullName, 120),
    email: clean(raw.email, 160).toLowerCase(),
    company: clean(raw.company, 160),
    phone: clean(raw.phone, 30),
  };

  const errors: FieldErrors = {};

  if (data.fullName.length < 2) errors.fullName = "Please enter your full name.";

  if (!data.email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.company) errors.company = "Please enter your company name.";

  const digits = data.phone.replace(/\D/g, "").length;
  if (!data.phone) errors.phone = "Please enter your phone number.";
  else if (!PHONE_CHARS_RE.test(data.phone) || digits < 7 || digits > 15)
    errors.phone = "Please enter a valid phone number.";

  return { data: Object.keys(errors).length ? null : data, errors };
}
