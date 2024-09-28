import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        // Get title from query params
        // const title = searchParams.get('title') ?? 'Default Title'
        const days = searchParams.get('days') ?? null;
        if (days) {
            var title = `Your Solana Wallet is \n ${days} days old!`
        } else {
            var title = `Solana Wallet Age Calculator `
        }
        return new ImageResponse(
            (
                <div
                    style={{
                        backgroundColor: 'black',
                        backgroundSize: '150px 150px',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                    }}
                >
                    <div
                        style={{
                            fontSize: "5em",
                            fontStyle: 'normal',
                            letterSpacing: '-0.025em',
                            color: 'white',
                            marginTop: 30,
                            padding: '0 120px',
                            lineHeight: 1.4,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {title}
                    </div><div style={{ fontSize: "2em", color: "white", padding: "50px" }}> 🎂 https://solage.vercel.app 🎂</div>
                </div>
            ),
            {
                width: 1000,
                height: 1000,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}