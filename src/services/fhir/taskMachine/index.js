// Task Machine

import { getDoc, updateDoc } from "firebase/firestore";

/**
 * @param {import("../../../types/schema").Task} task_data
 * @returns {Promise<string>}
 */
const create_task = async (task_data) => {
  try {
    // Store on IPFS
    // const reqDocJson = JSON.stringify(task_data);
    // const reqCid = await storeDataOnIPFS(reqDocJson);
    // console.log("Credential stored on IPFS with -> ", reqCid);
    const taskDoc = await addDoc(
      collection(db, "fhir_task_machine"),
      task_data
    );
    console.log("Task created and stored in db.");
    return taskDoc.id;
  } catch (error) {
    throw new Error(String(error));
  }
};

/**
 * @param {string} task_id
 * @param {import("../../../types/schema").Task} updated_task_data
 * @returns {Promise<string>}
 */
const update_task = async (task_id, updated_task_data) => {
  try {
    // Store on IPFS
    // const reqDocJson = JSON.stringify(task_data);
    // const reqCid = await storeDataOnIPFS(reqDocJson);
    // console.log("Credential stored on IPFS with -> ", reqCid);
    const taskDoc = getDoc(collection(db, "fhir_task_machine"), task_id);
    await updateDoc(taskDoc, updated_task_data);
    console.log("Task updated successfully.");
    return taskDoc.id;
  } catch (error) {
    throw new Error(String(error));
  }
};

/**
 * @param {string} task_id
 * @returns {Promise<import("../../../types/schema").Task>} task_data
 */
const get_task = async (task_id) => {
  try {
    const taskDocRef = collection(db, "fhir_task_machine");
    const q = query(taskDocRef, where("identifier", "==", task_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;
    const taskData = querySnapshot.docs[0].data();
    return taskData;
  } catch (error) {
    console.log(error);
  }
};

export { create_task, update_task, get_task };
