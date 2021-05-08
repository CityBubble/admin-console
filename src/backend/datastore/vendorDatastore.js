import { db } from "../firebase";
import Collection from "../collectionConstants";

export function useVendorDataStore() {
  return actions;
}

async function getVendors(cityCode, filterObj) {
  console.log("getVendors for city - " + cityCode);

  let query = db.collection(cityCode + "_" + Collection.COLL_VENDORS);
  query = constructQuery(query, filterObj);
  const snapshot = await query
    .limit(Collection.COLL_VENDORS_SEARCH_LIMIT)
    .get();

  let vendors = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    console.log("VENDOR DOC LOCAL= " + JSON.stringify(obj));
    vendors.push({ uid: doc.id, ...obj });
  });
  console.log(vendors.length);
  console.log(vendors);
  return vendors;
}

function constructQuery(query, filterObj) {
  console.log("FILTER = " + JSON.stringify(filterObj));
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
    // if (filterObj.timeline) {
    //   console.log(filterObj.timeline.from);
    //   query = query
    //     .orderBy(`timeline.${filterObj.timeline.field}`)
    //     .startAt(filterObj.timeline.start_date)
    //     .endAt(filterObj.timeline.end_date);
    // }
  }
  return query;
}

const actions = {
  getVendors,
};
