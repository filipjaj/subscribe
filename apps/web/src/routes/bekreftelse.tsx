import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/bekreftelse")({
  component: Confirmation,
})

function Confirmation() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Profilen din er klar!</CardTitle>
          <CardDescription>
            Vi jobber med å finne de beste produktene for deg.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Badge variant="secondary">
            Du blir varslet når produktene er klare
          </Badge>
          <Button variant="outline" render={<Link to="/" />}>
            Tilbake til forsiden
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
