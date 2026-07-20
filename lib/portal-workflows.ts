import crypto from "crypto";
import type { PoolClient } from "pg";
import type { PortalUser } from "./auth";
import { transaction } from "./db";
import { PortalError, requiredText } from "./portal-security";

function id(value: unknown, name: string) {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result <= 0) throw new PortalError(400, `${name} is invalid`, "VALIDATION_ERROR");
  return result;
}

async function writeAudit(client: PoolClient, actor: PortalUser, action: string, type: string, entityId: string, before: unknown, after: unknown, correlationId: string, studentId?: number) {
  await client.query(`INSERT INTO portal_audit_logs(user_id,student_id,action,entity_type,entity_id,before_state,after_state,correlation_id)
    VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::uuid)`, [actor.id,studentId ?? null,action,type,entityId,JSON.stringify(before ?? null),JSON.stringify(after ?? null),correlationId]);
}

const applicationTransitions: Record<string, string[]> = {
  new: ["under_review"],
  under_review: ["accepted","rejected","waitlisted"],
  waitlisted: ["accepted","rejected"],
  accepted: ["registered","withdrawn"],
  rejected: [], registered: [], withdrawn: [],
};

export async function transitionApplication(applicationIdRaw: unknown, toRaw: unknown, reasonRaw: unknown, actor: PortalUser, correlationId: string) {
  const applicationId = id(applicationIdRaw,"applicationId");
  const to = requiredText(toRaw,"Status",30).toLowerCase();
  const reason = requiredText(reasonRaw,"Reason",1000);
  return transaction(async client => {
    const found = await client.query<{status:string;program_id:number|null;kcse_mean_grade:string|null}>("SELECT status,program_id,kcse_mean_grade FROM applications WHERE id=$1 AND deleted_at IS NULL FOR UPDATE",[applicationId]);
    if (!found.rowCount) throw new PortalError(404,"Application not found","NOT_FOUND");
    const before = found.rows[0];
    if (!(applicationTransitions[before.status] ?? []).includes(to)) throw new PortalError(409,`Application cannot move from ${before.status} to ${to}`,"INVALID_TRANSITION");
    if (to === "accepted" && !before.program_id) throw new PortalError(409,"A program must be assigned before acceptance","PROGRAM_REQUIRED");
    const updated = await client.query("UPDATE applications SET status=$2,reviewed_by=$3,reviewed_at=now(),notes=concat_ws(E'\\n',notes,$4::text) WHERE id=$1 RETURNING *",[applicationId,to,actor.id,reason]);
    if(to==="accepted") await client.query(`INSERT INTO portal_admission_offers(application_id,program_id,intake_id,offer_number,status,notes)
      SELECT id,program_id,intake_id,'RHTI-OFFER-'||to_char(CURRENT_DATE,'YYYY')||'-'||lpad(id::text,6,'0'),'issued',$2 FROM applications WHERE id=$1
      ON CONFLICT(application_id) DO UPDATE SET program_id=excluded.program_id,intake_id=excluded.intake_id,status='issued',notes=excluded.notes`,[applicationId,reason]);
    await client.query("INSERT INTO portal_application_status_history(application_id,from_status,to_status,reason,changed_by) VALUES($1,$2,$3,$4,$5)",[applicationId,before.status,to,reason,actor.id]);
    await writeAudit(client,actor,"application.status_changed","application",String(applicationId),before,updated.rows[0],correlationId);
    return updated.rows[0];
  });
}

export type PaymentInput = { invoiceId:number; amountKes:number; method:string; reference:string; idempotencyKey:string };
export async function recordPayment(raw: PaymentInput, actor: PortalUser, correlationId: string) {
  const invoiceId=id(raw.invoiceId,"invoiceId");
  const amount=Number(raw.amountKes);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new PortalError(400,"Payment amount must be a positive whole KES amount","INVALID_AMOUNT");
  const method=requiredText(raw.method,"Payment method",30);
  const reference=requiredText(raw.reference,"Transaction reference",100);
  const idem=requiredText(raw.idempotencyKey,"Idempotency key",100);
  return transaction(async client => {
    const prior=await client.query("SELECT id,receipt_number FROM portal_payments WHERE idempotency_key=$1",[idem]);
    if (prior.rowCount) return prior.rows[0];
    const invoice=await client.query<{id:number;student_id:number;amount_kes:number;status:string}>("SELECT id,student_id,amount_kes,status FROM portal_invoices WHERE id=$1 AND deleted_at IS NULL FOR UPDATE",[invoiceId]);
    if (!invoice.rowCount) throw new PortalError(404,"Invoice not found","NOT_FOUND");
    if (invoice.rows[0].status === "void") throw new PortalError(409,"A void invoice cannot receive payment","INVALID_INVOICE");
    const allocated=await client.query<{total:string}>(`SELECT COALESCE(sum(pa.amount_kes),0)::text total FROM portal_payment_allocations pa JOIN portal_payments p ON p.id=pa.payment_id WHERE pa.invoice_id=$1 AND p.status='verified'`,[invoiceId]);
    const balance=Number(invoice.rows[0].amount_kes)-Number(allocated.rows[0].total);
    if (amount > balance) throw new PortalError(409,`Payment exceeds the outstanding balance of KES ${balance}`,"OVERPAYMENT");
    const receipt=`RCT-${new Date().getFullYear()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const payment=await client.query<{id:number;receipt_number:string}>(`INSERT INTO portal_payments(student_id,invoice_id,receipt_number,amount_kes,method,reference,recorded_by,status,idempotency_key)
      VALUES($1,$2,$3,$4,$5,$6,$7,'verified',$8) RETURNING id,receipt_number`,[invoice.rows[0].student_id,invoiceId,receipt,amount,method,reference,actor.id,idem]);
    await client.query("INSERT INTO portal_payment_allocations(payment_id,invoice_id,amount_kes) VALUES($1,$2,$3)",[payment.rows[0].id,invoiceId,amount]);
    const newStatus=amount===balance?"paid":"partially_paid";
    await client.query("UPDATE portal_invoices SET status=$2 WHERE id=$1",[invoiceId,newStatus]);
    const outstanding=await client.query<{total:string}>(`SELECT COALESCE(sum(i.amount_kes-COALESCE(a.allocated,0)),0)::text total FROM portal_invoices i LEFT JOIN (SELECT pa.invoice_id,sum(pa.amount_kes) allocated FROM portal_payment_allocations pa JOIN portal_payments p ON p.id=pa.payment_id AND p.status='verified' GROUP BY pa.invoice_id) a ON a.invoice_id=i.id WHERE i.student_id=$1 AND i.deleted_at IS NULL AND i.status<>'void'`,[invoice.rows[0].student_id]);
    if (Number(outstanding.rows[0].total)===0) {
      await client.query("UPDATE portal_student_holds SET status='released',released_by=$2,released_at=now(),release_reason='All mandatory invoices settled' WHERE student_id=$1 AND hold_type='finance' AND status='active'",[invoice.rows[0].student_id,actor.id]);
      await client.query(`UPDATE portal_student_clearance sc SET status='approved',approved_by=$2,approved_at=now(),notes='All mandatory invoices settled' FROM portal_clearance_checkpoints cp WHERE sc.checkpoint_id=cp.id AND sc.student_id=$1 AND lower(cp.title) LIKE '%finance%'`,[invoice.rows[0].student_id,actor.id]);
    }
    await writeAudit(client,actor,"payment.recorded","payment",String(payment.rows[0].id),null,{invoiceId,amount,receipt,newStatus},correlationId,invoice.rows[0].student_id);
    return {...payment.rows[0],invoiceStatus:newStatus,outstandingKes:Number(outstanding.rows[0].total)};
  });
}

export type MarkInput={assessmentId:number;studentId:number;score:number;attemptNumber?:number};
export async function recordMark(raw:MarkInput,actor:PortalUser,correlationId:string){
  const assessmentId=id(raw.assessmentId,"assessmentId"),studentId=id(raw.studentId,"studentId"),attempt=id(raw.attemptNumber??1,"attemptNumber");
  const score=Number(raw.score); if(!Number.isFinite(score)||score<0) throw new PortalError(400,"Score is invalid","INVALID_SCORE");
  return transaction(async client=>{
    const eligible=await client.query<{max_score:string}>(`SELECT a.max_score::text FROM portal_assessments a JOIN portal_student_enrollments e ON e.student_id=$2 AND e.cohort_id=a.cohort_id AND (a.class_id IS NULL OR a.class_id=e.class_id) WHERE a.id=$1 AND e.status='active' AND a.status IN ('planned','open','published')`,[assessmentId,studentId]);
    if(!eligible.rowCount) throw new PortalError(409,"Student is not eligible for this assessment","INELIGIBLE_STUDENT");
    if(score>Number(eligible.rows[0].max_score)) throw new PortalError(400,"Score exceeds assessment maximum","INVALID_SCORE");
    const mark=await client.query(`INSERT INTO portal_marks(assessment_id,student_id,attempt_number,score,status,entered_by) VALUES($1,$2,$3,$4,'draft',$5) RETURNING *`,[assessmentId,studentId,attempt,score,actor.id]);
    await writeAudit(client,actor,"mark.recorded","mark",`${assessmentId}:${studentId}:${attempt}`,null,mark.rows[0],correlationId,studentId);
    return mark.rows[0];
  });
}

export async function transitionMark(raw:{assessmentId:number;studentId:number;attemptNumber?:number;action:string},actor:PortalUser,correlationId:string){
  const assessmentId=id(raw.assessmentId,"assessmentId"),studentId=id(raw.studentId,"studentId"),attempt=id(raw.attemptNumber??1,"attemptNumber");
  const action=requiredText(raw.action,"Action",20); const map:Record<string,[string,string]>={submit:["draft","submitted"],moderate:["submitted","moderated"],approve:["moderated","approved"],publish:["approved","published"]};
  if(!map[action]) throw new PortalError(400,"Unknown mark action","VALIDATION_ERROR");
  return transaction(async client=>{const current=await client.query("SELECT * FROM portal_marks WHERE assessment_id=$1 AND student_id=$2 AND attempt_number=$3 FOR UPDATE",[assessmentId,studentId,attempt]); if(!current.rowCount) throw new PortalError(404,"Mark not found","NOT_FOUND"); if(current.rows[0].status!==map[action][0]) throw new PortalError(409,`Mark must be ${map[action][0]} before ${action}`,"INVALID_TRANSITION");
    const extras=action==='moderate'?",moderated_by=$5,moderated_at=now()":action==='publish'?",published_by=$5,published_at=now()":"";
    const updated=await client.query(`UPDATE portal_marks SET status=$4${extras} WHERE assessment_id=$1 AND student_id=$2 AND attempt_number=$3 RETURNING *`,[assessmentId,studentId,attempt,map[action][1],actor.id]); await writeAudit(client,actor,`mark.${action}ed`,"mark",`${assessmentId}:${studentId}:${attempt}`,current.rows[0],updated.rows[0],correlationId,studentId); return updated.rows[0];});
}
