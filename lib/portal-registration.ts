import crypto from "crypto";
import type { PoolClient } from "pg";
import { hashPassword, type PortalUser } from "./auth";
import { transaction } from "./db";
import { normalizeEmail, PortalError, requiredText } from "./portal-security";

export type RegisterStudentInput = {
  applicationId?: number;
  programId: number;
  cohortId: number;
  classId: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  residence: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
};

function positiveId(value: unknown, field: string) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new PortalError(400, `${field} is invalid`, "VALIDATION_ERROR");
  return id;
}

async function audit(client: PoolClient, actor: PortalUser, action: string, entityType: string, entityId: string, after: unknown, correlationId: string) {
  await client.query(`INSERT INTO portal_audit_logs(user_id,action,entity_type,entity_id,after_state,correlation_id)
    VALUES($1,$2,$3,$4,$5::jsonb,$6::uuid)`, [actor.id, action, entityType, entityId, JSON.stringify(after), correlationId]);
}

export async function registerStudent(raw: RegisterStudentInput, actor: PortalUser, correlationId: string) {
  const input = {
    applicationId: raw.applicationId ? positiveId(raw.applicationId, "applicationId") : undefined,
    programId: positiveId(raw.programId, "programId"),
    cohortId: positiveId(raw.cohortId, "cohortId"),
    classId: positiveId(raw.classId, "classId"),
    fullName: requiredText(raw.fullName, "Full name"),
    email: normalizeEmail(raw.email),
    phone: requiredText(raw.phone, "Phone", 30),
    dateOfBirth: requiredText(raw.dateOfBirth, "Date of birth", 10),
    nationalId: requiredText(raw.nationalId, "National ID", 40),
    residence: requiredText(raw.residence, "Residence"),
    nextOfKinName: requiredText(raw.nextOfKinName, "Next of kin name"),
    nextOfKinPhone: requiredText(raw.nextOfKinPhone, "Next of kin phone", 30),
    nextOfKinRelationship: requiredText(raw.nextOfKinRelationship, "Next of kin relationship", 60),
  };
  const invitationToken = crypto.randomBytes(32).toString("base64url");
  const invitationHash = crypto.createHash("sha256").update(invitationToken).digest("hex");
  const unusablePassword = hashPassword(crypto.randomBytes(48).toString("base64url"));

  const result = await transaction(async (client) => {
    if (input.applicationId) {
      const application = await client.query<{status:string;program_id:number|null}>("SELECT status,program_id FROM applications WHERE id=$1 AND deleted_at IS NULL FOR UPDATE", [input.applicationId]);
      if (!application.rowCount) throw new PortalError(404, "Application not found", "NOT_FOUND");
      if (application.rows[0].status !== "accepted") throw new PortalError(409, "Only an accepted application can be registered", "INVALID_TRANSITION");
      if (application.rows[0].program_id && Number(application.rows[0].program_id) !== input.programId) throw new PortalError(409, "The selected program differs from the accepted offer", "PROGRAM_MISMATCH");
    }

    const assignment = await client.query<{program_code:string;intake_year:number}>(`SELECT upper(p.slug) program_code,i.intake_year
      FROM portal_programs p JOIN portal_cohorts c ON c.program_id=p.id JOIN portal_intakes i ON i.id=c.intake_id
      JOIN portal_classes cl ON cl.cohort_id=c.id WHERE p.id=$1 AND c.id=$2 AND cl.id=$3 AND p.status='active' AND c.status='active'`, [input.programId,input.cohortId,input.classId]);
    if (!assignment.rowCount) throw new PortalError(409, "Program, cohort and class assignment is inconsistent or inactive", "ASSIGNMENT_MISMATCH");

    const duplicate = await client.query("SELECT 1 FROM portal_students WHERE deleted_at IS NULL AND (lower(email)=$1 OR national_id=$2)", [input.email,input.nationalId]);
    if (duplicate.rowCount) throw new PortalError(409, "A student with this email or national ID already exists", "DUPLICATE_STUDENT");

    await client.query("SELECT pg_advisory_xact_lock($1::integer,$2::integer)", [input.programId,assignment.rows[0].intake_year]);
    const counter = await client.query<{next_value:number}>(`INSERT INTO portal_admission_counters(program_id,intake_year,next_value)
      SELECT $1::bigint,$2::integer,COALESCE(MAX(NULLIF(split_part(s.student_number,'/',4),'')::integer),0)+1
      FROM portal_students s JOIN portal_student_enrollments e ON e.student_id=s.id
      WHERE e.program_id=$1::bigint AND split_part(s.student_number,'/',3)=($2::integer)::text
      ON CONFLICT(program_id,intake_year) DO UPDATE SET next_value=portal_admission_counters.next_value+1 RETURNING next_value`, [input.programId,assignment.rows[0].intake_year]);
    const studentNumber = `RHTI/${assignment.rows[0].program_code}/${assignment.rows[0].intake_year}/${String(counter.rows[0].next_value).padStart(4,"0")}`;

    const user = await client.query<{id:string}>(`INSERT INTO portal_users(full_name,email,phone,password_hash,status) VALUES($1,$2,$3,$4,'active') RETURNING id`, [input.fullName,input.email,input.phone,unusablePassword]);
    await client.query(`INSERT INTO portal_user_roles(user_id,role_id) SELECT $1,id FROM portal_roles WHERE name='student'`, [user.rows[0].id]);
    await client.query(`INSERT INTO portal_account_invitations(user_id,token_hash,expires_at,created_by) VALUES($1,$2,now()+interval '48 hours',$3)`, [user.rows[0].id,invitationHash,actor.id]);

    const student = await client.query<{id:number}>(`INSERT INTO portal_students(user_id,application_id,student_number,full_name,email,phone,date_of_birth,status,national_id,residence,next_of_kin_name,next_of_kin_phone,next_of_kin_relationship,registered_by)
      VALUES($1,$2,$3,$4,$5,$6,$7,'active',$8,$9,$10,$11,$12,$13) RETURNING id`, [user.rows[0].id,input.applicationId ?? null,studentNumber,input.fullName,input.email,input.phone,input.dateOfBirth,input.nationalId,input.residence,input.nextOfKinName,input.nextOfKinPhone,input.nextOfKinRelationship,actor.id]);
    const enrollment = await client.query<{id:number}>(`INSERT INTO portal_student_enrollments(student_id,program_id,cohort_id,class_id,application_id,status,onboarding_status,documents_status,orientation_status,policies_status)
      VALUES($1,$2,$3,$4,$5,'active','in_progress','pending','pending','pending') RETURNING id`, [student.rows[0].id,input.programId,input.cohortId,input.classId,input.applicationId ?? null]);

    if (input.applicationId) {
      await client.query("UPDATE applications SET status='registered',updated_at=now() WHERE id=$1", [input.applicationId]);
      await client.query("INSERT INTO portal_application_status_history(application_id,from_status,to_status,reason,changed_by) VALUES($1,'accepted','registered',$2,$3)", [input.applicationId,`Registered as ${studentNumber}`,actor.id]);
    }
    await audit(client,actor,"student.registered","student",String(student.rows[0].id),{studentNumber,enrollmentId:enrollment.rows[0].id},correlationId);
    return { studentId: student.rows[0].id, studentNumber, enrollmentId: enrollment.rows[0].id, userId: user.rows[0].id };
  });
  return { ...result, invitationToken, invitationExpiresInHours: 48 };
}
