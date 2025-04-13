import dotenv from "dotenv";
import CryptoJS from "crypto-js";
import axios from "axios";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { storeDataOnIPFS } from "../../../index.js";
import { db } from "../../../database/firebase.js";

dotenv.config();

// Medications
/**
 * @param {import("../../types/schema.js").MedicationRequest} medication_request_data
 * @returns {Promise<string>}
 */
const create_medication_request = async (medication_request_data) => {
  try {
    // Store on IPFS
    const reqDocJson = JSON.stringify(medication_request_data);
    const reqCid = await storeDataOnIPFS(reqDocJson);
    console.log("Credential stored on IPFS with -> ", reqCid);
    const medReqDoc = await addDoc(collection(db, "fhir_medication_request"), {
      medReqId: medication_request_data.identifier,
      ipfsHash: reqCid,
    });
    console.log("Medication Request created and stored in db.");
    return medReqDoc.id;
  } catch (error) {
    throw new Error(String(error));
  }
};

/**
 * @param {string} med_req_id
 * @returns {Promise<import("../../types/schema.js").MedicationRequest>} medication request
 */
const get_medication_request = async (med_req_id) => {
  try {
    const medReqRef = collection(db, "fhir_medication_request");
    const q = query(medReqRef, where("medReqId", "==", med_req_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;
    const medicationRequest = querySnapshot.docs[0].data();
    return medicationRequest;
  } catch (error) {
    console.log(error);
  }
};

/**
 * @param {import("../../../types/schema.js").MedicationDispense} medication_dispense_data
 * @returns {Promise<string>}
 */
const create_medication_dispense = async (medication_dispense_data) => {
  try {
    // Store on IPFS
    const dispDocJson = JSON.stringify(medication_dispense_data);
    const cid = await storeDataOnIPFS(dispDocJson);
    console.log("Credential stored on IPFS with -> ", cid);
    const medDispDoc = await addDoc(
      collection(db, "fhir_medication_dispense"),
      {
        medDispId: medication_dispense_data.identifier,
        ipfsHash: cid,
      }
    );
    console.log("Medication Dispense created and stored in db.");
    return medDispDoc.id;
  } catch (error) {
    throw new Error(String(error));
  }
};

/**
 * @param {string} med_disp_id
 * @returns {Promise<import("../../types/schema.js").MedicationDispense>} medication dispense
 */
const get_medication_dispense = async (med_disp_id) => {
  try {
    const medDispRef = collection(db, "fhir_medication_dispense");
    const q = query(medDispRef, where("medDispId", "==", med_disp_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;
    const medicationDispense = querySnapshot.docs[0].data();
    return medicationDispense;
  } catch (error) {
    console.log(error);
  }
};

export {
  create_medication_request,
  get_medication_request,
  create_medication_dispense,
  get_medication_dispense,
};
