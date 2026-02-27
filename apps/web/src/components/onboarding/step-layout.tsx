import { Button } from "@/components/ui/button"

interface StepLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  showBack?: boolean
  nextDisabled?: boolean
}

export function StepLayout({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = "Neste",
  showBack = true,
  nextDisabled = false,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
      <div className="flex gap-3">
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack}>
            Tilbake
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
