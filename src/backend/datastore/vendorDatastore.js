import { db } from "../firebase";
import Collection from "../collectionConstants";


export function useVendorDataStore() {
  return actions;
}

async function getVendors(cityCode, limit) {
    console.log("getVendors for city - " + cityCode);
    const snapshot = await db
    .collection(cityCode+'_'+Collection.COLL_VENDORS, cityCode)
    .limit(limit)
    .get();

  let vendors = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    console.log("VENDOR DOC LOCAL= " + JSON.stringify(obj));
    vendors.push({ uid: doc.id , ...obj});
  });
  console.log(vendors.length);
  console.log(vendors);
  return vendors; 
}


const actions = {
  getVendors
};
