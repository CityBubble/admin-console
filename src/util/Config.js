import Constants from "./Constants";

export function useConfig() {
  return actions;
}

function getOfferTypesArr() {
  return [
    { value: "flat", label: "Flat" },
    { value: "upto", label: "Upto" },
    { value: "combo", label: "Combo" },
    { value: "extra", label: "Extra Benefits" },
    { value: "other", label: "Other" },
  ];
}

function getPriorityArr() {
  return [
    Constants.PRIORITY_ELITE,
    Constants.PRIORITY_PREMIUM,
    Constants.PRIORITY_STANDARD,
  ];
}

function getPriorityText(priority) {
  switch (priority) {
    case Constants.PRIORITY_ELITE:
      return "High (Elite)";
    case Constants.PRIORITY_PREMIUM:
      return "Medium (Premium)";
    case Constants.PRIORITY_STANDARD:
      return "Low (Standard)";
    default:
      return "Unknown";
  }
}

const actions = {
  getOfferTypesArr,
  getPriorityText,
  getPriorityArr,
};
