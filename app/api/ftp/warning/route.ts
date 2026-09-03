import { handleFtpQuery } from "../route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleFtpQuery(request, "warning");
}
