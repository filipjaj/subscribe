import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  MAGIC_LINK_BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
