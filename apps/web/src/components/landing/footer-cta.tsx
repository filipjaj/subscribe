import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function FooterCta() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-16 text-center sm:py-24">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Klar til å komme i gang?
      </h2>
      <p className="text-muted-foreground max-w-md">
        Opprett profilen din på under ett minutt, og finn produktene som passer
        for deg.
      </p>
      <Button size="lg" render={<Link to="/onboarding" />}>
        Kom i gang
      </Button>
    </section>
  )
}
