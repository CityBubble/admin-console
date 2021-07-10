import Collection from "../collectionConstants";
import { db, firestore } from "../firebase";

export function useMetaDataStore() {
  return actions;
}

function getCityCollectionRef() {
  return db.collection(Collection.COLL_CITIES);
}

function getCategoryCollectionRef() {
  return db.collection(Collection.COLL_CATEGORIES);
}

async function addCity(cityObj) {
  console.log("addCity for " + JSON.stringify(cityObj));
  if (!cityObj) {
    throw new Error("invalid city Obj");
  }
  if (!cityObj.code || !cityObj.name) {
    throw new Error("Missing city info");
  }
  const cityCollRef = getCityCollectionRef();
  const cityDocRef = cityCollRef.doc(cityObj.code);
  await cityDocRef.set(cityObj);
  console.log("New city added successfully");
}

async function getCities() {
  console.log("getCities");
  const cityCollRef = getCityCollectionRef();
  const snapshot = await cityCollRef.get();
  let cities = [];
  snapshot.forEach((doc) => {
    cities.push(doc.data());
  });
  return cities;
}

async function addParent(parentObj) {
  console.log("addParent for " + JSON.stringify(parentObj));
  if (!parentObj) {
    throw new Error("invalid parent Obj");
  }
  const categoryCollRef = getCategoryCollectionRef();
  const parentDocRef = categoryCollRef.doc(
    Collection.COLL_CATEGORIES_PARENT_DOC
  );
  await parentDocRef.set(
    {
      values: firestore.FieldValue.arrayUnion(parentObj),
    },
    { merge: true }
  );
  console.log("New parent added successfully");
}

async function getParentCategories() {
  console.log("getParentCategories");
  const categoryCollRef = getCategoryCollectionRef();
  const snapshot = await categoryCollRef
    .doc(Collection.COLL_CATEGORIES_PARENT_DOC)
    .get();
  if (!snapshot.exists) {
    return [];
  }
  return snapshot.data().values;
}

async function getCategoryNames() {
  console.log("getCategoryNames");
  const categoryCollRef = getCategoryCollectionRef();
  const snapshot = await categoryCollRef
    .doc(Collection.COLL_CATEGORIES_ALL_DOC)
    .get();
  if (!snapshot.exists) {
    return [];
  }
  return snapshot.data().values;
}

const actions = {
  addCity,
  getCities,
  addParent,
  getParentCategories,
  getCategoryNames,
};
