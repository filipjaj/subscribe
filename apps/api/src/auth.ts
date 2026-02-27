import { Hono } from "hono"
import { setCookie } from "hono/cookie"

type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
  MAGIC_LINK_BASE_URL: string
}

const auth = new Hono<{ Bindings: Bindings }>()

function generateId(): string {
  return crypto.randomUUID()
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

auth.post("/magic-link", async (c) => {
  const { email, skinType, hairType, concerns, categories } = await c.req.json()

  if (!email) {
    return c.json({ error: "E-post er påkrevd" }, 400)
  }

  // Create or find user
  let user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>()

  if (!user) {
    const userId = generateId()
    await c.env.DB.prepare("INSERT INTO users (id, email) VALUES (?, ?)")
      .bind(userId, email)
      .run()
    user = { id: userId }
  }

  // Save/update profile
  const existingProfile = await c.env.DB.prepare(
    "SELECT id FROM profiles WHERE user_id = ?"
  )
    .bind(user.id)
    .first()

  if (existingProfile) {
    await c.env.DB.prepare(
      "UPDATE profiles SET skin_type = ?, hair_type = ?, concerns = ?, categories = ?, updated_at = datetime('now') WHERE user_id = ?"
    )
      .bind(
        skinType,
        hairType,
        JSON.stringify(concerns),
        JSON.stringify(categories),
        user.id
      )
      .run()
  } else {
    await c.env.DB.prepare(
      "INSERT INTO profiles (id, user_id, skin_type, hair_type, concerns, categories) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(
        generateId(),
        user.id,
        skinType,
        hairType,
        JSON.stringify(concerns),
        JSON.stringify(categories)
      )
      .run()
  }

  // Create magic link token
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await c.env.DB.prepare(
    "INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)"
  )
    .bind(token, email, expiresAt)
    .run()

  // Send email via Resend
  const magicLinkUrl = `${c.env.MAGIC_LINK_BASE_URL}/api/auth/verify?token=${token}`

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Subscribe <noreply@subscribe.no>",
      to: [email],
      subject: "Logg inn på Subscribe",
      html: `<p>Hei!</p><p>Klikk <a href="${magicLinkUrl}">her for å logge inn</a>.</p><p>Lenken utløper om 15 minutter.</p>`,
    }),
  })

  return c.json({ ok: true })
})

auth.get("/verify", async (c) => {
  const token = c.req.query("token")

  if (!token) {
    return c.json({ error: "Token mangler" }, 400)
  }

  const link = await c.env.DB.prepare(
    "SELECT email, expires_at, used FROM magic_links WHERE token = ?"
  )
    .bind(token)
    .first<{ email: string; expires_at: string; used: number }>()

  if (!link) {
    return c.json({ error: "Ugyldig lenke" }, 400)
  }

  if (link.used) {
    return c.json({ error: "Lenken er allerede brukt" }, 400)
  }

  if (new Date(link.expires_at) < new Date()) {
    return c.json({ error: "Lenken har utløpt" }, 400)
  }

  // Mark as used
  await c.env.DB.prepare("UPDATE magic_links SET used = 1 WHERE token = ?")
    .bind(token)
    .run()

  // Get user
  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(link.email)
    .first<{ id: string }>()

  if (!user) {
    return c.json({ error: "Bruker ikke funnet" }, 400)
  }

  // Set session cookie
  const sessionToken = generateToken()
  setCookie(c, "session", `${user.id}:${sessionToken}`, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  // Redirect to confirmation page
  return c.redirect(`${c.env.MAGIC_LINK_BASE_URL}/bekreftelse`)
})

export { auth }
