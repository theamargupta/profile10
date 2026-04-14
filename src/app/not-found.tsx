import Link from "next/link";
import { Button } from "@/components/ui/button";
import { typeClasses } from "@/lib/type-classes";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="text-center px-6">
        <p className="mb-4 font-mono text-8xl font-bold text-primary/20">404</p>
        <h1 className={`${typeClasses.h2} mb-4`}>Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/">Back Home</Link>
        </Button>
      </div>
    </section>
  );
}
