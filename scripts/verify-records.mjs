import fs from 'node:fs';
import assert from 'node:assert/strict';
import {canonicalize,parseJsonStrict,PowitEventSession,replayEvent,verifyAttestation} from '../packages/powit-core/src/index.ts';
const root=new URL('../',import.meta.url);
for(const state of ['CONCORDANT','SPLIT','THIN','SILENT']){
 const r=parseJsonStrict(fs.readFileSync(new URL(`examples/${state}.json`,root),'utf8'));
 assert.equal(r.kind,'THOTH_CHAMBER_SYNTHETIC_RECORD_V1');
 assert.equal(r.settlement.status,'UNSUBMITTED');
 let time=0;
 const session=new PowitEventSession(r.bundle.eventSchema,r.bundle.policyDefinitions,{now:()=>time});
 for(const row of r.bundle.intakeDecisions){time=row.authoritativeAt;assert.equal(canonicalize(session.submit({actionType:row.actionType,actorId:row.actorId,participationId:row.participationId,input:row.input,clientTimestamp:row.clientTimestamp,recordRef:row.recordRef})),canonicalize(row));}
 const produced=session.finalizeEvent();
 assert.equal(canonicalize(produced.bundle),canonicalize(r.bundle));
 const verified=verifyAttestation(r.bundle,r.attestation,r.attestationHash);
 assert.equal(verified.valid,true);assert.equal(verified.attestation.epistemicState,state);
 assert.equal(produced.attestationHash,r.attestationHash);
 assert.equal(replayEvent(JSON.stringify(r.bundle)).attestationHash,r.attestationHash);
 const tampered=structuredClone(r.attestation);tampered.eventHash='0'.repeat(64);
 assert.equal(verifyAttestation(r.bundle,tampered,r.attestationHash).valid,false);
 const badBundle=structuredClone(r.bundle);badBundle.claimedEpistemicState=state==='SPLIT'?'CONCORDANT':'SPLIT';
 assert.equal(verifyAttestation(badBundle,r.attestation,r.attestationHash).valid,false);
 console.log(JSON.stringify({state,attestationHash:r.attestationHash,actions:r.bundle.intakeDecisions.length,observations:r.bundle.claimedAdmittedObservations.length,valid:true,tamperRejected:true,synthetic:true}));
}
