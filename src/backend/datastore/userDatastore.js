import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useUserDataStore() {
  return actions;
}

function getCollectionRef() {
  return db.collection(Collection.COLL_INTERNAL_USERS);
}

async function generateUser(newAuthUser, additionalData) {
  console.log("generate user");
  if (!newAuthUser) {
    return;
  }
  const userDocRef = getCollectionRef().doc(newAuthUser.uid);
  const snapshot = await userDocRef.get();

  if (!snapshot.exists) {
    userDocRef.set({
      uid: newAuthUser.uid,
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
  const userDocRef = getCollectionRef().doc(authUser.uid);
  const snapshot = await userDocRef.get();

  if (!snapshot.exists) {
    throw new Error("User record not found in datastore");
  }
  console.log("USER DOC = " + JSON.stringify(snapshot.data()));
  return snapshot.data();
}

async function getUserDataByEmail(email) {
  console.log("getUserDataByEmail");
  if (!email) {
    throw new Error("invalid email");
  }
  const snapshot = await getCollectionRef()
    .where("email", "==", email)
    .limit(1)
    .get();
  if (snapshot.empty) {
    throw new Error("No user registered with email: " + email);
  }
  let user = null;
  snapshot.forEach((doc) => {
    user = doc.data();
    return;
  });
  return user;
}

async function getAllUsers() {
  console.log("getAllUsers");
  const snapshot = await getCollectionRef()
    .orderBy("username", "asc")
    .limit(5)
    .get();

  let users = [];
  snapshot.forEach((doc) => {
    users.push(doc.data());
  });
  return users;
}

async function modifyUserData(modifiedUser) {
  console.log("modifyUserData");
  const userDocRef = getCollectionRef().doc(modifiedUser.uid);
  await userDocRef.update(modifiedUser);
  console.log("updated successfully");
}

async function deleteUserData(uid) {
  console.log("deleteUserData");
  console.log("uid: " + uid);
  const userDocRef = getCollectionRef().doc(uid);
  await userDocRef.delete();
  console.log("deleted successfully");
}

//TODO : remove later
async function tempFunc() {
  console.log("tempFUNC");
  const coll = db
    .collection(Collection.COLL_CITIES)
    .doc("asr")
    .collection(Collection.SUB_COLL_VENDORS);

  const snapshot = await coll.get();

  snapshot.forEach(async (doc) => {
    let vendor = doc.data();
    console.log("vendor ->" + vendor.name);

    if (
      vendor.subscription &&
      vendor.subscription.status === "subscribed" &&
      !vendor.subscription.current_plan.ad_gallery
    ) {
      console.log(JSON.stringify(vendor.subscription));
      vendor.subscription.current_plan.ad_gallery = 4;

      const vdoc = coll.doc(vendor.uid);
      await vdoc.update(vendor);
      console.log(
        "updated -> " +
          vendor.name +
          " gallery = " +
          vendor.subscription.current_plan.ad_gallery
      );
    }
  });
}

//TODO : remove later
async function tempFuncAds() {
  console.log("tempFuncAds");
  const coll = db
    .collection(Collection.COLL_CITIES)
    .doc("asr")
    .collection(Collection.SUB_COLL_ADS);

  const snapshot = await coll.get();

  snapshot.forEach(async (doc) => {
    let ad = doc.data();
    let vendor = ad.vendor;
    console.log("ad ->" + vendor.name);

    if (!ad.vendor.labels) {
      console.log(JSON.stringify(ad));
      ad.vendor.labels = [];
      const adoc = coll.doc(doc.id);
      await adoc.update(ad);
      console.log("updated -> " + vendor.name + " labels = " + ad.gallery);
    }
  });
}

const actions = {
  generateUser,
  getAuthUserData,
  getUserDataByEmail,
  getAllUsers,
  modifyUserData,
  deleteUserData,
};
