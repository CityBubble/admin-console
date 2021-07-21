import Collection from "../collectionConstants";
import { db, firestore } from "../firebase";

export function useMetaDataStore() {
  return actions;
}

function getCityCollectionRef() {
  return db.collection(Collection.COLL_CITIES);
}

function getCategoryCollectionRef() {
  return db.collection(Collection.COLL_CATEGORIES);
}

function getTopupCollectionRef() {
  return db.collection(Collection.COLL_TOPUPS);
}

function getSubscriptionCollectionRef(cityCode) {
  return db
    .collection(Collection.COLL_CITIES)
    .doc(cityCode)
    .collection(Collection.COLL_SUBSCRIPTIONS);
}

async function addCity(cityObj) {
  console.log("addCity for " + JSON.stringify(cityObj));
  if (!cityObj) {
    throw new Error("invalid city Obj");
  }
  if (!cityObj.code || !cityObj.name) {
    throw new Error("Missing city info");
  }
  const cityCollRef = getCityCollectionRef();
  const cityDocRef = cityCollRef.doc(cityObj.code);
  await cityDocRef.set(cityObj);
  console.log("New city added successfully");
}

async function getCities() {
  console.log("getCities");
  const cityCollRef = getCityCollectionRef();
  const snapshot = await cityCollRef.get();
  let cities = [];
  snapshot.forEach((doc) => {
    cities.push(doc.data());
  });
  return cities;
}

async function addParent(parentObj) {
  console.log("addParent for " + JSON.stringify(parentObj));
  if (!parentObj) {
    throw new Error("invalid parent Obj");
  }
  const categoryCollRef = getCategoryCollectionRef();
  const parentDocRef = categoryCollRef.doc(
    Collection.COLL_CATEGORIES_PARENT_DOC
  );
  await parentDocRef.set(
    {
      values: firestore.FieldValue.arrayUnion(parentObj),
    },
    { merge: true }
  );
  console.log("New parent added successfully");
}

async function getParentCategories() {
  console.log("getParentCategories");
  const categoryCollRef = getCategoryCollectionRef();
  const snapshot = await categoryCollRef
    .doc(Collection.COLL_CATEGORIES_PARENT_DOC)
    .get();
  if (!snapshot.exists) {
    return [];
  }
  console.log("Parent Categories returned= " + snapshot.data().values.length);
  return snapshot.data().values;
}

async function addCategory(categoryObj, parentsArr) {
  console.log("addCategory for " + JSON.stringify(categoryObj));
  if (!categoryObj) {
    throw new Error("invalid category Obj");
  }
  const categoryCollRef = getCategoryCollectionRef();
  const parentDocRef = categoryCollRef.doc(
    Collection.COLL_CATEGORIES_PARENT_DOC
  );
  let parentData = { values: parentsArr };
  const batch = db.batch();
  batch.update(parentDocRef, parentData);

  const categoryDocRef = categoryCollRef.doc();
  categoryObj["uid"] = categoryDocRef.id;
  batch.set(categoryDocRef, categoryObj);

  await batch.commit();
  console.log("batch committed succesffully");
}

async function getCategories() {
  console.log("getCategories");
  const categoryCollRef = getCategoryCollectionRef();
  const snapshot = await categoryCollRef.get();

  let categories = [];
  snapshot.forEach((doc) => {
    let obj = doc.data();
    if (!obj.values) {
      categories.push({ uid: doc.id, ...obj });
    }
  });
  console.log("Cateories returned= " + categories.length);
  return categories;
}

async function addCategoryKeywords(category, keywordsArr) {
  console.log(
    "addCategoryKeywords for " + category.uid + " - []= " + keywordsArr
  );
  if (!category.uid) {
    throw new Error("Invalid category identifier => " + category.uid);
  }
  const categoryCollRef = getCategoryCollectionRef();
  const categoryDocRef = categoryCollRef.doc(category.uid);
  await categoryDocRef.set({
    uid: category.uid,
    name: category.name,
    parent: category.parent,
    keywords: firestore.FieldValue.arrayUnion(...keywordsArr),
  });
  console.log("keywords added successfully");
}

async function addTopUpPlan(planObj) {
  console.log("addTopUpPlan for " + JSON.stringify(planObj));
  if (!planObj) {
    throw new Error("invalid plan Obj");
  }
  const topupCollRef = getTopupCollectionRef();
  const planDocRef = topupCollRef.doc(planObj.name.toLowerCase());
  await planDocRef.set(planObj, { merge: true });
  console.log("New plan added successfully");
}

async function getTopupPlans() {
  console.log("getTopupPlans");
  const topupCollRef = getTopupCollectionRef();
  const snapshot = await topupCollRef.orderBy("coupons").get();

  let plans = [];
  snapshot.forEach((doc) => {
    plans.push(doc.data());
  });
  console.log("Top up Plans returned= " + plans.length);
  return plans;
}

async function deleteTopUpPlan(planName) {
  console.log("deleteTopUpPlan : " + planName);
  const topupCollRef = getTopupCollectionRef();
  const planDocRef = topupCollRef.doc(planName.toLowerCase());
  await planDocRef.delete();
  console.log("Plan deleted successfully");
}

async function getSubscriptions(cityCode) {
  console.log("getSubscriptions for cityCode= " + cityCode);
  if (!cityCode) {
    throw new Error("invalid city code");
  }
  const subscriptionCollRef = getSubscriptionCollectionRef(cityCode);
  const snapshot = await subscriptionCollRef.orderBy("priority").get();

  let subscriptions = [];
  snapshot.forEach((doc) => {
    subscriptions.push(doc.data());
  });
  console.log("Subscriptions returned= " + subscriptions.length);
  return subscriptions;
}

async function addSubscription(cityCode, subscriptionObj) {
  console.log("addSubscription  for city: " + cityCode);
  if (!subscriptionObj) {
    throw new Error("invalid plan Obj");
  }
  const subscriptionCollRef = getSubscriptionCollectionRef(cityCode);
  const subscriptionDocRef = subscriptionCollRef.doc(
    subscriptionObj.name.toLowerCase()
  );
  await subscriptionDocRef.set(subscriptionObj);
  console.log("New subscription added successfully");
}

async function removeSubscription(cityCode, subscriptionName) {
  console.log("removeSubscription for " + subscriptionName);
  if (!subscriptionName) {
    throw new Error("invalid plan name");
  }
  const subscriptionCollRef = getSubscriptionCollectionRef(cityCode);
  const subscriptionDocRef = subscriptionCollRef.doc(
    subscriptionName.toLowerCase()
  );
  await subscriptionDocRef.delete();
  console.log("Subscription deleted successfully");
}

const actions = {
  addCity,
  getCities,
  addParent,
  getParentCategories,
  addCategory,
  getCategories,
  addCategoryKeywords,
  addTopUpPlan,
  getTopupPlans,
  deleteTopUpPlan,
  getSubscriptions,
  addSubscription,
  removeSubscription
};
