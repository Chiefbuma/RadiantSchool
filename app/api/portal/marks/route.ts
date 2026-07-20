import { NextResponse } from "next/server";
import { recordMark,transitionMark } from "@/lib/portal-workflows";
import { portalErrorResponse,requestId,requireApiPermission } from "@/lib/portal-security";
export async function POST(request:Request){const correlationId=requestId(request);try{const actor=await requireApiPermission("marks.record");return NextResponse.json(await recordMark(await request.json(),actor,correlationId),{status:201});}catch(error){return portalErrorResponse(error,correlationId);}}
export async function PATCH(request:Request){const correlationId=requestId(request);try{const body=await request.json();const permission=body.action==='moderate'?"marks.moderate":body.action==='publish'?"marks.publish":"marks.record";const actor=await requireApiPermission(permission);return NextResponse.json(await transitionMark(body,actor,correlationId));}catch(error){return portalErrorResponse(error,correlationId);}}
