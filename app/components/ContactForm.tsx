"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { validateLead, type FieldErrors, type LeadInput } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: LeadInput = { fullName: "", email: "", company: "", phone: "" };

const FIELDS: {
  name: keyof LeadInput;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  inputMode?: "email" | "tel" | "text";
}[] = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name", placeholder: "Jane Smith" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "jane@company.com", inputMode: "email" },
  { name: "company", label: "Company name", type: "text", autoComplete: "organization", placeholder: "Company Ltd." },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", placeholder: "+966 5X XXX XXXX", inputMode: "tel" },
];

export default function ContactForm() {
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as keyof LeadInput;
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { errors: found } = validateLead(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        setStatus("success");
        return;
      }
      if (result.errors) setErrors(result.errors);
      setStatus("error");
      setMessage(result.error ?? "Please check the highlighted fields.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
    setMessage("");
  }

  if (status === "success") {
    const firstName = values.fullName.split(" ")[0];
    return (
      <div className="success" role="status">
        <div className="success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2>Thank you, {firstName}!</h2>
        <p>We&apos;ve received your details. A member of our team will contact you soon.</p>
        <button type="button" className="btn btn-ghost" onClick={reset}>
          Submit another response
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {FIELDS.map((f) => {
        const error = errors[f.name];
        return (
          <div className={`field${error ? " has-error" : ""}`} key={f.name}>
            <label htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              value={values[f.name]}
              onChange={handleChange}
              disabled={submitting}
              required
              aria-invalid={!!error}
              aria-describedby={error ? `${f.name}-error` : undefined}
              dir={f.name === "phone" ? "ltr" : undefined}
            />
            {error && (
              <p className="field-error" id={`${f.name}-error`}>
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot field, hidden from people and assistive tech */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {status === "error" && message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending…
          </>
        ) : (
          "Submit details"
        )}
      </button>

      <p className="privacy">Your information is kept private and used only to contact you.</p>
    </form>
  );
}
