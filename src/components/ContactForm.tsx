"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const DEPARTMENT_OPTIONS = [
  { value: "", label: "General enquiry (no specific department)" },
  { value: "research", label: "Research" },
  { value: "editorial", label: "Editorial" },
  { value: "partnerships", label: "Partnerships & Institutional Enquiries" },
  { value: "events", label: "Events" },
  { value: "general", label: "General" },
];

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      organisation: data.get("organisation") || undefined,
      department: data.get("department") || undefined,
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-line bg-white p-6">
        <p className="font-serif text-lg text-navy">Message received.</p>
        <p className="mt-2 text-sm text-slate">
          Thank you for getting in touch. We will respond as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-medium text-navy">
          Name
          <input
            name="name"
            type="text"
            required
            className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] font-normal text-navy-ink outline-none focus:border-green"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium text-navy">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] font-normal text-navy-ink outline-none focus:border-green"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-medium text-navy">
          Organisation
          <input
            name="organisation"
            type="text"
            className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] font-normal text-navy-ink outline-none focus:border-green"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium text-navy">
          Department (optional)
          <select
            name="department"
            defaultValue=""
            className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
          >
            {DEPARTMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-[13px] font-medium text-navy">
        Message
        <textarea
          name="message"
          rows={5}
          required
          className="rounded-sm border border-line bg-white px-3.5 py-2.5 text-[15px] text-navy-ink outline-none focus:border-green"
        />
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit rounded-sm bg-green px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-green-deep disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-700">
          Something went wrong sending your message. Please try again, or use
          one of the department emails above.
        </p>
      )}
    </form>
  );
}
