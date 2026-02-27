import { Hono } from "hono"

type Bindings = {
  DB: D1Database
}

const profiles = new Hono<{ Bindings: Bindings }>()

profiles.get("/:id", async (c) => {
  const userId = c.req.param("id")

  const profile = await c.env.DB.prepare(
    "SELECT p.*, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?"
  )
    .bind(userId)
    .first()

  if (!profile) {
    return c.json({ error: "Profil ikke funnet" }, 404)
  }

  return c.json({
    ...profile,
    concerns: JSON.parse(profile.concerns as string),
    categories: JSON.parse(profile.categories as string),
  })
})

export { profiles }
