import { db } from "../firebase";

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

const actions = {
  generateUser,
};
