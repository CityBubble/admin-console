import { db } from "../firebase";
import Collection from "../collectionConstants";
import { generateCollectionName} from '../../util/Utility'

export function useVendorDataStore() {
  return actions;
}

function getVendors(cityCode, limit) {
    console.log("getVendors");
    console.log(generateCollectionName(Collection.COLL_VENDORS, cityCode));
 
    const snapshot = await db
    .collection(generateCollectionName(Collection.COLL_VENDORS, cityCode))
    .limit(limit)
    .get();

  let vendors = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    console.log("VENDOR DOC LOCAL= " + JSON.stringify(obj));
    vendors.push({ ...obj});
  });
  console.log(vendors.length);
  console.log(vendors);
  return vendors; 
}


const actions = {};
