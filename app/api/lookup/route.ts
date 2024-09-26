import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    const { username } = await req.json()

    const response = await fetch(`https://api.phantom.app/user/v1/profiles/${username}`)
    const data = await response.json()

    return NextResponse.json(data)
}
