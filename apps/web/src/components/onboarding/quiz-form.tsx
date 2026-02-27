import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { ProgressBar } from "./progress-bar"
import { OptionCard } from "./option-card"
import { StepLayout } from "./step-layout"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  SKIN_TYPES,
  HAIR_TYPES,
  CONCERNS,
  CATEGORIES,
} from "@/lib/schema"
import { api } from "@/lib/api"

const TOTAL_STEPS = 5

const stepSchemas = [
  z.object({ skinType: z.string().min(1, { error: "Velg en hudtype" }) }),
  z.object({ hairType: z.string().min(1, { error: "Velg en hårtype" }) }),
  z.object({
    concerns: z.array(z.string()).min(1, { error: "Velg minst én bekymring" }),
  }),
  z.object({
    categories: z
      .array(z.string())
      .min(1, { error: "Velg minst én kategori" }),
  }),
  z.object({ email: z.email({ error: "Ugyldig e-postadresse" }) }),
]

export function QuizForm() {
  const [step, setStep] = React.useState(0)
  const [submitted, setSubmitted] = React.useState(false)

  const form = useForm({
    defaultValues: {
      skinType: "",
      hairType: "",
      concerns: [] as string[],
      categories: [] as string[],
      email: "",
    },
    onSubmit: async ({ value }) => {
      await api("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      })
      setSubmitted(true)
    },
  })

  function validateAndNext() {
    const values = form.state.values
    const schema = stepSchemas[step]
    const result = schema.safeParse(values)
    if (result.success) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Sjekk innboksen din</h2>
        <p className="text-muted-foreground max-w-md">
          Vi har sendt en innloggingslenke til{" "}
          <span className="text-foreground font-medium">
            {form.state.values.email}
          </span>
          . Klikk på lenken for å fullføre registreringen.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
      <div className="mt-8">
        {step === 0 && (
          <form.Field
            name="skinType"
            children={(field) => (
              <StepLayout
                title="Hva er hudtypen din?"
                description="Velg det alternativet som passer best."
                onNext={validateAndNext}
                showBack={false}
                nextDisabled={!field.state.value}
              >
                {SKIN_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={field.state.value === opt.value}
                    onClick={() => field.handleChange(opt.value)}
                  />
                ))}
              </StepLayout>
            )}
          />
        )}

        {step === 1 && (
          <form.Field
            name="hairType"
            children={(field) => (
              <StepLayout
                title="Hva er hårtypen din?"
                description="Velg det alternativet som passer best."
                onNext={validateAndNext}
                onBack={() => setStep(0)}
                nextDisabled={!field.state.value}
              >
                {HAIR_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={field.state.value === opt.value}
                    onClick={() => field.handleChange(opt.value)}
                  />
                ))}
              </StepLayout>
            )}
          />
        )}

        {step === 2 && (
          <form.Field
            name="concerns"
            children={(field) => (
              <StepLayout
                title="Dine bekymringer"
                description="Velg alle som gjelder for deg."
                onNext={validateAndNext}
                onBack={() => setStep(1)}
                nextDisabled={field.state.value.length === 0}
              >
                <div className="grid grid-cols-2 gap-3">
                  {CONCERNS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={field.state.value.includes(opt.value)}
                      onClick={() => {
                        const current = field.state.value
                        field.handleChange(
                          current.includes(opt.value)
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value]
                        )
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}
          />
        )}

        {step === 3 && (
          <form.Field
            name="categories"
            children={(field) => (
              <StepLayout
                title="Hva er du interessert i?"
                description="Velg kategoriene du vil utforske."
                onNext={validateAndNext}
                onBack={() => setStep(2)}
                nextDisabled={field.state.value.length === 0}
              >
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      selected={field.state.value.includes(opt.value)}
                      onClick={() => {
                        const current = field.state.value
                        field.handleChange(
                          current.includes(opt.value)
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value]
                        )
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}
          />
        )}

        {step === 4 && (
          <form.Field
            name="email"
            children={(field) => (
              <StepLayout
                title="Opprett konto"
                description="Skriv inn e-posten din, så sender vi deg en innloggingslenke."
                onNext={() => form.handleSubmit()}
                onBack={() => setStep(3)}
                nextLabel="Opprett konto"
                nextDisabled={!field.state.value || form.state.isSubmitting}
              >
                <Field>
                  <FieldLabel htmlFor="email">E-post</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Field>
              </StepLayout>
            )}
          />
        )}
      </div>
    </div>
  )
}
