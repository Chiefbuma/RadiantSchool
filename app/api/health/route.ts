import { NextResponse } from "next/server";
import { query } from "@/lib/db";
export async function GET(){try{const result=await query<{database_time:string}>("SELECT now()::text database_time");return NextResponse.json({status:"ok",database:"connected",databaseTime:result.rows[0].database_time});}catch{return NextResponse.json({status:"unhealthy",database:"unavailable"},{status:503});}}
