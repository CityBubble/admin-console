import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useVendorDataStore() {
  return actions;
}

async function getVendors(cityCode, limit, filterObj) {
  console.log("getVendors for city - " + cityCode);

  let query = db
    .collection(cityCode + "_" + Collection.COLL_VENDORS);
    
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
      query = query.where("area", "==", filterObj.area);
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

const actions = {
  getVendors,
};
