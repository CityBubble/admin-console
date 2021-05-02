import { db } from "./firebase";

export function useDataStore() {
  return actions;
}

async function generateUser(newAuthUser, additionalData) {
  console.log("generate user");
  if (!newAuthUser) {
    return;
  }
  const userRef = db.doc(`internal_users/${newAuthUser.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    userRef.set({
      contact: additionalData.contact,
      role: additionalData.role,
      email: newAuthUser.email,
      username: additionalData.username,
      createdAt: new Date(),
    });
    return;
  }
  throw new Error("User record already exists");
}

async function getUserData(authUser) {
  console.log("getUserData");
  if (!authUser) {
    throw new Error("User id invalid");;
  }
   console.log(authUser.uid);
  const userRef = db.doc(`internal_users/${authUser.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    throw new Error("User record not found in datastore");
  }
  let userDoc = snapshot.data();
  console.log("USER DOC = " + JSON.stringify(userDoc));
  return snapshot.data();
}

const actions = {
  generateUser,
  getUserData,
};
