import { createFileRoute } from "@tanstack/react-router"
import { QuizForm } from "@/components/onboarding/quiz-form"

export const Route = createFileRoute("/onboarding")({ component: Onboarding })

function Onboarding() {
  return (
    <main className="min-h-screen px-4 py-12">
      <QuizForm />
    </main>
  )
}
