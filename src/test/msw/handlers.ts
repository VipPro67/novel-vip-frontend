import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("http://localhost:8081/health", () => {
    return HttpResponse.json({ ok: true })
  }),
]
