import { cn } from "@/lib/utils"

interface OptionCardProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  )
}
