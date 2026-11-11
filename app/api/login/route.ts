// POST /api/login (Next.js) -> POST {API}/login (Laravel), then sets the httpOnly token cookie.
import { forwardCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  return forwardCredentials(request, "/login");
}
