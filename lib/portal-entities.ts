import type { PortalUser } from "./auth";
import { transaction } from "./db";
import { PortalError, requiredText } from "./portal-security";

const positive = (value: unknown, field: string) => { const n = Number(value); if (!Number.isSafeInteger(n) || n <= 0) throw new PortalError(400, `${field} is invalid`, "VALIDATION_ERROR"); return n; };
const money = (value: unknown, field: string) => { const n = Number(value); if (!Number.isSafeInteger(n) || n < 0) throw new PortalError(400, `${field} is invalid`, "VALIDATION_ERROR"); return n; };

const permissions: Record<string, string> = {
  programs: "academics.manage", modules: "academics.manage", cohorts: "academics.manage", classes: "academics.manage",
  resources: "resources.assign", timetable: "academics.manage", exams: "exams.manage", "graduation-batches": "graduation.manage",
  requests: "portal.student",
  attachments: "attachment.evaluate",
};

export function entityPermission(entity: string) { const permission = permissions[entity]; if (!permission) throw new PortalError(404, "Unknown entity", "NOT_FOUND"); return permission; }

async function audit(client: any, actor: PortalUser, action: string, entity: string, entityId: string, after: unknown, correlationId: string) {
  await client.query("INSERT INTO portal_audit_logs(user_id,action,entity_type,entity_id,after_state,correlation_id) VALUES($1,$2,$3,$4,$5::jsonb,$6::uuid)", [actor.id, action, entity, entityId, JSON.stringify(after), correlationId]);
}

export async function createEntity(entity: string, body: any, actor: PortalUser, correlationId: string) {
  return transaction(async client => {
    let result;
    if (entity === "programs") result = await client.query(`INSERT INTO portal_programs(slug,title,duration_months,entry_requirements,tuition_fee_kes,overview,status)
      VALUES($1,$2,$3,$4,$5,$6,'active') RETURNING *`, [requiredText(body.code,"Program code",20).toLowerCase(),requiredText(body.name,"Program name"),positive(body.durationMonths,"durationMonths"),requiredText(body.entryRequirement,"Entry requirement",1000),money(body.tuitionFee,"tuitionFee"),String(body.description??body.name)]);
    else if (entity === "modules") { const module = await client.query(`INSERT INTO portal_modules(code,title,description,credits) VALUES($1,$2,$3,$4) RETURNING *`,[requiredText(body.code,"Module code",30).toUpperCase(),requiredText(body.name,"Module name"),String(body.description??""),positive(body.credits,"credits")]); await client.query("INSERT INTO portal_program_modules(program_id,module_id,module_order) VALUES($1,$2,COALESCE((SELECT max(module_order)+1 FROM portal_program_modules WHERE program_id=$1),1))",[positive(body.programId,"programId"),module.rows[0].id]); result=module; }
    else if (entity === "cohorts") result = await client.query(`INSERT INTO portal_cohorts(program_id,intake_id,name,starts_on,expected_graduation_on,status)
      SELECT $1,i.id,$2,COALESCE($3::date,CURRENT_DATE),COALESCE($3::date,CURRENT_DATE)+(p.duration_months||' months')::interval,'active' FROM portal_programs p CROSS JOIN LATERAL(SELECT id FROM portal_intakes WHERE status='open' ORDER BY intake_year,intake_month LIMIT 1)i WHERE p.id=$1 RETURNING portal_cohorts.*`,[positive(body.programId,"programId"),requiredText(body.name,"Cohort name"),body.startDate||null]);
    else if (entity === "classes") result = await client.query(`INSERT INTO portal_classes(cohort_id,name,trainer_user_id,room,status) VALUES($1,$2,(SELECT id FROM portal_users WHERE full_name=$3 LIMIT 1),$4,'active') RETURNING *`,[positive(body.cohortId,"cohortId"),requiredText(body.name,"Class name"),requiredText(body.lecturerName,"Lecturer"),requiredText(body.room||"Room TBA","Room")]);
    else if (entity === "resources") { const resource=await client.query(`INSERT INTO portal_learning_resources(title,resource_type,url,description,created_by) VALUES($1,$2,$3,$4,$5) RETURNING *`,[requiredText(body.title,"Title"),requiredText(body.type,"Resource type",30),requiredText(body.url,"URL",2000),String(body.description??""),actor.id]); const target=String(body.targetType??"all"); if(target!=="all"){const column:{[k:string]:string}={student:"student_id",class:"class_id",cohort:"cohort_id",program:"program_id",module:"module_id"};if(!column[target])throw new PortalError(400,"Invalid resource target");await client.query(`INSERT INTO portal_resource_assignments(resource_id,${column[target]}) VALUES($1,$2)`,[resource.rows[0].id,positive(body.targetId,"targetId")]);} result=resource; }
    else if (entity === "timetable") { const day=requiredText(body.dayOfWeek,"Day",12);const start=requiredText(body.startTime,"Start time",10),end=requiredText(body.endTime,"End time",10); result=await client.query(`WITH next_day AS(SELECT CURRENT_DATE+((array_position(ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],$3)-extract(isodow from CURRENT_DATE)::int+7)%7) d)
      INSERT INTO portal_timetable_events(class_id,module_id,trainer_user_id,title,room,starts_at,ends_at)
      SELECT $1,$2,c.trainer_user_id,m.title,$6,(n.d::text||' '||$4)::timestamptz,(n.d::text||' '||$5)::timestamptz FROM portal_classes c JOIN portal_modules m ON m.id=$2 CROSS JOIN next_day n WHERE c.id=$1 RETURNING portal_timetable_events.*`,[positive(body.classId,"classId"),positive(body.moduleId,"moduleId"),day,start,end,requiredText(body.room||"Room TBA","Room")]); }
    else if (entity === "exams") result=await client.query(`INSERT INTO portal_assessments(module_id,cohort_id,class_id,title,assessment_type,max_score,weight_percent,exam_date,status)
      SELECT $2,c.cohort_id,c.id,$3,'Exam',$4,$5,$6,'planned' FROM portal_classes c WHERE c.id=$1 RETURNING portal_assessments.*`,[positive(body.classId,"classId"),positive(body.moduleId,"moduleId"),requiredText(body.name,"Exam name"),Number(body.maxMarks||100),Number(body.weightPercent||100),requiredText(body.date,"Exam date",10)]);
    else if(entity==="graduation-batches") result=await client.query("INSERT INTO portal_graduation_batches(name,ceremony_date,status) VALUES($1,$2,'planned') RETURNING *",[requiredText(body.name,"Ceremony name"),requiredText(body.ceremonyDate,"Ceremony date",10)]);
    else if(entity==="requests"){const student=await client.query<{id:number}>("SELECT id FROM portal_students WHERE user_id=$1",[actor.id]);if(!student.rowCount)throw new PortalError(403,"Student profile required","FORBIDDEN");const aliases:Record<string,string>={"Fee Plan":"Fee Payment Plan","Attachment Issue":"Attachment Support"};const category=requiredText(body.category,"Category");result=await client.query(`INSERT INTO portal_student_requests(student_id,category_id,subject,details,status) VALUES($1,(SELECT id FROM portal_request_categories WHERE name=$2 LIMIT 1),$3,$4,'submitted') RETURNING *`,[student.rows[0].id,aliases[category]??category,requiredText(body.subject,"Subject"),requiredText(body.description,"Description",5000)]);}
    else if(entity==="attachments"){result=await client.query(`INSERT INTO portal_attachment_placements(student_id,site_id,supervisor_name,department,starts_on,ends_on,status)
      VALUES($1,COALESCE((SELECT id FROM portal_attachment_sites WHERE name=$2 LIMIT 1),(SELECT id FROM portal_attachment_sites ORDER BY id LIMIT 1)),$3,$4,CURRENT_DATE,CURRENT_DATE+INTERVAL '90 days','active') RETURNING *`,[positive(body.studentId,"studentId"),requiredText(body.siteName,"Site name"),requiredText(body.supervisorName,"Supervisor"),requiredText(body.department,"Department")]);}
    else throw new PortalError(404,"Unknown entity","NOT_FOUND");
    if(!result.rowCount)throw new PortalError(409,"Related configuration is incomplete","RELATION_CONFLICT");
    await audit(client,actor,`${entity}.created`,entity,String(result.rows[0].id),result.rows[0],correlationId); return result.rows[0];
  });
}

export async function deleteEntity(entity:string,idRaw:unknown,actor:PortalUser,correlationId:string){const id=positive(idRaw,"id");return transaction(async client=>{let result;if(entity==="programs")result=await client.query("UPDATE portal_programs SET status='archived' WHERE id=$1 RETURNING *",[id]);else if(entity==="cohorts")result=await client.query("UPDATE portal_cohorts SET status='archived' WHERE id=$1 RETURNING *",[id]);else if(entity==="classes")result=await client.query("UPDATE portal_classes SET status='archived' WHERE id=$1 RETURNING *",[id]);else if(entity==="timetable")result=await client.query("DELETE FROM portal_timetable_events WHERE id=$1 RETURNING *",[id]);else if(entity==="resources")result=await client.query("DELETE FROM portal_learning_resources WHERE id=$1 RETURNING *",[id]);else throw new PortalError(409,"This record must be archived through its dedicated lifecycle workflow","PROTECTED_RECORD");if(!result.rowCount)throw new PortalError(404,"Record not found","NOT_FOUND");await audit(client,actor,`${entity}.deleted`,entity,String(id),result.rows[0],correlationId);return{ok:true};});}
