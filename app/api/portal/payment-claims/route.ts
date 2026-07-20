import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitPaymentClaim } from '@/lib/portal-payment-claims';
import { PortalError, portalErrorResponse, requestId } from '@/lib/portal-security';
export async function POST(request:Request){const correlationId=requestId(request);try{const actor=await getCurrentUser();if(!actor)throw new PortalError(401,'Authentication required','UNAUTHENTICATED');return NextResponse.json(await submitPaymentClaim(await request.json(),actor,correlationId),{status:201});}catch(error){return portalErrorResponse(error,correlationId);}}
