import type { PortalUser } from './auth';
import { transaction } from './db';
import { PortalError, requiredText } from './portal-security';

export async function submitPaymentClaim(raw:any, actor:PortalUser, correlationId:string) {
  const invoiceId=Number(raw.invoiceId), amount=Number(raw.amountKes);
  if(!Number.isSafeInteger(invoiceId)||invoiceId<=0||!Number.isSafeInteger(amount)||amount<=0) throw new PortalError(400,'Invoice and positive whole KES amount are required','VALIDATION_ERROR');
  const method=requiredText(raw.method,'Payment method',30), reference=requiredText(raw.reference,'Transaction reference',100);
  if(!['MPesa','Bank Transfer','Cash'].includes(method)) throw new PortalError(400,'Unsupported payment method','VALIDATION_ERROR');
  return transaction(async c=>{
    const student=await c.query<{id:number}>('SELECT id FROM portal_students WHERE user_id=$1 AND deleted_at IS NULL',[actor.id]);
    if(!student.rowCount) throw new PortalError(403,'Student profile required','FORBIDDEN');
    const invoice=await c.query<{amount_kes:number;paid:number}>(`SELECT i.amount_kes,COALESCE(sum(pa.amount_kes) FILTER(WHERE p.status='verified'),0)::bigint paid FROM portal_invoices i LEFT JOIN portal_payment_allocations pa ON pa.invoice_id=i.id LEFT JOIN portal_payments p ON p.id=pa.payment_id WHERE i.id=$1 AND i.student_id=$2 AND i.deleted_at IS NULL AND i.status<>'void' GROUP BY i.id`,[invoiceId,student.rows[0].id]);
    if(!invoice.rowCount) throw new PortalError(404,'Invoice not found','NOT_FOUND');
    if(amount>Number(invoice.rows[0].amount_kes)-Number(invoice.rows[0].paid)) throw new PortalError(409,'Claim exceeds the outstanding invoice balance','OVERPAYMENT');
    const claim=await c.query(`INSERT INTO portal_payment_claims(student_id,invoice_id,amount_kes,method,reference) VALUES($1,$2,$3,$4,$5) RETURNING *`,[student.rows[0].id,invoiceId,amount,method,reference]);
    await c.query(`INSERT INTO portal_audit_logs(user_id,student_id,action,entity_type,entity_id,after_state,correlation_id) VALUES($1,$2,'payment.claim_submitted','payment_claim',$3,$4::jsonb,$5::uuid)`,[actor.id,student.rows[0].id,String(claim.rows[0].id),JSON.stringify(claim.rows[0]),correlationId]);
    return claim.rows[0];
  });
}
