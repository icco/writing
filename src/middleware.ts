import { NextRequest, NextResponse } from "next/server"
import winston from "winston"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  const logger = winston.createLogger({
    level: "info",
    transports: [new winston.transports.Stream({ stream: process.stdout })],
  })
  logger.info(`Request: ${pathname}`)

  return response
}
