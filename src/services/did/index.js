import {
  createJWT,
  ES256KSigner,
  decodeJWT,
  verifyJWT,
  hexToBytes,
} from "did-jwt";
import { ethers } from "ethers";
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import axios from "axios";
import {
  bytesHexToString,
  contract,
  pinataIPFSGateway,
  provider,
  storeDataOnIPFS,
  stringToBytesHex,
} from "../../index.js";
import crypto from "crypto";
import { db } from "../../database/firebase.js";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
// import dock from "@docknetwork/sdk";
// import { address, secretUri } from "./shared-constants";

/**
 * @returns {string} returns the did
 * @param {string} privateKey
 * @param {"did:ethr" | "did:key"} method
 */
const generateDID = (address, method, subject) => {
  if (method === "did:ethr") {
    return `did:ethr:${subject}:${address}`;
  } else if (method === "did:key") {
    return ``;
  }
};

/**
 * @returns {Promise<*>} returns the jwt token for the did
 * @param {string} subject the topic of the did
 * @param {"did:ethr" | "did:key"} method
 * @param {string} privateKey
 */
// const createDIDJWT = async (subject, privateKey, method) => {
const createDIDJWT = async (subject, privateKey, method) => {
  const signer = ES256KSigner(hexToBytes(privateKey));
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // days
  const signer_ethers = new ethers.Wallet(privateKey, provider);
  const address = signer_ethers.address;
  const did = generateDID(address, method, subject);
  console.log(did);
  const jwt = await createJWT(
    {
      aud: splitDid(did),
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
      exp: expiry,
    },
    {
      issuer: splitDid(did),
      signer,
    },
    {
      alg: "ES256K",
      typ: "JWT",
    }
  );
  const decodedDIDDoc = decodeDIDJWT(jwt);
  const decodedDIDDocJson = JSON.stringify(decodedDIDDoc);
  const decodedDIDDocHash = await storeDataOnIPFS(decodedDIDDocJson);
  console.log("Decoded DID document stored on IPFS with ->", decodedDIDDocHash);
  // store on the blockchain
  const decodedDIDDocHashBytes = stringToBytesHex(decodedDIDDocHash); //0x123456
  const signerContract = contract.connect(signer_ethers);
  const tx = await signerContract.setResolvableDIDHash(decodedDIDDocHashBytes);
  console.log("Transaction Processed: ", tx);

  // store on the database
  // did document id -> user address
  // find the existing document
  try {
    await setDoc(doc(db, "dids", jwt), {
      user: address,
      did: did,
      ipfsHash: decodedDIDDocHash,
    });
  } catch (err) {
    console.log(err);
  }
  return { jwt, decodedDIDDocHash, did };
};

const deleteDIDJWT = async (didJwt, userAddress, privateKey, ipfsHash) => {
  try {
    const didBytes = stringToBytesHex(ipfsHash);
    console.log("didBytes -> ", didBytes);
    // Delete from contract
    const signer_ethers = new ethers.Wallet(privateKey, provider);
    const signerContract = contract.connect(signer_ethers);
    const dids = await signerContract.retrieveResolvableDIDHash(userAddress);
    const didIndex = dids.indexOf(didBytes);
    if (didIndex !== -1) {
      const tx = await signerContract.removeResolvableDIDHash(didIndex);
      console.log("DID Deletion Transaction Processed: ", tx);
      // Delete from database
      const docRef = doc(db, "dids", didJwt);
      await deleteDoc(docRef);
    } else {
      throw new Error(`Failed to delete DID: not found`);
    }
  } catch (error) {
    console.error("Error deleting DID document:", error);
    throw new Error(`Failed to delete DID: ${error.message}`);
  }
};

/**
 * returns the decoded jwt
 * @param {string} jwt
 */
const decodeDIDJWT = (jwt) => {
  return decodeJWT(jwt);
};

export const splitDid = (did) => {
  console.log(did);
  return `did:ethr:${did.split(":")[3]}`;
};

/**
 * Returns the verified DID document
 * @param {string} jwt the jwt to verify
 */
const verifyDIDJwt = async (jwt) => {
  console.log("verifying");
  const resolver = new Resolver({
    ...getResolver({ infuraProjectId: "4f653d2d351148769fd1017be6f45d45" }),
  });
  const decoded_jwt = decodeDIDJWT(jwt);
  console.log("decoded_jwt", decoded_jwt);
  const verificationResponse = await verifyJWT(jwt, {
    resolver,
    audience: decoded_jwt.payload.aud,
  });
  return verificationResponse;
};

const isDIDOnChainVerified = async (userDID, didJWT) => {
  // on-chain verification
  const user_address = userDID.split(":")[2];
  console.log("User address -> ", user_address);
  const provider_contract = contract.connect(provider);
  const userDIDsBytes = await provider_contract.retrieveResolvableDIDHash(
    user_address
  ); // bytes[]
  const userDIDs = userDIDsBytes.map((udid) => bytesHexToString(udid)).filter((udid) => udid !== "");
  console.log(userDIDs);
  let isVerified = false;
  await Promise.all(
    userDIDs.map(async (udid) => {
      // const response = await axios.get(`https://ipfs.io/ipfs/${udid}`);
      const response = await axios.get(`${pinataIPFSGateway}/${udid}`);
      const responseDataAud = response.data.payload.aud;
      const ipfsDIDJWT = response.data.data + "." + response.data.signature;
      console.log(ipfsDIDJWT, didJWT, responseDataAud, userDID);
      if (ipfsDIDJWT === didJWT) {
        console.log("true");
        isVerified = true;
      }
    })
  );
  return isVerified;
};

export {
  createDIDJWT,
  deleteDIDJWT,
  decodeDIDJWT,
  verifyDIDJwt,
  isDIDOnChainVerified,
};
