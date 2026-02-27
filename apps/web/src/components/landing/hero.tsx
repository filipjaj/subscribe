import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Dine favoritter, levert når du trenger dem
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
        Abonner på skjønnhets- og apotekproduktene du elsker. Vi leverer dem
        hjem til deg, akkurat når du trenger påfyll.
      </p>
      <Button size="lg" render={<Link to="/onboarding" />}>
        Kom i gang
      </Button>
    </section>
  )
}
