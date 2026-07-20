import { NextResponse } from "next/server";
import { recordPayment } from "@/lib/portal-workflows";
import { portalErrorResponse,requestId,requireApiPermission } from "@/lib/portal-security";
export async function POST(request:Request){const correlationId=requestId(request);try{const actor=await requireApiPermission("payments.record");const body=await request.json();body.idempotencyKey=request.headers.get("idempotency-key");return NextResponse.json(await recordPayment(body,actor,correlationId),{status:201,headers:{"x-request-id":correlationId}});}catch(error){return portalErrorResponse(error,correlationId);}}
