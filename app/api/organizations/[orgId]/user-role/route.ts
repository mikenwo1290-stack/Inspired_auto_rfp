import { NextRequest, NextResponse } from 'next/server'

import { organizationService } from '@/lib/organization-service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params

    const currentUser = await organizationService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    const role = await organizationService.getUserOrganizationRole(
      currentUser.id,
      orgId
    )

    return NextResponse.json({
      success: true,
      role
    })
  } catch (error) {
    console.error('Failed to fetch organization user role', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user role',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 