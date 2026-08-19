import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("admin proxy erken yönlendirmesi", () => {
  it("oturum çerezi olmayan admin isteğini girişe yönlendirir", () => {
    const response = proxy(new NextRequest("http://localhost:3000/admin/products"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login?next=%2Fadmin%2Fproducts");
  });

  it("uygulamanın özel prefix'li oturum çerezini tanır", () => {
    const request = new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: "kose-mutfak.session_token=test-token" },
    });
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("public menü isteğini değiştirmeden geçirir", () => {
    const response = proxy(new NextRequest("http://localhost:3000/menu"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
