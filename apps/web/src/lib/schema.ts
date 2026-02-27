import { z } from "zod"

export const SKIN_TYPES = [
  { value: "torr", label: "Tørr" },
  { value: "normal", label: "Normal" },
  { value: "kombinert", label: "Kombinert" },
  { value: "fet", label: "Fet" },
  { value: "sensitiv", label: "Sensitiv" },
] as const

export const HAIR_TYPES = [
  { value: "rett", label: "Rett" },
  { value: "bolgete", label: "Bølgete" },
  { value: "krollete", label: "Krøllete" },
  { value: "afro", label: "Afro" },
  { value: "tynt", label: "Tynt" },
  { value: "tykt", label: "Tykt" },
] as const

export const CONCERNS = [
  { value: "akne", label: "Akne" },
  { value: "torr-hud", label: "Tørr hud" },
  { value: "rynker", label: "Rynker" },
  { value: "pigmentering", label: "Pigmentering" },
  { value: "frizz", label: "Frizz" },
  { value: "tort-har", label: "Tørt hår" },
  { value: "fett-har", label: "Fett hår" },
  { value: "sensitiv-hodebunn", label: "Sensitiv hodebunn" },
] as const

export const CATEGORIES = [
  { value: "hudpleie", label: "Hudpleie" },
  { value: "harpleie", label: "Hårpleie" },
  { value: "sminke", label: "Sminke" },
  { value: "apotek", label: "Apotek & helse" },
  { value: "parfyme", label: "Parfyme" },
] as const

export const profileSchema = z.object({
  skinType: z.enum(["torr", "normal", "kombinert", "fet", "sensitiv"], {
    error: "Velg en hudtype",
  }),
  hairType: z.enum(["rett", "bolgete", "krollete", "afro", "tynt", "tykt"], {
    error: "Velg en hårtype",
  }),
  concerns: z.array(z.string()).min(1, { error: "Velg minst én bekymring" }),
  categories: z.array(z.string()).min(1, { error: "Velg minst én kategori" }),
  email: z.email({ error: "Ugyldig e-postadresse" }),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
