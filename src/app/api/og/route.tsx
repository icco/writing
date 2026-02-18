import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") ?? "Nat Welch's Blog"
  const date = searchParams.get("date") ?? ""

  const fontData = await fetch(
    "https://fonts.gstatic.com/s/robotoslab/v34/BngMUXZYTXPIvIBgJJSb6ufN5qA.ttf"
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#eeeceb",
          padding: "40px 50px",
          fontFamily: "Roboto Slab",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://natwelch.com/i/logo.png"
          width="200"
          height="200"
          alt=""
          style={{ marginBottom: "20px" }}
        />

        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "flex-end",
            fontSize: 72,
            color: "#333",
            lineHeight: 1.2,
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        {date && (
          <div
            style={{
              fontSize: 24,
              color: "#333",
              marginTop: "20px",
            }}
          >
            {date}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Roboto Slab",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  )
}
