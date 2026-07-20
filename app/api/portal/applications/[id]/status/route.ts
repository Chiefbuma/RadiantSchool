import { NextResponse } from "next/server";
import { transitionApplication } from "@/lib/portal-workflows";
import { portalErrorResponse,requestId,requireApiPermission } from "@/lib/portal-security";
import { dispatchWhatsAppOutbox } from "@/lib/school-whatsapp-agent";
import { after } from "next/server";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){const correlationId=requestId(request);try{const actor=await requireApiPermission("applications.review");const body=await request.json();const {id}=await params;const result=await transitionApplication(id,body.status,body.reason,actor,correlationId);after(()=>dispatchWhatsAppOutbox(10));return NextResponse.json(result,{headers:{"x-request-id":correlationId}});}catch(error){return portalErrorResponse(error,correlationId);}}
