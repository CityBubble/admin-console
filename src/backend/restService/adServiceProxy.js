import Constants from "../../util/Constants";
import Collection from "../collectionConstants";
import { db, storage } from "../firebase";

export function useAdService() {
  return actions;
}

function getAdCollectionRef(cityCode) {
  return db
    .collection(Collection.COLL_CITIES)
    .doc(cityCode)
    .collection(Collection.SUB_COLL_ADS);
}

function getAdStorageRef(cityCode, uid, subPath = "") {
  return storage.ref(
    `/${cityCode}/${Collection.SUB_COLL_ADS}/${uid}/${subPath}`
  );
}

//export function
async function getAdForReview(cityCode, authUser) {
  console.log("getAdForReview for city - " + cityCode);
  const adCollRef = getAdCollectionRef(cityCode);
  let query = getQueryForInCompleteSession(adCollRef, authUser);
  let snapshot = await query.limit(1).get();
  if (snapshot.empty) {
    query = getQueryForInCompleteSessionOfAnotherReviewer(adCollRef);
    snapshot = await query.limit(1).get();
    if (snapshot.empty) {
      query = getQueryForNextQueuedAd(adCollRef);
      snapshot = await query.limit(1).get();
      if (snapshot.empty) {
        throw new Error("No Ads to Review");
      }
    }
  }
  let ad = null;
  snapshot.forEach((doc) => {
    ad = doc.data();
  });
  ad.timeline = { ...ad.timeline, review_date: new Date() };
  ad.ad_status.reviewer = {
    uid: authUser.uid,
    name: authUser.username,
    email: authUser.email,
  };
  ad.ad_status.status = Constants.ADS_REVIEW_STATUS;
  const adDocRef = adCollRef.doc(ad.uid);
  await adDocRef.update(ad);
  console.log("updated with review status");
  return ad;
}

function getQueryForInCompleteSession(adCollRef, authUser) {
  console.log("getQueryForInCompleteSession");
  const query = adCollRef
    .where("ad_status.status", "==", Constants.ADS_REVIEW_STATUS)
    .where("ad_status.reviewer.uid", "==", authUser.uid);
  return query;
}

function getQueryForInCompleteSessionOfAnotherReviewer(adCollRef) {
  console.log("getQueryForInCompleteSessionOfAnotherReviewer");
  let reviewOrphanTime = new Date();
  reviewOrphanTime.setHours(
    reviewOrphanTime.getHours() - Constants.REVIEW_SKIP_HRS
  );
  const query = adCollRef
    .where("ad_status.status", "==", Constants.ADS_REVIEW_STATUS)
    .where("timeline.review_date", "<=", reviewOrphanTime);
  return query;
}

function getQueryForNextQueuedAd(adCollRef) {
  console.log("getQueryForNextQueuedProfile");
  const query = adCollRef
    .where("ad_status.status", "==", Constants.ADS_QUEUED_STATUS)
    .orderBy("timeline.request_date", "asc");
  return query;
}

//export function
async function approveAd(adObj, removedUrls) {
  console.log("approve Ad for city - " + adObj.vendor.address.city.code);
  adObj = await tagAdCoverUrl(adObj);
  await removeImagesFromGallery(removedUrls);
  adObj = addMetaInfoToAd(adObj);
  const adDocRef = getAdCollectionRef(adObj.vendor.address.city.code).doc(
    adObj.uid
  );
  await adDocRef.update(adObj);
  console.log("Ad approved successfully");
}

function addMetaInfoToAd(adObj) {
  adObj.timeline.publish_date = new Date();
  adObj.ad_status.status = "active";
  adObj.stats = {
    views: 0,
    claims: 0,
  };
  return adObj;
}

async function tagAdCoverUrl(adObj) {
  console.log("tagAdCoverUrl");
  if (adObj.processed.img) {
    console.log("ad image found");
    const fileUrl = await uploadAdCoverImage(
      adObj.vendor.address.city.code,
      adObj.uid,
      adObj.processed.img
    );
    if (fileUrl) {
      adObj.processed.img_url = fileUrl;
      delete adObj.processed.img;
      console.log("Image uploaded successfully");
    } else {
      throw new Error("Could not obtain file URL. Try later");
    }
    return adObj;
  } else {
    throw new Error("Ad Cover Image is missing");
  }
}

async function uploadAdCoverImage(cityCode, docId, imgFile) {
  console.log("UPLOADING AD COVER IMAGE");
  const storageRef = getAdStorageRef(cityCode, docId);
  const coverImgRef = storageRef.child("cover");
  await coverImgRef.put(imgFile);
  const fileUrl = await coverImgRef.getDownloadURL();
  console.log("OBTAINED URL => " + fileUrl);
  return fileUrl;
}

async function removeImagesFromGallery(removedUrls) {
  console.log("removeImagesFromGallery");
  await Promise.all(
    removedUrls.map(async (url) => {
      const imgRef = storage.refFromURL(url);
      await imgRef.delete();
    })
  );
}

//export function
async function skipReviewForCurrentAd(adObj) {
  console.log("skipReviewForCurrentAd");
  const adCollRef = getAdCollectionRef(adObj.vendor.address.city.code);
  const adDOcRef = adCollRef.doc(adObj.uid);

  delete adObj.ad_status.reviewer;
  delete adObj.timeline.review_date;
  adObj.ad_status.status = Constants.ADS_QUEUED_STATUS;
  adObj.timeline.request_date = await getNewRequestDate(
    adCollRef,
    adObj.timeline.request_date
  );
  await adDOcRef.set(adObj);
  console.log("ad reverted successfully");
}

async function getNewRequestDate(adCollRef, adRequestDate) {
  const query = getQueryForNextQueuedAd(adCollRef);
  const snapshot = await query.limit(1).get();
  let newRequestDate = adRequestDate.toDate();
  if (!snapshot.empty) {
    console.log("derive from next doc ");
    let nextAdObj = null;
    snapshot.forEach((doc) => {
      nextAdObj = doc.data();
    });
    newRequestDate = nextAdObj.timeline.request_date.toDate();
  }
  newRequestDate.setHours(
    newRequestDate.getHours() + Constants.REVIEW_SKIP_HRS
  );
  return newRequestDate;
}

const actions = {
  getAdForReview,
  approveAd,
  skipReviewForCurrentAd,
};
