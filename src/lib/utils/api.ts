import { NextResponse } from "next/server";
import { getAppInfo } from "@/lib/config/app";

type PlaceholderResponseOptions = {
  message: string;
  status?: number;
  data?: unknown;
};

/** Creates a consistent JSON envelope for placeholder API route handlers. */
export function placeholderResponse({
  message,
  status = 200,
  data,
}: PlaceholderResponseOptions) {
  return NextResponse.json(
    {
      ok: status < 400,
      app: getAppInfo(),
      message,
      data,
    },
    { status },
  );
}
