import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const records = await prisma.record.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, mac, phone } = await request.json()

    // Validation
    if (!name || !mac || !phone) {
      return NextResponse.json(
        { error: 'Name, MAC address, and phone number are required' },
        { status: 400 }
      )
    }

    // Validate MAC address format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    if (!macRegex.test(mac)) {
      return NextResponse.json(
        { error: 'Invalid MAC address format' },
        { status: 400 }
      )
    }

    // Validate phone number
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const record = await prisma.record.create({
      data: {
        name: name.trim(),
        mac: mac.trim(),
        phone: phone.trim()
      }
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    console.error('Error creating record:', error)
    
    // Handle unique constraint violation for MAC address
    if (error.code === 'P2002' && error.meta?.target?.includes('mac')) {
      return NextResponse.json(
        { error: 'MAC address already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}