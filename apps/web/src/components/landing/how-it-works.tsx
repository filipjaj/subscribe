export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Fortell oss om deg",
      description:
        "Svar på noen enkle spørsmål om huden, håret og preferansene dine.",
    },
    {
      number: "2",
      title: "Velg produktene dine",
      description:
        "Bla gjennom produkter fra Apotek1, Vita, Kicks og flere.",
    },
    {
      number: "3",
      title: "Vi leverer",
      description:
        "Velg hvor ofte du vil ha påfyll — annenhver uke, månedlig eller sjeldnere.",
    },
  ]

  return (
    <section className="px-4 py-16 sm:py-24">
      <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
        Slik fungerer det
      </h2>
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-lg font-bold">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
