import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useVendorDataStore() {
  return actions;
}

async function getVendors(cityCode, limit, filterObj) {
  console.log("getVendors for city - " + cityCode);

  let query = db.collection(cityCode + "_" + Collection.COLL_VENDORS);

  query = constructQuery(query, filterObj);
  const snapshot = await query.limit(limit).get();

  let vendors = [];
  let lastDoc = {};
  snapshot.forEach((doc) => {
    let obj = doc.data();
    vendors.push({ uid: doc.id, ...obj });
    lastDoc = doc;
  });
  console.log(vendors.length);
  console.log(vendors);
  return [vendors, lastDoc];
}

function constructQuery(query, filterObj) {
  if (filterObj) {
    if (filterObj.status) {
      query = query.where("status", "==", filterObj.status);
    }
    if (filterObj.area) {
      query = query.where("address.area", "==", filterObj.area);
    }
    if (filterObj.category) {
      query = query.where("category", "array-contains", filterObj.category);
    }
    if (filterObj.timeline) {
      query = query
        .orderBy(`timeline.${filterObj.timeline.field}`, "asc")
        .startAt(filterObj.timeline.start_date)
        .endAt(filterObj.timeline.end_date);
    } else {
      query = query.orderBy("timeline.request_date", "asc");
    }
    if (filterObj.lastDoc) {
      console.log("last doc present");
      query = query.startAfter(filterObj.lastDoc);
    }
  }
  return query;
}

async function addNewVendorProfile(vendorObj, checkForMobileUniqness) {
  console.log("addNewVendorProfile for " + JSON.stringify(vendorObj));
  if (!vendorObj) {
    throw new Error("invalid vendor Obj");
  }
  if (
    !vendorObj.address ||
    !vendorObj.address.city ||
    !vendorObj.address.city.code
  ) {
    throw new Error("Missing city code");
  }
  const vendorCollRef = db.collection(
    vendorObj.address.city.code + "_" + Collection.COLL_VENDORS
  );
  if (checkForMobileUniqness) {
    console.log("checkForMobileUniqness");
    const snapshot = await vendorCollRef
      .where("contact", "==", vendorObj.contact)
      .limit(1)
      .get();
  
    if (!snapshot.empty) {
      console.log("old vendor exists");
      let oldVendor = {};
      snapshot.forEach((doc) => {
        oldVendor = doc.data();
        return;
      });
      console.log("OLD VENDOR = " + JSON.stringify(oldVendor));
      return [true, oldVendor.name];
    }
  }
  console.log("post unique check");
  await vendorCollRef.add(vendorObj);
  console.log("new vendor added successfully");
  return [false, ""];
}

const actions = {
  getVendors,
  addNewVendorProfile,
};
