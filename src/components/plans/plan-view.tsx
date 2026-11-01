import type { Plan } from "@/lib/plans/plan-schema";
import { PLAN_HONESTY_EN, PLAN_HONESTY_HI, PLAN_PRICE_RANGE } from "@/lib/plans/plan-copy";

/**
 * The one template every freelance plan page is rendered through (docs/specs/freelance-plan-pages.md).
 * UI only: it gets a validated Plan and prints it. Every stored string is a React text node, so it is
 * escaped. The honesty strip and the price range come from plan-copy.ts, never from the plan.
 */
export function PlanView({ plan }: { plan: Plan }) {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32">
      <article className="mx-auto" style={{ maxWidth: "48rem", padding: "0 var(--gutter)" }}>
        <p
          role="note"
          className="mb-10 rounded-xl border border-[var(--color-accent-400)]/40 bg-[var(--color-surface-2)] px-5 py-4 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-accent-400)]"
        >
          <span className="block">{PLAN_HONESTY_HI}</span>
          <span className="block text-[var(--color-fg-1)]">{PLAN_HONESTY_EN}</span>
        </p>

        <header className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-2)]">
            Prepared for {plan.prepared_for}
          </p>
          <h1
            className="font-display font-bold text-[var(--color-fg-0)] [overflow-wrap:anywhere]"
            style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
          >
            {plan.title}
          </h1>
          <p className="mt-5 text-[var(--color-fg-1)] [overflow-wrap:anywhere]" style={{ fontSize: "var(--text-lg)" }}>
            {plan.summary}
          </p>
        </header>

        <div className="space-y-10">
          {plan.sections.map((section, i) => (
            <section key={i}>
              <h2
                className="mb-4 font-display font-semibold text-[var(--color-fg-0)] [overflow-wrap:anywhere]"
                style={{ fontSize: "var(--text-2xl)" }}
              >
                {section.heading}
              </h2>
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="mb-3 text-[var(--color-fg-1)] [overflow-wrap:anywhere]">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-6 text-[var(--color-fg-1)] marker:text-[var(--color-accent-400)]">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="[overflow-wrap:anywhere]">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-[var(--color-surface-3)] pt-6 text-[var(--color-fg-1)]">
          <p>
            Price range for work like this: <strong className="text-[var(--color-fg-0)]">{PLAN_PRICE_RANGE}</strong>
          </p>
        </footer>
      </article>
    </section>
  );
}
