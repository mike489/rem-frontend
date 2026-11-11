// POST /api/register (Next.js) -> POST {API}/register (Laravel), then sets the httpOnly token cookie.
// Laravel only accepts this while there are no users (first admin account).
import { forwardCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  return forwardCredentials(request, "/register");
}
