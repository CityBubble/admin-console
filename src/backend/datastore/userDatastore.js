import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useUserDataStore() {
  return actions;
}

async function generateUser(newAuthUser, additionalData) {
  console.log("generate user");
  if (!newAuthUser) {
    return;
  }
  const userRef = db.doc(
    `${Collection.COLL_INTERNAL_USERS}/${newAuthUser.uid}`
  );
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    userRef.set({
      contact: additionalData.contact,
      role: additionalData.role,
      email: newAuthUser.email,
      username: additionalData.username,
      createdAt: new Date(),
      lastModifiedOn: new Date(),
    });
    return;
  }
  throw new Error("User record already exists");
}

async function getAuthUserData(authUser) {
  console.log("getUserData");
  if (!authUser) {
    throw new Error("Auth User invalid");
  }
  console.log(authUser.uid);
  const userRef = db.doc(`${Collection.COLL_INTERNAL_USERS}/${authUser.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    throw new Error("User record not found in datastore");
  }
  let userDoc = snapshot.data();
  console.log("USER DOC = " + JSON.stringify(userDoc));
  return userDoc;
}

async function getUserDataByEmail(email) {
  console.log("getUserDataByEmail");
  if (!email) {
    throw new Error("invalid email");
  }
  const snapshot = await db
    .collection(Collection.COLL_INTERNAL_USERS)
    .where("email", "==", email)
    .get();

  if (snapshot.empty) {
    throw new Error("No user registered with email: " + email);
  }
  let user = null;
  snapshot.forEach((doc) => {
    let local = doc.data();
    user = { uid: doc.id, ...local };
    return;
  });

  return user;
}

async function getAllUsers() {
  console.log("getAllUsers");
  const snapshot = await db
    .collection(Collection.COLL_INTERNAL_USERS)
    .orderBy("username", "desc")
    .limit(2)
    .get();

  let users = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    console.log("USER DOC LOCAL= " + JSON.stringify(obj));
    users.push({
      uid: doc.id,
      email: obj.email,
      name: obj.username,
    });
  });
  console.log(users.length);
  console.log(users);
  return users;
}

async function modifyUserData(modifiedUser) {
  console.log("modifyUserData");
  console.log(JSON.stringify(modifiedUser));
  const userDocRef = db
    .collection(Collection.COLL_INTERNAL_USERS)
    .doc(modifiedUser.uid);

  await userDocRef.update(modifiedUser);
  console.log("updated successfully");
}

async function deleteUserData(uid) {
  console.log("deleteUserData");
  console.log("uid: " + uid);
  const userDocRef = db.collection(Collection.COLL_INTERNAL_USERS).doc(uid);

  await userDocRef.delete();
  console.log("deleted successfully");
}

const actions = {
  generateUser,
  getAuthUserData,
  getUserDataByEmail,
  getAllUsers,
  modifyUserData,
  deleteUserData,
};
