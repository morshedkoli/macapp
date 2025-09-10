import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.record.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting record:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    const record = await prisma.record.update({
      where: { id },
      data: {
        name: name.trim(),
        mac: mac.trim(),
        phone: phone.trim()
      }
    })

    return NextResponse.json(record)
  } catch (error: any) {
    console.error('Error updating record:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002' && error.meta?.target?.includes('mac')) {
      return NextResponse.json(
        { error: 'MAC address already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}