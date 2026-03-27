import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { calculateTransaction } from '@/lib/calculations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createAdminClient()
  const body = await req.json()

  // If changing service/barber/method/tip, recalculate
  if (body.service_id || body.barber_id || body.payment_method !== undefined) {
    const { data: existing } = await db
      .from('transactions')
      .select('*, barber:barbers(*), service:services(*)')
      .eq('id', params.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const svcId = body.service_id || existing.service_id
    const barId = body.barber_id || existing.barber_id
    const method = body.payment_method ?? existing.payment_method
    const tip = body.tip_amount ?? existing.tip_amount

    const [svcRes, barberRes] = await Promise.all([
      db.from('services').select('*').eq('id', svcId).single(),
      db.from('barbers').select('*').eq('id', barId).single(),
    ])

    const calc = calculateTransaction(svcRes.data!, barberRes.data!, method, tip)

    const { data, error } = await db
      .from('transactions')
      .update({ service_id: svcId, barber_id: barId, payment_method: method, ...calc })
      .eq('id', params.id)
      .select('*, barber:barbers(*), service:services(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await db
    .from('transactions')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createAdminClient()
  const { error } = await db.from('transactions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
