import { Card, CardHeader, CardTitle } from "@/components/ui/card"

const categories = [
  { title: "Hudpleie", emoji: "\u2728" },
  { title: "Hårpleie", emoji: "\uD83D\uDC87" },
  { title: "Sminke", emoji: "\uD83D\uDC84" },
  { title: "Apotek", emoji: "\uD83D\uDC8A" },
]

export function Categories() {
  return (
    <section className="px-4 py-16 sm:py-24">
      <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
        Kategorier
      </h2>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((cat) => (
          <Card key={cat.title} className="items-center text-center">
            <CardHeader className="items-center">
              <span className="text-4xl">{cat.emoji}</span>
              <CardTitle>{cat.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
