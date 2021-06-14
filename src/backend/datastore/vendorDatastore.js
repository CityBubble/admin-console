import Constants from "../../util/Constants";
import Collection from "../collectionConstants";
import { db, storage } from "../firebase";

export function useVendorDataStore() {
  return actions;
}

function getCollectionRef(cityCode) {
  return db
    .collection(Collection.COLL_CITIES)
    .doc(cityCode)
    .collection(Collection.SUB_COLL_VENDORS);
}

function getVendorStorageRef(cityCode, uid) {
  return storage.ref(`/${cityCode}/${Collection.SUB_COLL_VENDORS}/${uid}`);
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
    if (filterObj.profile_status) {
      query = query.where("profile_status", "==", filterObj.profile_status);
    }
    if (filterObj.subscription_status) {
      query = query.where(
        "subscription.status",
        "==",
        filterObj.subscription_status
      );
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

async function getVendorBySearchField(
  cityCode,
  searchField,
  searchVal,
  onlyVerifiedProfiles = true
) {
  console.log("getVendorBySearchField for city - " + cityCode);
  if (!cityCode || !searchField || !searchVal) {
    throw new Error("Invalid Arguments");
  }
  console.log("filed = " + searchField);
  console.log("val = " + searchVal);
  let query = getCollectionRef(cityCode)
    .where(searchField, "==", searchVal)
    .orderBy("timeline.request_date", "asc");
  if (onlyVerifiedProfiles) {
    query = query.where(
      "profile_status",
      "==",
      Constants.VENDOR_PROFILE_VERIFY_STATUS
    );
  }
  const snapshot = await query.get();

  if (snapshot.empty) {
    /*change in this error msg should be reconciled with CreateVendorProfile.js
    for it checks for the string matching.*/
    throw new Error("No record found!");
  }
  let vendors = [];
  snapshot.forEach((doc) => {
    vendors.push({ uid: doc.id, ...doc.data() });
  });
  return vendors;
}

async function modifyVendorData(cityCode, modifiedVendor) {
  console.log("modify Vendor data for city- " + cityCode);
  if (!cityCode || !modifiedVendor) {
    throw new Error("Invalid Arguments");
  }

  if (modifiedVendor.newProfileImg) {
    console.log("profile image found");
    const fileUrl = await uploadVendorLogo(
      cityCode,
      modifiedVendor.uid,
      modifiedVendor.newProfileImg
    );
    if (fileUrl) {
      modifiedVendor["logoUrl"] = fileUrl;
      delete modifiedVendor.newProfileImg;
      console.log("Image uploaded successfully");
    } else {
      throw new Error("Could not obtain file URL. Try later");
    }
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

async function addNewVendorProfile(vendorObj) {
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
  const vendorDocRef = vendorCollRef.doc();
  console.log("ref id => " + vendorDocRef.id);
  if (vendorObj.logoUrl) {
    const fileUrl = await uploadVendorLogo(
      vendorObj.address.city.code,
      vendorDocRef.id,
      vendorObj.logoUrl
    );
    if (fileUrl) {
      vendorObj["logoUrl"] = fileUrl;
      await vendorDocRef.set(vendorObj);
      console.log("New vendor added successfully");
    } else {
      throw new Error("Could not obtain file URL. Try later");
    }
  } else {
    await vendorDocRef.set(vendorObj);
    console.log("New vendor added successfully");
  }
}

async function uploadVendorLogo(cityCode, docId, imgFile) {
  console.log("UPLOADING IMAGE");
  const storageRef = getVendorStorageRef(cityCode, docId);
  const logoImgRef = storageRef.child("logo");
  await logoImgRef.put(imgFile);
  const fileUrl = await logoImgRef.getDownloadURL();
  console.log("OBTAINED URL => " + fileUrl);
  return fileUrl;
}

const actions = {
  getVendors,
  addNewVendorProfile,
  getVendorBySearchField,
  modifyVendorData,
  deleteVendorData,
};
