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

async function getAds(cityCode, limit, filterObj) {
  console.log("getAds for city - " + cityCode);
  let query = getCollectionRef(cityCode);

  query = constructQuery(query, filterObj);
  const snapshot = await query.limit(limit).get();

  let ads = [];
  let lastDoc = {};
  snapshot.forEach((doc) => {
    let obj = doc.data();
    ads.push({ uid: doc.id, ...obj });
    lastDoc = doc;
  });
  console.log(ads.length);
  console.log(ads);
  return [ads, lastDoc];
}

function constructQuery(query, filterObj) {
  if (filterObj) {
    if (filterObj.vendor) {
      query = query.where("vendor.name", "==", filterObj.vendor);
    }
    if (filterObj.priority) {
      query = query.where("priority", "==", filterObj.priority);
    }
    if (filterObj.status) {
      query = query.where("ad_status.status", "==", filterObj.status);
    }
    if (filterObj.area) {
      query = query.where("vendor.address.area", "==", filterObj.area);
    }
    if (filterObj.category) {
      query = query.where(
        "vendor.category",
        "array-contains",
        filterObj.category
      );
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
      console.log("last ad doc present");
      query = query.startAfter(filterObj.lastDoc);
    }
  }
  return query;
}

async function getAdsForModification(cityCode, vendorName) {
  console.log(
    "getAdsForModification for city - " +
      cityCode +
      " vendorName = " +
      vendorName
  );
  let query = getCollectionRef(cityCode)
    .where("vendor.name", "==", vendorName)
    .where("ad_status.status", "in", ["active", "freeze"])
    .orderBy("timeline.publish_date", "desc");

  const snapshot = await query.limit(15).get();

  let ads = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    ads.push({ uid: doc.id, ...obj });
  });
  console.log(ads);
  return ads;
}

async function modifyAd(cityCode, modifiedAd) {
  console.log("modify Ad data for city- " + cityCode);
  if (!cityCode || !modifiedAd) {
    throw new Error("Invalid Arguments");
  }
  const adDocRef = getCollectionRef(cityCode).doc(modifiedAd.uid);
  await adDocRef.update(modifiedAd);
  console.log("ad updated successfully");
}

const actions = {
  addNewAd,
  getAds,
  getAdsForModification,
  modifyAd,
};
