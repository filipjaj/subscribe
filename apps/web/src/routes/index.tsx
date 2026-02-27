import { createFileRoute } from "@tanstack/react-router"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Categories } from "@/components/landing/categories"
import { SocialProof } from "@/components/landing/social-proof"
import { FooterCta } from "@/components/landing/footer-cta"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Categories />
      <SocialProof />
      <FooterCta />
    </main>
  )
}
