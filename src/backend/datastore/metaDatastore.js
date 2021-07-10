import Collection from "../collectionConstants";
import { db } from "../firebase";

export function useMetaDataStore() {
  return actions;
}

function getCityCollectionRef() {
  return db.collection(Collection.COLL_CITIES);
}

async function addCity(cityObj) {
  console.log("addCity for " + JSON.stringify(cityObj));
  if (!cityObj) {
    throw new Error("invalid vendor Obj");
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

const actions = {
  addCity,
  getCities,
};
