import { db, storage } from "../firebase";
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

function getAdsStorageRef(cityCode, uid, subPath = "") {
  return storage.ref(
    `/${cityCode}/${Collection.SUB_COLL_ADS}/${uid}/${subPath}`
  );
}

// public api
async function addNewAd(adObj) {
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
  adObj.uid = adDocRef.id;
  if (adObj.gallery.length > 0) {
    adObj.gallery = await uploadGallery(adObj);
    console.log(adObj.gallery);
  }
  await adDocRef.set(adObj);
  console.log("New ad added successfully");
}

// operations for create ad
async function uploadGallery(adObj) {
  console.log("uploadGallery()");
  let galleryUrls = [];
  let storageRef = getAdsStorageRef(
    adObj.vendor.address.city.code,
    adObj.uid,
    Collection.STORAGE_AD_PATH_GALLERY
  );
  await Promise.all(
    adObj.gallery.map(async (item) => {
      const fileUrl = await uploadImage(storageRef, item.img);
      if (fileUrl) {
        galleryUrls.push(fileUrl);
        console.log("Image uploaded successfully");
      } else {
        throw new Error("Could not obtain file URL. Try later");
      }
    })
  );
  return galleryUrls;
}

// operations for create ad
async function uploadImage(storageRef, imgFile) {
  console.log("UPLOADING GALLERY IMAGE");
  const imgRef = storageRef.child(imgFile.name);
  await imgRef.put(imgFile);
  const fileUrl = await imgRef.getDownloadURL();
  console.log("OBTAINED IMAGE URL => " + fileUrl);
  return fileUrl;
}

// public api
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

// public api
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
  if (snapshot.empty) {
    throw new Error("No Records Found ..");
  }
  let ads = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    ads.push({ uid: doc.id, ...obj });
  });
  console.log(ads);
  return ads;
}

// public api
async function modifyAd(cityCode, modifiedAd, removedUrls) {
  console.log("modify Ad data for city- " + cityCode);
  if (!cityCode || !modifiedAd) {
    throw new Error("Invalid Arguments");
  }
  if (modifiedAd.processed.img) {
    modifiedAd = await tagAdCoverUrl(modifiedAd);
  }
  if (removedUrls.length > 0) {
    await removeImagesFromGallery(removedUrls);
  }
  const adDocRef = getCollectionRef(cityCode).doc(modifiedAd.uid);
  await adDocRef.update(modifiedAd);
  console.log("ad updated successfully");
}

// operations for modify ad
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

// operations for modify ad
async function uploadAdCoverImage(cityCode, docId, imgFile) {
  console.log("UPLOADING AD COVER IMAGE");
  const storageRef = getAdsStorageRef(cityCode, docId);
  const coverImgRef = storageRef.child("cover");
  await coverImgRef.put(imgFile);
  const fileUrl = await coverImgRef.getDownloadURL();
  console.log("OBTAINED URL => " + fileUrl);
  return fileUrl;
}

// operations for modify ad
async function removeImagesFromGallery(removedUrls) {
  console.log("removeImagesFromGallery");
  await Promise.all(
    removedUrls.map(async (url) => {
      const imgRef = storage.refFromURL(url);
      await imgRef.delete();
    })
  );
}

const actions = {
  addNewAd,
  getAds,
  getAdsForModification,
  modifyAd,
};
