import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gednaktbdutcbnelgylx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)
import { NextRequest, NextResponse } from 'next/server'

// Add this line to get the API key from environment variables
const API_KEY = process.env.API_KEY!

export async function POST(request: NextRequest) {
    // Add this block to check for the API key
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, days, transactions, duration } = await request.json()

    if (!request.body) {
        return NextResponse.json({ error: 'No body provided.' }, { status: 400 })
    }

    if (!address || !days) {
        return NextResponse.json({ error: 'Wallet address, transactions and days are required.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('solage')
        .insert([
            {
                address,
                days,
                transactions,
                duration
            }
        ])

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Data stored successfully' }, { status: 200 })
}
