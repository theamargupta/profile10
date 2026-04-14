"use client";

import { useRef } from "react";
import { GlowCard } from "@/components/ui/glow-card";
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
    <section ref={ref} className="py-[15vh]">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading label="What I Do" title="Services" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon ?? "code"];
            return (
              <div key={service.id} data-service-card>
                <GlowCard className="h-full">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </GlowCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
