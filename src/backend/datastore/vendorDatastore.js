import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useVendorDataStore() {
  return actions;
}

function getCollectionRef(cityCode) {
  return db.collection(cityCode + "_" + Collection.COLL_VENDORS);
}

async function getVendors(cityCode, limit, filterObj) {
  console.log("getVendors for city - " + cityCode);

  let query = getCollectionRef(cityCode);

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

  const vendorCollRef = getCollectionRef(vendorObj.address.city.code);
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

async function getVendorBySearchField(cityCode, searchField, searchVal) {
  console.log("getVendorBySearchField for city - " + cityCode);
  if (!cityCode || !searchField || !searchVal) {
    throw new Error("Invalid Arguments");
  }
  console.log("filed = " + searchField);
  console.log("val = " + searchVal);
  const vendorCollRef = getCollectionRef(cityCode);

  const snapshot = await vendorCollRef
    .where(searchField, "==", searchVal)
    .orderBy("timeline.request_date", "asc")
    .get();
  if (snapshot.empty) {
    throw new Error("No record found ..");
  }

  let vendors = [];
  snapshot.forEach((doc) => {
    vendors.push({ uid: doc.id, ...doc.data() });
    return;
  });
  return vendors;
}

async function modifyVendorData(cityCode, modifiedVendor) {
  console.log("modify Vendor data for city- " + cityCode);
  if (!cityCode || !modifiedVendor) {
    throw new Error("Invalid Arguments");
  }
  const vendorDocRef = getCollectionRef(cityCode).doc(modifiedVendor.uid);
  // call cloud function on edit event to update all ads data with latest vals
  await vendorDocRef.update(modifiedVendor);
  console.log("vendor updated successfully");
}

async function deleteVendorData(cityCode, uid) {
  console.log("deleteVendorData for cityCode = " + cityCode);
  console.log("uid: " + uid);
  if (!cityCode || !uid) {
    throw new Error("Invalid Arguments");
  }
  const vendorDocRef = getCollectionRef(cityCode).doc(uid);
  await vendorDocRef.delete();
  console.log(`${uid} deleted successfully`);
}

const actions = {
  getVendors,
  addNewVendorProfile,
  getVendorBySearchField,
  modifyVendorData,
  deleteVendorData,
};
