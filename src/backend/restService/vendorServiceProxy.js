import Collection from "../collectionConstants";
import { db, storage } from "../firebase";

export function useVendorService() {
  return actions;
}

function getVendorCollectionRef(cityCode) {
  return db
    .collection(Collection.COLL_CITIES)
    .doc(cityCode)
    .collection(Collection.SUB_COLL_VENDORS);
}

function getVendorStorageRef(cityCode, uid) {
  return storage.ref(`/${cityCode}/${Collection.SUB_COLL_VENDORS}/${uid}`);
}

async function getVendorProfileForReview(cityCode, authUser) {
  console.log("getVendorProfileForReview for city - " + cityCode);
  const query = getVendorCollectionRef(cityCode).where(
    "profile_status",
    "==",
    "queued"
  );
  const snapshot = await query.limit(1).get();
  let vendor = null;
  snapshot.forEach((doc) => {
    vendor = doc.data();
  });
  return vendor;
}

async function approveProfile(profile) {
  console.log("approveVendorProfile for city - " + profile.address.city.code);
  console.log(JSON.stringify(profile));
  profile = addMetaInfoToVendorProfile(profile);
  console.log("final profile = " + JSON.stringify(profile));
  const vendorColl = getVendorCollectionRef(profile.address.city.code);
  await vendorColl.doc(profile.uid).update(profile);
  console.log("Profile verified successfully");
}

function addMetaInfoToVendorProfile(profile) {
  const today = new Date();
  let expiryDate = new Date(today);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  console.log("TODAY = " + today);
  console.log("EXPIRY = " + expiryDate);

  profile.timeline = { ...profile.timeline, verify_date: today };
  profile.profile_status = "verified";
  profile.subscription = {
    status: "subscribed",
    current_plan: getDefaultPlan(today, expiryDate),
    next_plan_purchased: false,
  };
  profile.pending_dues = false;
  profile.due_cycle_start_date = today;
  profile.due_cycle_end_date = expiryDate;

  return profile;
}

function getDefaultPlan(today, expiryDate) {
  let current_plan = {
    plan: "premium",
    priority: 2,
    variant: {
      unit: "month",
      duration: 1,
      price: 200,
    },
    coupon_cost: 20,
    start_date: today,
    expiry_date: expiryDate,
  };
  return current_plan;
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
  getVendorProfileForReview,
  approveProfile,
};
