import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth/auth";
import { assertRuntimeEnv } from "@/server/env";

const handler = toNextJsHandler(auth);

function privateResponse(response: Response) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function GET(request: Request) {
  assertRuntimeEnv();
  return privateResponse(await handler.GET(request));
}

export async function POST(request: Request) {
  assertRuntimeEnv();
  return privateResponse(await handler.POST(request));
}
