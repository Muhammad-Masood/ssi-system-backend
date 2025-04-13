import { EthrDID } from "ethr-did";
import { ES256KSigner, hexToBytes } from "did-jwt";
import { ethers, uuidV4 } from "ethers";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  bytesHexToString,
  contract,
  pinataIPFSGateway,
  provider,
  storeDataOnIPFS,
  stringToBytesHex,
} from "../../../index.js";
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
// import { Patient, MedicationRequest } from "../../types/schema.js";
import { db } from "../../../database/firebase.js";
import { encryptCIDHash } from "../../credential/index.js";

dotenv.config();

// Patient Resource
/**
 * @param {import("../../types/schema.js").Patient} patient
 * @param {string} issuerPrivateKey
 * @param {string} holderAddress
 * @returns {Promise<string>}
 */
const create_patient_resource = async (
  patient,
  issuerPrivateKey,
  holderAddress
) => {
  try {
    // Store on IPFS
    const resourceDocJson = JSON.stringify(patient);
    const resourceCid = await storeDataOnIPFS(resourceDocJson);
    console.log("Credential stored on IPFS with -> ", resourceCid);
    const encryptedResourceCid = encryptCIDHash(resourceCid);
    console.log("Encrypted CID -> ", encryptedResourceCid);
    const encryptedResourceCIDBytes = stringToBytesHex(encryptedResourceCid);
    const signer = new ethers.Wallet(issuerPrivateKey, provider);
    const signer_contract = contract.connect(signer);
    const tx = await signer_contract.setIssuedCertificateHash(
      holderAddress,
      encryptedResourceCIDBytes
    );
    console.log("Transaction Processed: ", tx);
    const patientDoc = await addDoc(collection(db, "fhir_patient"), {
      holderAddress: holderAddress,
      patientId: patient.identifier,
      ipfsHash: resourceCid,
    });
    console.log("Patient resource created and stored in db.");
    return patientDoc.id;
  } catch (error) {
    throw new Error(String(error));
  }
};

/**
 * @param {string} patient_id
 * @returns {Promise<Patient>} patient
 */
const get_patient_resource = async (patient_id) => {
  try {
    const patientResRef = collection(db, "fhir_patient");
    const q = query(patientResRef, where("patientId", "==", patient_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;
    const patientResource = querySnapshot.docs[0].data();
    return patientResource;
  } catch (error) {
    throw new Error(String(error));
  }
};


export {
  create_patient_resource,
  get_patient_resource,
};
