import { describe, expect, it } from "vitest"
import { queryKeys } from "@/lib/query/keys"

describe("queryKeys", () => {
  it("creates stable novel list keys", () => {
    expect(queryKeys.novels.list({ page: 1, size: 20 })).toEqual([
      "novels",
      "list",
      { page: 1, size: 20 },
    ])
  })

  it("includes route params in detail keys", () => {
    expect(queryKeys.novels.detailBySlug("my-slug")).toEqual(["novels", "detail", { slug: "my-slug" }])
  })

  it("includes admin params in user list keys", () => {
    expect(queryKeys.admin.users({ page: 2, search: "vip" })).toEqual([
      "admin",
      "users",
      { page: 2, search: "vip" },
    ])
  })
})
