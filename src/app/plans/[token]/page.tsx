import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plans/plan-view";
import { getPlan } from "@/lib/plans/plan-store";

// Per request, never from the CDN: an unpublish or an expiry has to show on the next visit.
// Next 16.2 route-segment-config: `force-dynamic` renders the route on every request.
// Spec: docs/specs/freelance-plan-pages.md
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

// The root layout says `index: true, follow: true`. Next 16.2 generate-metadata.md: `robots` "defined in an
// earlier segment are overwritten by the last segment to define them", so this replaces it. It needs no
// database read: every /plans/* page is noindex, found or not.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  return {
    title: "Plan",
    robots: { index: false, follow: false },
  };
}

export default async function PlanPage({ params }: Props) {
  const { token } = await params;
  const plan = await getPlan(token);
  if (!plan) notFound();
  return <PlanView plan={plan} />;
}
