import Constants from "./Constants";

export function useUIUtility() {
  return actions;
}

function getStatusTextColor(status) {
  switch (status) {
    case Constants.ADS_QUEUED_STATUS:
      return "#ffd56b";
    case Constants.ADS_REVIEW_STATUS:
      return "#da7f8f";
    case Constants.VENDOR_PROFILE_VERIFY_STATUS:
    case Constants.ADS_ACTIVE_STATUS:
      return "#1eae98";
    case Constants.ADS_FREEZE_STATUS:
      return "#39a9cb";
    case Constants.ADS_EXPIRED_STATUS:
      return "#f55c47";
    default:
      return "white";
  }
}

function getSubscriptionStatusTextColor(status) {
  switch (status) {
    case Constants.VENDOR_PROFILE_SUBSCRIPTION_VERIFY_STATUS:
      return "#ffd56b";
    case Constants.VENDOR_PROFILE_SUBSCRIPTION_SUBSCRIBED_STATUS:
      return "#1eae98";
    case Constants.VENDOR_PROFILE_SUBSCRIPTION_FREEZE_STATUS:
      return "#39a9cb";
    case Constants.VENDOR_PROFILE_SUBSCRIPTION_UNSUBSCRIBED_STATUS:
      return "#f55c47";
    default:
      return "white";
  }
}

function getPriorityText(priority) {
  switch (priority) {
    case Constants.PRIORITY_ELITE:
      return "High (Elite)";
    case Constants.PRIORITY_PREMIUM:
      return "Medium (Premium)";
    case Constants.PRIORITY_STANDARD:
      return "Low (Basic)";
    default:
      return "Unknown";
  }
}

function convertArrayToText(items) {
  if (!items || items.length === 0) {
    return "N/A";
  }
  return items.join(", ");
}

const actions = {
  getStatusTextColor,
  getSubscriptionStatusTextColor,
  getPriorityText,
  convertArrayToText,
};
