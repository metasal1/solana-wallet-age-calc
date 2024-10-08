import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gednaktbdutcbnelgylx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// export const maxDuration = 300;

export async function GET(request: NextRequest) {

    const { count, error } = await supabase
        .from('solage')
        .select('*', { count: 'exact', head: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ total: count }, { status: 200 })
}
