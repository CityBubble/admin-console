import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useAdDataStore() {
  return actions;
}

function getCollectionRef(cityCode) {
  return db
    .collection(Collection.COLL_CITIES)
    .doc(cityCode)
    .collection(Collection.SUB_COLL_ADS);
}

async function addNewAd(adObj) {
  console.log("addNewAd for " + JSON.stringify(adObj));
  if (!adObj) {
    throw new Error("Invalid Ad Obj");
  }
  if (
    !adObj.vendor.address ||
    !adObj.vendor.address.city ||
    !adObj.vendor.address.city.code
  ) {
    throw new Error("Missing city code");
  }

  const adCollRef = getCollectionRef(adObj.vendor.address.city.code);
  const adDocRef = adCollRef.doc();
  console.log("ref id => " + adDocRef.id);
  if (adObj.logoUrl) {
  } else {
    await adDocRef.set(adObj);
    console.log("New ad added successfully");
  }
}

const actions = {
  addNewAd,
};
