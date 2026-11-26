# Canonical terminology

Status: CANONICAL
Version: v0
Last reviewed: 2026-10-14
Depends on: [document-governance](document-governance.md)
Supersedes: None; historical revisions remain in Git

## Purpose

Own the vocabulary across active specification documents. Other pages specialize these meanings and link here; they must not redefine them silently.

## CANONICAL

The hierarchy is PoWit → Thoth → applications → VoteLedger. The definitions below establish conceptual usage, not finalized implementation types. An OPEN qualifier explicitly limits unsettled semantics.

| Term | Definition | What it is not | Related terms | Scope / unresolved boundary |
| --- | --- | --- | --- | --- |
| PoWit | A protocol for producing a verifiable record of what independently situated humans collectively witnessed when no trusted machine-readable oracle exists. | A base-chain consensus mechanism or proof of objective truth. | Observation, Attestation, Settlement | Generic protocol |
| Thoth | The reusable network, infrastructure, application and economic layer built around PoWit. | An alias for PoWit or its first application. | PoWit, Application | Network/infrastructure |
| Human Passport | THOTH's native proof-of-personhood and persistent human layer, supporting continuity and eligibility across participation. | A guarantee of one human per credential, truthful behavior, current-event independence, or compulsory public civil identity. | Identity, Eligibility, Selective Linkability, Standing | Accepted institutional purpose; production enrollment, uniqueness, cryptography, recovery and privacy mechanisms remain open (Q03-Q08/Q16) |
| Passport Event | The in-person commissioning field pilot for THOTH's persistent human/personhood and presence layer. | The first application/schema or proof of commercial demand and voluntary witnessing. | Human Passport, Presence, Witness Event | First field pilot; protocol and operational acceptance criteria remain to be selected |
| Witness Event | A field experiment in which eligible humans contribute situated observations to an inspectable witnessed Record. | A guarantee that an alleged occurrence happened, a new EventState or a replacement for the generic Event. | Event, Witness, Observation, Record | Strategic proof stage after Passport Event; domain/operational plan separate from generic semantics |
| Reality Query | A request for fresh, provenance-backed human observation of a real-world state or event. | A truth-oracle answer, arbitrary human task execution or merely reading a historical record. | Event, Witness, Observation, Reality API | Canonical vocabulary explicitly adopted by founder; routing, commercial/API contract and assurance profile remain provisional |
| Reality API | The commercial interface/capability through which enterprises, institutions and AI systems commission or query provenance-rich human observation of physical reality. | A selected endpoint, wire contract or guarantee of physical truth. | Reality Query, Record, Thoth | Accepted commercial wedge; implementation, pricing and service levels remain provisional |
| EvidenceArtifact | Material or a reference offered with provenance for assessment in connection with an observation or Event. | An admitted Observation by itself, proof of event occurrence or assurance of availability. | Evidence, Authenticator, Observation | Supporting evidence object; exact v0 representation and authentication gates remain owned by the v0 specification |
| Standing | Historical and contextual participation standing within THOTH, supporting interpretation and meaning of persistent human participation. | Popularity, proof of truth, a global independence score or automatic reward for majority agreement. | Human Passport, Reputation, Independence | Accepted institutional purpose; scoring, accrual, incentives and privileges remain unselected (Q07/Q13/Q15) |
| Record | The durable, queryable history of human witnessing, evidence references, assessments and subsequent changes under declared access rules. | A truth certificate, necessarily all raw material on-chain, or a new v0 wire object. | Event, Observation, Attestation, Settlement, Supersession | Conceptual system output; specialized kernel/settlement/evidence owners govern representation and access |
| Attention theater | An arena in which collective human attention concentrates and is directed; THOTH's ambition is to organize it around witnessed reality. | Merely performing engagement, proof of consumer adoption or license to reward fabrication/virality. | Event, Witness, Record, Standing | Canonical founder meaning and cultural ambition; behavior and interface mechanisms remain experimental |
| Application | A domain-specific use of Thoth and PoWit under explicit rules. | The source of mandatory generic protocol semantics. | EventSchema, Thoth | Downstream specialization |
| VoteLedger | The first application and election-specific schema. | The parent architecture or a generic type dependency. | Application, EventSchema | Application only |
| EventSchema | A reusable definition of rules under which an event is witnessed and assessed. | An event instance or proof that its rules are adequate. | Event, Eligibility, Aggregation | Generic candidate; field semantics/version binding open (Q10) |
| Event | A particular scoped occurrence or alleged occurrence about which observations are collected. | Proof that the occurrence happened; a schema or entire application. | EventSchema, Observation | Generic candidate; identity and cardinalities open (Q10) |
| Witness | A human participant reporting a situated observation. | A wallet, credential, device or guarantee of truthful behavior. | Identity, Presence, Observation | Human role; type representation open (Q10) |
| Identity | The representation and assurance used to establish participation continuity and accepted credentials. | The human being itself, a public civil name, or proof of independence. | Witness, Eligibility, Selective Linkability | Identity layer; construction/assurance open (Q03/Q04) |
| Eligibility | Satisfaction of an event's declared participation conditions. | Independence, truthful behavior or physical presence by default. | Identity, EventSchema, Presence | Event/schema-specific |
| Presence | Evidence about location or observation opportunity within a scope. | Proof of what was seen, social independence or unspoofable location. | Witness, Observation, Evidence | Context layer; guarantees open (Q08) |
| Observation | In v0, a meaningful admitted structured human report bound to one Event/participation, matching its commitment, validly revealed and schema/protocol-valid. | Any raw report, explicit abstention, failed reveal, evidence alone or an aggregate. | WitnessParticipation, Event, Attestation | Exact v0 admission and envelope in POWIT_V0_SPEC/TYPES |
| Commitment | A cryptographic binding to a value under a specified construction, prior to reveal. | An observation becoming true; automatic hiding without suitable construction. | Reveal, Observation | Protocol mechanism; construction open (Q09) |
| Reveal | Disclosure sufficient to check a prior commitment under declared rules. | A truth check or necessarily unrestricted public disclosure. | Commitment, Evidence | Protocol stage; recipient/access rules open (Q09/Q16) |
| Evidence | Material offered as a basis for assessing an observation, relation or claim. | Automatic proof of accuracy, availability or permissible publication. | Observation, Correlation, Attestation | Cross-layer; access and representation open (Q12/Q16) |
| Independence | A relational, contextual, event-specific assessment of how observations were produced and depend on one another. | A global personal score, credential validity, reputation or majority agreement. | Correlation, Adversarial Diversity, Reputation | Assessment layer; methodology open (Q02) |
| Correlation | Observed or inferred association among reports, contexts, sources or participants relevant to assessment. | By itself proof of copying, causation or collusion. | Independence, Evidence | Analytical layer; method and access open (Q02/Q06) |
| Adversarial Diversity | Relevant divergence of incentives that may strengthen the evidential value of convergence. | A guarantee that declared opponents cannot coordinate. | Independence, Correlation | Assessment principle; measurement open (Q02) |
| Reputation | Persistent, historical and contextual assessment of participation under explicit rules. | Proof of honesty, truth or current-event independence. | Identity, Independence | History layer; accrual/update model open (Q07) |
| Aggregation | An explicit process interpreting observations and their assessed dependencies under applicable rules. | Raw majority voting by definition or a guarantee of reality. | Observation, Attestation, Epistemic State | Protocol stage; algorithm open (Q02) |
| Attestation | The immutable canonical result of finalized PoWit execution, binding its assessment and provenance. | An individual observation, truth guarantee or settlement transaction. | Aggregation, Epistemic State, Settlement | v0 envelope frozen; replay/policy authority gates remain |
| Epistemic State | CONCORDANT, SPLIT, THIN or SILENT under the v0 ordered classification matrix. | Event workflow state, transaction status or certainty certificate. | Attestation, Aggregation, Sufficiency | v0 classifier frozen; policies remain B01-B03 |
| Nullifier | A value intended to detect repeated use of an accepted private root within a defined scope. | Proof of one human across multiple separately enrolled roots. | Identity, Selective Linkability | Scoped participation; derivation/enforcement open (Q05) |
| Selective Linkability | Controlled exposure of the minimum permitted links between scoped representations of a persistent private identity. | Total anonymity, total public traceability or an assumed administrator opening key. | Identity, Nullifier, Reputation | Privacy direction; authorization/construction open (Q05-Q07) |
| Settlement | Delivery/recording of an immutable Attestation under a declared local, content-addressed or external adapter. | Physical validation, epistemic classification, or an Event state. | Attestation, Supersession | Separate from formation; failure cannot change epistemic state |
| Verification Material Availability | Whether an authorized verifier can obtain the canonical ReplayBundle needed to independently replay an Attestation under a declared access and retention profile. | EvidenceArtifact authenticity, public disclosure by default, or an epistemic state. | ReplayBundle, Settlement, Attestation | Thoth v0 [RESTRICTED_REPLAY profile](../powit/settlement/THOTH_V0_SETTLEMENT_PROFILE.md); deployment retention/access remain open |
| Supersession | An explicit relationship by which a later assessment replaces an earlier one for current interpretation while preserving prior record provenance. | Erasure of history or a transaction rollback. | Attestation, Settlement | Revision semantics; authority and conflict handling open (Q11) |
| Consensus | An overloaded word requiring qualification: base-layer agreement about ledger state or, historically, agreement among reports. | A synonym for objective truth or the defined aggregation algorithm. | Aggregation, Attestation | Use qualified meanings only; prefer aggregation for the witnessing stage |

| WitnessParticipation | One eligible human's event-scoped epistemic role. | ThothAccount, EmbeddedWallet, a credential or another observation right per witness class. | Witness, Observation, Event | Canonical v0 core object; one per underlying human/Event |
| QualificationSnapshot | Immutable relevant qualification record captured with accepted commitment. | An issuer's power to retroactively delete participation. | Eligibility, Claim, Commitment | v0; ordinary later revocation is prospective |
| Authenticator | Event-scoped human evaluating an artifact's schema-defined provenance standing. | Event-occurrence judge, replacement Witness, or self-authentication. | Evidence, Observation | Narrow v0 role; policy/diversity gates remain B06 |
| Sufficiency | Whether the accepted witness structure meets schema-defined conditions for stronger classification. | Agreement, universal independence score or a truth probability. | RelationGraph, Aggregation, Epistemic State | v0 mandatory separation; operators remain B03 |

The [v0 SPEC](../powit/v0/POWIT_V0_SPEC.md) owns kernel semantics and [TYPES](../powit/v0/POWIT_V0_TYPES.md) owns exact wire formats; this remains the cross-project vocabulary index.

For v0, SILENT means no admitted Observation; explicit abstentions remain RevealRecords and do not count. A negative observation such as false is meaningful unless it is the schema's explicit abstention marker. THIN applies when admitted Observations exist but sufficiency fails, ahead of CONCORDANT/SPLIT. Independence and reputation share a contextual character but concern different things: event relationships versus history.

'Public settlement' is the final stage name in the [canonical lifecycle](../reference/canonical-lifecycle.md). 'Truth formation' and 'truth delivery' mean forming/delivering qualified witnessing records, never objective truth. Guardian is retired terminology. Authenticator is a separate evidence-provenance role, not a replacement witness or assistance role.

## PROVISIONAL

Plain-language labels can explain canonical terms but must not introduce stronger guarantees. Splitting Witness and Identity into distinct implementation types is not decided merely by separating their meanings.

## OPEN QUESTION

Q01: Finalize state boundaries. Q10: Define object/cardinality semantics. Q15: Record terminology changes and their semantic impact through the [version policy](../versions/README.md); use an ADR for a consequential redefinition.
