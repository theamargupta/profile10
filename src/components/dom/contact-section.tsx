"use client";

import { useRef, useState, type FormEvent } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ContactSection({ email }: { email: string }) {
  const ref = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useGSAP(
    () => {
      gsap.from("[data-contact-form]", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      });
    },
    { scope: ref }
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 px-4 py-3 text-[var(--color-fg-0)] placeholder:text-[var(--color-fg-3)] focus:border-[var(--color-accent-400)] focus:outline-none transition-colors";

  return (
    <section id="contact" ref={ref} className="py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <SectionHeading label="Get in Touch" title="Start a Project" />
        <div
          data-contact-form
          className="mx-auto max-w-xl rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl md:p-10"
        >
          {status === "sent" ? (
            <div className="text-center">
              <p className="mb-2 font-display text-xl font-semibold text-[var(--color-accent-400)]">
                Message Sent!
              </p>
              <p className="text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)" }}>
                Thank you for reaching out. I&apos;ll get back to you within 24
                hours.
              </p>
              <button
                className="mt-4 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:text-[var(--color-fg-0)]"
                onClick={() => setStatus("idle")}
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClasses}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className={`${inputClasses} resize-none`}
                  placeholder="Tell me about your project..."
                />
              </div>

              {status === "error" && (
                <p aria-live="polite" className="text-sm text-[var(--color-danger)]">
                  Something went wrong. Try emailing me directly at{" "}
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                  .
                </p>
              )}

              <button
                type="submit"
                data-cursor="magnet"
                disabled={status === "sending"}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[var(--color-accent-400)] font-medium text-[var(--color-surface-0)] transition-all duration-300 hover:bg-[var(--color-accent-300)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
