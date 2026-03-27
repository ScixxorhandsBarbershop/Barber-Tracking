import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { calculateTransaction } from '@/lib/calculations'
import type { TransactionInput } from '@/types'

export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const barber_id = searchParams.get('barber_id')
  const limit = parseInt(searchParams.get('limit') || '100')

  let query = db
    .from('transactions')
    .select('*, barber:barbers(id,name), service:services(id,name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (from) query = query.gte('created_at', from)
  if (to)   query = query.lte('created_at', to)
  if (barber_id) query = query.eq('barber_id', barber_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const db = createAdminClient()
  const body: TransactionInput = await req.json()

  // Fetch service and barber
  const [svcRes, barberRes] = await Promise.all([
    db.from('services').select('*').eq('id', body.service_id).single(),
    db.from('barbers').select('*').eq('id', body.barber_id).single(),
  ])

  if (svcRes.error || !svcRes.data)
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  if (barberRes.error || !barberRes.data)
    return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

  const calc = calculateTransaction(
    svcRes.data,
    barberRes.data,
    body.payment_method,
    body.tip_amount
  )

  const { data, error } = await db
    .from('transactions')
    .insert({
      barber_id: body.barber_id,
      service_id: body.service_id,
      payment_method: body.payment_method,
      notes: body.notes ?? null,
      ...calc,
    })
    .select('*, barber:barbers(*), service:services(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
