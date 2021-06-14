import Constants from "../../util/Constants";
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
  const vendorCollRef = getVendorCollectionRef(cityCode);
  let query = getQueryForInCompleteSession(vendorCollRef, authUser);
  let snapshot = await query.limit(1).get();
  if (snapshot.empty) {
    query = getQueryForInCompleteSessionOfAnotherReviewer(vendorCollRef);
    snapshot = await query.limit(1).get();
    if (snapshot.empty) {
      query = getQueryForNextQueuedProfile(vendorCollRef);
      snapshot = await query.limit(1).get();
      if (snapshot.empty) {
        throw new Error("No Profiles to Review");
      }
    }
  }
  let vendor = null;
  snapshot.forEach((doc) => {
    vendor = doc.data();
  });
  vendor.timeline = { ...vendor.timeline, review_date: new Date() };
  vendor.reviewer = {
    uid: authUser.uid,
    name: authUser.username,
    email: authUser.email,
  };
  vendor.profile_status = Constants.VENDOR_PROFILE_REVIEW_STATUS;
  const vendorDocRef = vendorCollRef.doc(vendor.uid);
  await vendorDocRef.update(vendor);
  console.log("updated with review status");
  return vendor;
}

function getQueryForInCompleteSession(vendorCollRef, authUser) {
  console.log("getQueryForInCompleteSession");
  const query = vendorCollRef
    .where("profile_status", "==", Constants.VENDOR_PROFILE_REVIEW_STATUS)
    .where("reviewer.uid", "==", authUser.uid);
  return query;
}

function getQueryForInCompleteSessionOfAnotherReviewer(vendorCollRef) {
  console.log("getQueryForInCompleteSessionOfAnotherReviewer");
  let reviewOrphanTime = new Date();
  reviewOrphanTime.setHours(
    reviewOrphanTime.getHours() - Constants.REVIEW_SKIP_HRS
  );
  const query = vendorCollRef
    .where("profile_status", "==", Constants.VENDOR_PROFILE_REVIEW_STATUS)
    .where("timeline.review_date", "<=", reviewOrphanTime);
  return query;
}

function getQueryForNextQueuedProfile(vendorCollRef) {
  console.log("getQueryForNextQueuedProfile");
  const query = vendorCollRef
    .where("profile_status", "==", Constants.VENDOR_PROFILE_QUEUED_STATUS)
    .orderBy("timeline.request_date", "asc");
  return query;
}

async function approveProfile(profile) {
  console.log("approveVendorProfile for city - " + profile.address.city.code);
  profile = await tagLogoUrl(profile);
  profile = addMetaInfoToVendorProfile(profile);
  const cycles = getDefaultDuesCycles();

  const vendorDocRef = getVendorCollectionRef(profile.address.city.code).doc(
    profile.uid
  );
  const cycleColl = vendorDocRef.collection(
    Collection.SUB_COLL_VENDOR_BILLING_CYCLES
  );

  const batch = db.batch();
  batch.update(vendorDocRef, profile);
  console.log("Profile added successfully");

  cycles.forEach((currCycle) => {
    const cycleDocRef = cycleColl.doc(currCycle.cycle);
    batch.set(cycleDocRef, currCycle);
    console.log("added cycle => " + currCycle.cycle);
  });
  console.log("Billing Cycles added successfully");

  await batch.commit();
  console.log("batch committed succesffully");
}

function addMetaInfoToVendorProfile(profile) {
  const today = new Date();
  let expiryDate = new Date(today);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  profile.timeline = { ...profile.timeline, verify_date: today };
  profile.profile_status = "verified";
  profile.subscription = {
    status: "subscribed",
    current_plan: getDefaultPlan(today, expiryDate),
    next_plan_purchased: false,
  };
  profile.pending_dues = false;
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

function getDefaultDuesCycles() {
  const today = new Date();
  let expiryDate = new Date(today);
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  let dueDate = new Date(expiryDate);
  dueDate.setDate(dueDate.getDate() + 7);

  const overAllCycle = {
    cycle: "overall",
    start_date: today,
    coupons_claimed: 0,
  };

  const currentCycle = {
    cycle: "current",
    start_date: today,
    end_date: expiryDate,
    event_ids: [],
    customers: [],
    coupons_claimed: 0,
    due_date: dueDate,
  };

  return [overAllCycle, currentCycle];
}

async function tagLogoUrl(profile) {
  console.log("taglogoURL");
  if (profile.newProfileImg) {
    console.log("profile image found");
    const fileUrl = await uploadVendorLogo(
      profile.address.city.code,
      profile.uid,
      profile.newProfileImg
    );
    if (fileUrl) {
      profile["logoUrl"] = fileUrl;
      delete profile.newProfileImg;
      console.log("Image uploaded successfully");
    } else {
      throw new Error("Could not obtain file URL. Try later");
    }
  }
  return profile;
}

async function uploadVendorLogo(cityCode, docId, imgFile) {
  console.log("UPLOADING LOGO IMAGE");
  const storageRef = getVendorStorageRef(cityCode, docId);
  const logoImgRef = storageRef.child("logo");
  await logoImgRef.put(imgFile);
  const fileUrl = await logoImgRef.getDownloadURL();
  console.log("OBTAINED URL => " + fileUrl);
  return fileUrl;
}

async function skipReviewForCurrentVendor(profile) {
  console.log("skipReviewForCurrentVendor");
  const vendorCollRef = getVendorCollectionRef(profile.address.city.code);
  const vendorDocRef = vendorCollRef.doc(profile.uid);

  delete profile.reviewer;
  delete profile.timeline.review_date;
  profile.profile_status = Constants.VENDOR_PROFILE_QUEUED_STATUS;
  profile.timeline.request_date = await getNewRequestDate(
    vendorCollRef,
    profile.timeline.request_date
  );
  vendorDocRef.set(profile);
  console.log("profile reverted successfully");
}

async function getNewRequestDate(vendorCollRef, profileRequestDate) {
  const query = getQueryForNextQueuedProfile(vendorCollRef);
  const snapshot = await query.limit(1).get();
  let newRequestDate = profileRequestDate.toDate();
  if (!snapshot.empty) {
    console.log("derive from next doc ");
    let vendor = null;
    snapshot.forEach((doc) => {
      vendor = doc.data();
    });
    newRequestDate = vendor.timeline.request_date.toDate();
  }
  newRequestDate.setHours(
    newRequestDate.getHours() + Constants.REVIEW_SKIP_HRS
  );
  return newRequestDate;
}

const actions = {
  getVendorProfileForReview,
  approveProfile,
  skipReviewForCurrentVendor,
};
