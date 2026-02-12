import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/errors";

type RouteHandler<T = unknown> = (req: Request, context: T) => Promise<Response>;

export const withRoute = <T>(handler: RouteHandler<T>, tag: string) => {
  return async (req: Request, context: T) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      console.error(`[${tag}]`, error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };
};
