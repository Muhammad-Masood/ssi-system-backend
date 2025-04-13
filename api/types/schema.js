// FHIR Templates

// Task //
/**
 * @typedef {Object} Task
 * @property {"Task"} resourceType
 * @property {string} identifier
 * @property { string } requesterId
 * @property { string } processId
 * @property { "draft" | "requested" | "received" | "accepted"} status
 * @property {"routine" | "urgent" | "asap" | "stat"} [priority]
 * @property { string } lastModified // date-time
 */

// Patient Resource //
/**
 * @typedef {Object} Patient
 * @property {"Patient"} resourceType
 * @property {string} identifier - An identifier for this patient
 * @property {boolean} [active] - Whether this patient's record is in active use
 * @property {string} name - A name associated with the patient
 * @property {string} [telecom] - A contact detail for the individual
 * @property {"male" | "female" | "other" | "unknown"} [gender]
 * @property {string} [birthDate] - The date of birth for the individual (YYYY-MM-DD)
 * @property {boolean} [deceasedBoolean]
 * @property {string} [deceasedDateTime] - DateTime format
 * @property {string} [address] - An address for the individual
 * @property {string} [maritalStatus] - Marital (civil) status of a patient
 * @property {boolean} [multipleBirthBoolean]
 * @property {number} [multipleBirthInteger]
 * @property {string} [photo] - Image of the patient
 * @property {{
 *   language: CodeableConcept,
 *   preferred?: boolean
 * }} [communication]
 * @property {"Organization" | "Practitioner" | "PractitionerRole"} [generalPractitioner] - Primary care provider
 * @property {"Organization"} [managingOrganization] - Organization managing the patient record
 * @property {{
 *   other: Reference<"Patient" | "RelatedPerson">,
 *   type: "replaced-by" | "replaces" | "refer" | "seealso"
 * }} [link]
 */

// Medication //
/**
 * @typedef {Object} Organization
 * @property {"Organization"} resourceType
 * @property {string} identifier - Identifies this organization across multiple systems
 * @property {boolean} [active] - Whether the organization's record is still in active use
 * @property {string} [type] - Kind of organization
 * @property {string} name - Name used for the organization
 * @property {string} [alias] - A list of alternate names for the organization
 * @property {string} [description] - Additional details about the Organization (markdown)
 * @property {string} [contact] - Official contact details for the Organization
 * @property {Organization} [partOf] - The organization of which this organization forms a part
 * @property {Array<Reference<"Endpoint">>} [endpoint] - Technical endpoints providing access to services operated for the organization
 * @property {Array<{
 *   identifier?: Array<Identifier>,
 *   code: CodeableConcept,
 *   period?: Period,
 *   issuer?: Reference<"Organization">
 * }>} [qualification] - Qualifications, certifications, accreditations, licenses, etc.
 */

/**
 * @typedef {Object} Quantity
 * @property {number} value - Numerical value (with implicit precision)
 * @property {string} [comparator] - < | <= | >= | > | ad - how to understand the value
 * @property {string} [unit] - Unit representation
 * @property {string} [system] - System that defines coded unit form
 * @property {string} [code] - Coded form of the unit
 */

/**
 * @typedef {Object} Medication
 * @property {"Medication"} resourceType
 * @property {string} identifier - Business identifier for the medication
 * @property {CodeableConcept} [code] - Codes identifying the medication
 * @property {string} [status] - active | inactive | entered-in-error
 * @property {Organization} [marketingAuthorizationHolder] - Authorized marketing organization
 * @property {string} [doseForm] - Form of medication (powder, tablet, capsule, etc.)
 * @property {Quantity} [totalVolume] - Total drug amount when package size isn't inferred
 * @property {Array<{
 *   item: CodeableReference<"Medication"|"Substance">,
 *   isActive?: boolean,
 *   strengthRatio?: Ratio,
 *   strengthCodeableConcept?: CodeableConcept,
 *   strengthQuantity?: Quantity
 * }>} [ingredient] - Active or inactive ingredients
 * @property {Object} [batch] - Packaged medication details
 * @property {string} [batch.lotNumber] - Batch identifier
 * @property {string} [batch.expirationDate] - Expiration date (dateTime)
 * @property {Reference<"MedicationKnowledge">} [definition] - Knowledge about the medication
 */

/**
 * @typedef {Object} MedicationRequest
 * @property {"MedicationRequest"} resourceType - The type of FHIR resource (should be "MedicationRequest")
 * @property {string} identifier - External identifiers for this request
 * @property {"CarePlan" | "ImmunizationRecommendation" | "MedicationRequest" | "ServiceRequest"} [basedOn] - A plan or request that is fulfilled in whole or part by this medication request
 * @property {string} [priorPrescription] - Reference to an order/prescription being replaced
 * @property {string} [groupIdentifier] - Composite request this is part of
 * @property {"active" | "on-hold" | "ended" | "stopped" | "completed" | "cancelled" | "entered-in-error" | "draft" | "unknown"} status - Status of the medication request
 * @property {string} [statusReason] - Reason for the current status
 * @property {string} [statusChanged] - DateTime when the status changed
 * @property {"proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option"} intent - The intent of the medication request
 * @property {string} [category] - Grouping or category of medication request
 * @property {"routine" | "urgent" | "asap" | "stat"} [priority] - Priority of the request
 * @property {boolean} [doNotPerform] - If true, the patient should not take the medication
 * @property {Medication} medication - Medication to be taken
 * @property {string} subject - Identifier of Individual (patient) or group for whom the medication is requested
 * @property {"Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson"} [informationSource] - Source of the request information
 * @property {Reference<"Encounter">} [encounter] - Encounter related to the request
 * @property {Array<Reference<"Any">>} [supportingInformation] - Supporting information for fulfilling the medication
 * @property {string} [authoredOn] - DateTime when the request was initially authored
 * @property {string} [requesterId] - Who or what requested the medication
 * @property {boolean} [reported] - If true, request was reported rather than a primary record
 * @property {CodeableConcept} [performerType] - Desired performer of medication administration
 * @property {Array<Reference<"CareTeam" | "DeviceDefinition" | "HealthcareService" | "Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">>} [performer] - Intended performer of administration
 * @property {Array<CodeableReference<"DeviceDefinition">>} [device] - Intended type of device for administration
 * @property {Reference<"Practitioner" | "PractitionerRole">} [recorder] - Person who entered the request
 * @property {Array<CodeableReference<"Condition" | "Observation">>} [reason] - Reason for ordering the medication
 * @property {CodeableConcept} [courseOfTherapyType] - Overall pattern of medication administration
 * @property {Array<Reference<"ClaimResponse" | "Coverage">>} [insurance] - Associated insurance coverage
 * @property {Array<Annotation>} [note] - Notes about the prescription
 * @property {string} [renderedDosageInstruction] - Full representation of dosage instructions
 * @property {Period} [effectiveDosePeriod] - Period over which medication is taken
 * @property {Array<Dosage>} [dosageInstruction] - Instructions on how to take the medication
 * @property {Object} [dispenseRequest] - Medication supply authorization
 * @property {Object} [dispenseRequest.initialFill] - Details about the first fill
 * @property {Quantity} [dispenseRequest.initialFill.quantity] - First fill quantity
 * @property {Duration} [dispenseRequest.initialFill.duration] - First fill duration
 * @property {Duration} [dispenseRequest.dispenseInterval] - Minimum period between dispenses
 * @property {Period} [dispenseRequest.validityPeriod] - Time period supply is authorized for
 * @property {number} [dispenseRequest.numberOfRepeatsAllowed] - Number of refills authorized
 * @property {Quantity} [dispenseRequest.quantity] - Amount of medication to supply per dispense
 * @property {Duration} [dispenseRequest.expectedSupplyDuration] - Number of days supply per dispense
 * @property {Reference<"Organization">} [dispenseRequest.dispenser] - Intended performer of dispense
 * @property {Array<Annotation>} [dispenseRequest.dispenserInstruction] - Additional information for the dispenser
 * @property {CodeableConcept} [dispenseRequest.doseAdministrationAid] - Type of adherence packaging
 * @property {Object} [substitution] - Restrictions on medication substitution
 * @property {boolean} [substitution.allowedBoolean] - Whether substitution is allowed
 * @property {CodeableConcept} [substitution.allowedCodeableConcept] - Concept indicating substitution allowance
 * @property {CodeableConcept} [substitution.reason] - Reason for allowing or disallowing substitution
 * @property {Array<Reference<"Provenance">>} [eventHistory] - List of events in the lifecycle
 */

/**
 * @typedef {Object} MedicationDispense
 * @property {"MedicationDispense"} resourceType - FHIR resource type.
 * @property {string} identifier - Unique identifier.
 * @property {Array<Reference>} basedOn - CarePlan references.
 * @property {Array<Reference>} partOf - MedicationAdministration or Procedure.
 * @property {"preparation" | "in-progress" | "cancelled" | "on-hold" | "completed" | "entered-in-error" | "stopped" | "declined" | "unknown"} status - Status of the dispense.
 * @property {string} statusChanged - DateTime when status changed.
 * @property {Array<CodeableConcept>} category - Category of medication dispense.
 * @property {string} medication - Reference to Medication resource.
 * @property {string} subject - Patient receiving the medication.
 * @property {string} performer - Who dispensed the medication.
 * @property {string} location - Where dispense occurred.
 * @property {string} authorizingPrescription - MedicationRequest references.
 * @property {string} type - Type of dispense (e.g., trial fill).
 * @property {Quantity} quantity - Amount dispensed.
 * @property {Quantity} daysSupply - Days of medication supplied.
 * @property {string} recorded - DateTime when recording started.
 * @property {string} whenPrepared - DateTime when product was packaged.
 * @property {string} whenHandedOver - DateTime when given to patient.
 * @property {string} destination - Where the medication was sent.
 * @property {string} receiver - Who received the medication.
 * @property {Array<{ authorString: string, time: string, text: string }>} note - Notes about the dispense.
 * @property {string} renderedDosageInstruction - Full dosage instructions.
 * @property {Object} substitution - Substitution details.
 * @property {boolean} substitution.wasSubstituted - Whether substitution occurred.
 * @property {CodeableConcept} substitution.type - Type of substitution.
 * @property {Array<CodeableConcept>} substitution.reason - Reason for substitution.
 * @property {string} substitution.responsibleParty - Who authorized the substitution.
 * @property {Array<Reference>} eventHistory - History of lifecycle events.
 */

export default {};
