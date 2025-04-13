import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation,
} from "did-jwt-vc";
import { getResolver } from "ethr-did-resolver";
import { Resolver } from "did-resolver";
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
} from "../../index.js";
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
import { db } from "../../database/firebase.js";

dotenv.config();

const issuer = new EthrDID({
  identifier: "0x1F4D71254a9175c13c6e8ff441f42D4aE42487De",
  privateKey:
    "f013ecdaeaa6955889a6a38e67f391b67d328dd9b3afbc6574ac35c88fd5d0b3",
});

// User Credential Request
const submitVcRequest = async (reqData) => {
  try {
    console.log(reqData);
    const { userPrivateKey, ...data } = reqData;
    // Generate JWS Signature using private key
    const jws = "";
    const reqDoc = await addDoc(collection(db, "vc_requests"), {
      type: "bank-id",
      jws: jws,
      ...data,
    });
    return reqDoc.id;
  } catch (error) {
    console.log(error);
  }
};

const getVcRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "vc_requests"));
    const requests = querySnapshot.docs.map((doc) => doc.data());
    return requests;
  } catch (error) {
    console.log(error);
  }
};

const getUserVcRequests = async (userId) => {
  try {
    const vcReqRef = collection(db, "vc_requests");
    const q = query(vcReqRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => doc.data());
    return docs;
  } catch (error) {
    console.log(error);
  }
};

const generateMedicalVcPayload = () => {};

const generateBankIdVcPayload = (
  fullName,
  birthDate,
  nationalID,
  holderDID,
  jwsSignature
) => {
  const vcId = uuidV4();
  const issuanceDate = new Date().toISOString();

  const bankIDVCPayload = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.affinidi.com/NorwegianBankIDV1V1-0.jsonld",
    ],
    id: `claimId:${vcId}`,
    type: ["VerifiableCredential", "NorwegianBankIDV1"],
    holder: {
      id: holderDID,
    },
    issuer: "https://www.signicat.com",
    issuanceDate,
    credentialSubject: {
      data: {
        "@type": "Person",
      },
      birthDate: {
        "@type": "Date",
        date: birthDate,
      },
      name: {
        "@type": "Name",
        name: fullName,
      },
      nationalID: nationalID,
    },
    certificate: {
      certificateIssuer: "Government",
      certificateUniqueID: uuidV4(),
      // certificateExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
      country: "NO",
    },
    credentialStatus: {
      id: "https://www.signicat.com/status/100",
      type: "CredentialStatusList2017",
    },
    credentialSchema: {
      id: "https://schema.affinidi.com/NorwegianBankIDV1V1-0.json",
      type: "JsonSchemaValidator2018",
    },
    proof: {
      type: "RsaSignature2018",
      created: issuanceDate,
      proofPurpose: "assertionMethod",
      verificationMethod: "https://signicat.com/issuers/144223#key-1",
      jws: jwsSignature, // Dummy JWS signature
    },
  };
  return bankIDVCPayload;
};

const createBankIdVc = async (
  fullName,
  birthDate,
  holderDID,
  nationalID,
  issuerPrivateKey
) => {
  const bankIdVcPayload = generateBankIdVcPayload(
    fullName,
    birthDate,
    nationalID,
    holderDID,
    "jwsSignature"
  );
  const vcDocJson = JSON.stringify(bankIdVcPayload);
  const cid = await storeDataOnIPFS(vcDocJson);
  console.log("Credential stored on IPFS with -> ", cid);
  const encryptedCID = encryptCIDHash(cid);
  console.log("Encrypted CID -> ", encryptedCID);
  const encryptedCIDBytes = stringToBytesHex(encryptedCID);
  const holderAddress = holderDID.split(":")[2];
  const signer = new ethers.Wallet(issuerPrivateKey, provider);
  const signer_contract = contract.connect(signer);
  const tx = await signer_contract.setIssuedCertificateHash(
    holderAddress,
    encryptedCIDBytes
  );
  console.log("Transaction Processed: ", tx);
  return cid;
};

/**
 * Creates a Verifiable Credential
 * @param {*} vcPayload - The payload of the verifiable credential
 * @param {string} issuerDID - The did of the issuer
 * @param {string} issuerPrivateKey - The private key of the issuer
 */
const createVerifiableCredential = async (
  vcPayload,
  issuerDID,
  issuerPrivateKey
) => {
  const issuer = {
    did: issuerDID,
    signer: ES256KSigner(hexToBytes(issuerPrivateKey)),
  };
  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);
  // store credential document on IPFS
  const resolver = new Resolver({
    ...getResolver({ infuraProjectId: "4f653d2d351148769fd1017be6f45d45" }),
  });
  const vcDoc = await verifyCredential(vcJwt, resolver);
  const vcDocJson = JSON.stringify(vcDoc);
  const cid = await storeDataOnIPFS(vcDocJson);
  console.log("Credential stored on IPFS with -> ", cid);
  const encryptedCID = encryptCIDHash(cid);
  console.log("Encrypted CID -> ", encryptedCID);
  const encryptedCIDBytes = stringToBytesHex(encryptedCID);
  const holderDID = vcPayload.sub;
  const holderAddress = holderDID.split(":")[2];
  const signer = new ethers.Wallet(issuerPrivateKey, provider);
  const signer_contract = contract.connect(signer);
  const tx = await signer_contract.setIssuedCertificateHash(
    holderAddress,
    encryptedCIDBytes
  );
  console.log("Transaction Processed: ", tx);
  return { vcJwt, encryptedCIDBytes };
};

/**
 * @param {string} vcJwt
 * @returns the resolved verifiable credential
 */
const verifyCredentialJWT = async (vcJwt) => {
  const resolver = new Resolver({
    ...getResolver({ infuraProjectId: "4f653d2d351148769fd1017be6f45d45" }),
  });
  const verifiedVC = await verifyCredential(vcJwt, resolver);
  return verifiedVC;
};

const isCertificateOnChainVerified = async (
  issuerDID,
  holderDID,
  // privateKey,
  jwt
) => {
  // on-chain verification
  const issuer_address = issuerDID.split(":")[2];
  const holder_address = holderDID.split(":")[2];
  const signer_contract = contract.connect(provider);
  const userIssuedCertificates = await signer_contract.userToIssuedCertificates(
    issuer_address
  );
  const userOwnedCertificates = await signer_contract.userToOwnedCertificates(
    holder_address
  );
  console.log("userIssuedCertificates -> ", userIssuedCertificates);
  console.log("userOwnedCertificates -> ", userOwnedCertificates);
  const matchingCertificates = userIssuedCertificates.filter((icid) =>
    userOwnedCertificates.find((ocid) => ocid === icid)
  );
  let isVerified = false;
  await Promise.all(
    matchingCertificates.map(async (m_encCID) => {
      const m_encCIDBytes = bytesHexToString(m_encCID);
      const mCID = decryptCIDHash(m_encCIDBytes);
      console.log("decrypted CID -> ", mCID);
      if (mCID) {
        // const response = await axios.get(`https://ipfs.io/ipfs/${mCID}`);
        const response = await axios.get(`${pinataIPFSGateway}/${mCID}`);
        const fetchedJWT = response.data.jwt;
        console.log("Fetched from IPFS -> ", fetchedJWT);
        if (fetchedJWT === jwt) {
          isVerified = true;
        }
      }
    })
  );
  return isVerified;
};

/**
 * Creates a Verifiable Credential
 * @param {*} vpPayload - The payload of the verifiable credential
 * @param {string} issuerDID - The did of the issuer
 * @param {string} issuerPrivateKey - The private key of the issuer
 */
const createVCPresentation = async (vpPayload, issuerDID, issuerPrivateKey) => {
  const issuer = {
    did: issuerDID,
    signer: ES256KSigner(hexToBytes(issuerPrivateKey)),
  };
  const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer);
  return vpJwt;
};

/**
 * @param {string} vcJwt
 * @returns the resolved verifiable credential
 */
const verifyCredentialPresentation = async (vpJwt) => {
  const resolver = new Resolver({
    ...getResolver({ infuraProjectId: "4f653d2d351148769fd1017be6f45d45" }),
  });
  const verifiedPresentation = await verifyPresentation(vpJwt, resolver);
  return verifiedPresentation;
};

const encryptCIDHash = (cidHash) => {
  // const secret_key = crypto.randomBytes(16).toString("hex");
  // const secret_nonce = crypto.randomBytes(12).toString("hex");
  // const secret_key = "8ad03876c4e68dc3b3ec491a"
  // const secret_nonce = "ec79eb3e97d08c7e5a4bc3959cbd0d3d"
  const key = Buffer.from(process.env.SECRET_KEY, "hex");
  const nonce = Buffer.from(process.env.SECRET_NONCE, "hex");
  const cipher = crypto.createCipheriv("aes-128-gcm", key, nonce);
  const encrypted = Buffer.concat([
    cipher.update(cidHash, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag(); // Get the authentication tag
  return Buffer.concat([encrypted, tag]).toString("base64");

  // const argsHash = CryptoJS.SHA256(process.env.ENCODE_BUFFER_SECRET).toString(
  //   CryptoJS.enc.Hex
  // );
  // const encryptedAES = CryptoJS.AES.encrypt(cidHash, argsHash, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7,
  // });
  // return encryptedAES.toString();
  // const keyBuffer = Buffer.from(privateKey, "hex");
  // const ivBuffer = Buffer.from(process.env.ENCODE_BUFFER_SECRET, "base64");
  // console.log(keyBuffer, ivBuffer);
  // if (ivBuffer.length !== 12) {
  // throw new Error("Invalid IV length. IV must be 12 bytes long.");
  // }
  // const cipher = crypto.createCipheriv("aes-256-ccm", keyBuffer, ivBuffer, {
  // authTagLength: 16,
  // });
  // const encrypted = Buffer.concat([cipher.update(cidHash), cipher.final()]);
  // return encrypted.toString("hex");
};

/**
 * @param {string} encryptedCID
 * @returns
 */
const decryptCIDHash = (encryptedCID) => {
  // console.log(privateKey, encryptedCID);
  // const argsHash = CryptoJS.SHA256(process.env.ENCODE_BUFFER_SECRET).toString(
  //   CryptoJS.enc.Hex
  // );
  // const decrypted = CryptoJS.AES.decrypt(encryptedCID, argsHash, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7,
  // });
  // const keyBuffer = Buffer.from(privateKey, "hex");
  // const ivBuffer = Buffer.from(process.env.ENCODE_BUFFER_SECRET, "base64");
  // const encrypted = Buffer.from(encryptedCID, "hex");
  // const decipher = crypto.createDecipheriv("aes-256-", keyBuffer, ivBuffer, {
  //   authTagLength: 16,
  // });
  // console.log(decipher);
  // const decrypted = Buffer.concat([
  //   decipher.update(encrypted),
  //   decipher.final(),
  // ]);
  // console.log(decrypted.toString());
  // console.log(decrypted.toString(CryptoJS.enc.Utf8));
  // return decrypted.toString(CryptoJS.enc.Utf8);
  // const secret_key = "8ad03876c4e68dc3b3ec491a"
  // const secret_nonce = "ec79eb3e97d08c7e5a4bc3959cbd0d3d"
  const key = Buffer.from(process.env.SECRET_KEY, "hex");
  const nonce = Buffer.from(process.env.SECRET_NONCE, "hex");
  const buffer = Buffer.from(encryptedCID, "base64");
  const encryptedText = buffer.slice(0, -16); // All but the last 16 bytes
  const tag = buffer.slice(-16); // Last 16 bytes is the tag

  const decipher = crypto.createDecipheriv("aes-128-gcm", key, nonce);
  decipher.setAuthTag(tag); // Set the authentication tag
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

const revokeCIDHash = async (issuerPrivateKey, cidHash, endTime) => {
  // encrypt hash
  const encryptedCID = encryptCIDHash(cidHash);
  const encryptedCIDBytes = stringToBytesHex(encryptedCID);
  console.log(encryptedCIDBytes);
  if (endTime) {
    // update DB -> Temporarily
    const credentialsRef = collection(db, "credentials");
    const q = query(
      credentialsRef,
      where("vc_encrypted_hash", "==", encryptedCIDBytes)
    );
    const querySnapshot = await getDocs(q);
    const formattedEndDate = new Date(endTime);
    const firestoreEndDate = Timestamp.fromDate(formattedEndDate);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (docSnap) => {
        const docRef = doc(db, "credentials", docSnap.id); // Get document reference
        // Update the `revocation_end_time` field
        await updateDoc(docRef, {
          revocation_end_time: new Date(firestoreEndDate), // Firestore Timestamp
        });
        console.log(`Updated revocation_end_time for document: ${docSnap.id}`);
      });
    } else {
      console.log("No document found with this encrypted hash.");
    }
  } else {
    const signer = new ethers.Wallet(issuerPrivateKey, provider);
    const signer_contract = contract.connect(signer);
    const tx = await signer_contract.revokeCertificate(encryptedCIDBytes);
    console.log("Transaction Processed: ", tx);
  }
};

// Check if the provided CID has been revoked
// Encrypts the CID ipfs hash and convert into bytes to pass into the contract call
const getRevokedCIDs = async (issuerAddress) => {
  const provider_contract = contract.connect(provider);
  const issuerRevokedCids = await provider_contract.addressToRevokedCIDS(
    issuerAddress
  ); // bytes[]
  const issuerRevokedCidsStr = issuerRevokedCids.map((cid) =>
    bytesHexToString(cid)
  ); // string[] encrypted
  const issuerRevokedCidsStrDecryp = issuerRevokedCidsStr.map((cid) =>
    decryptCIDHash(cid)
  );
  console.log("decryp -> ", issuerRevokedCidsStrDecryp);
  return issuerRevokedCidsStrDecryp;
};

export {
  createVerifiableCredential,
  verifyCredentialJWT,
  verifyCredentialPresentation,
  createVCPresentation,
  isCertificateOnChainVerified,
  decryptCIDHash,
  encryptCIDHash,
  revokeCIDHash,
  getRevokedCIDs,
  generateBankIdVcPayload,
  createBankIdVc,
  submitVcRequest,
  getVcRequests,
  getUserVcRequests,
};
