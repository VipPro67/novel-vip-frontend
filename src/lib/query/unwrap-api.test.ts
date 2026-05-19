import { describe, expect, it } from "vitest"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

describe("unwrapApiResponse", () => {
  it("returns data for successful responses", () => {
    expect(
      unwrapApiResponse({
        success: true,
        message: "",
        data: { id: "1" },
        statusCode: 200,
      }),
    ).toEqual({ id: "1" })
  })

  it("throws for unsuccessful responses", () => {
    expect(() =>
      unwrapApiResponse({
        success: false,
        message: "Request failed",
        data: null,
        statusCode: 400,
      }),
    ).toThrow("Request failed")
  })
})
