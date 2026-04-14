"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface AboutBriefProps {
  bioShort: string;
  howIWork: string;
}

export function AboutBrief({ bioShort, howIWork }: AboutBriefProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-about-text]", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
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
        <SectionHeading label="About" title="Get to Know Me" />
        <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-2">
          <div data-about-text>
            <h3 className="mb-4 font-display text-xl font-semibold">
              Background
            </h3>
            <p className="text-muted-foreground leading-relaxed">{bioShort}</p>
          </div>
          <div data-about-text>
            <h3 className="mb-4 font-display text-xl font-semibold">
              How I Work
            </h3>
            <p className="text-muted-foreground leading-relaxed">{howIWork}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
