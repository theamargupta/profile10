"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Service } from "@/lib/types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  HiOutlineServerStack,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
  HiOutlineCubeTransparent,
  HiOutlineCodeBracket,
  HiOutlineLightBulb,
} from "react-icons/hi2";

gsap.registerPlugin(ScrollTrigger);

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  server: HiOutlineServerStack,
  bot: HiOutlineChatBubbleLeftRight,
  workflow: HiOutlineCog6Tooth,
  architecture: HiOutlineCubeTransparent,
  code: HiOutlineCodeBracket,
  consulting: HiOutlineLightBulb,
};

export function ServicesGrid({ services }: { services: Service[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-service-card]", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="py-28 md:py-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <SectionHeading label="What I Do" title="Services" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon ?? "code"];
            return (
              <div key={service.id} data-service-card>
                <div className="group h-full rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl transition-all duration-500 hover:border-[var(--color-accent-400)]/60">
                  {/* Hover gradient */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: "radial-gradient(40% 60% at 0% 0%, rgba(168,245,0,0.08) 0%, rgba(5,5,7,0) 60%)",
                    }}
                  />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-[var(--color-primary-500)]/10 p-3">
                      {Icon && <Icon className="h-6 w-6 text-[var(--color-primary-400)]" />}
                    </div>
                    <h3
                      className="mb-2 font-display font-semibold text-[var(--color-fg-0)]"
                      style={{ fontSize: "var(--text-lg)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-[var(--color-fg-1)]"
                      style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
