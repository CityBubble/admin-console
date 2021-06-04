export function useUIUtility() {
  return actions;
}

function getStatusTextColor(status) {
  switch (status) {
    case "queued":
      return "#ffd56b";
    case "review":
      return "#da7f8f";
    case "verified":
    case "active":
      return "#1eae98";
    case "freeze":
      return "#39a9cb";
    case "expired":
      return "#f55c47";
    default:
      return "white";
  }
}

function getSubscriptionStatusTextColor(status) {
  switch (status) {
    case "verification":
      return "#ffd56b";
    case "subscribed":
      return "#1eae98";
    case "freeze":
      return "#39a9cb";
    case "unsubscribed":
      return "#f55c47";
    default:
      return "white";
  }
}

const actions = {
  getStatusTextColor,
  getSubscriptionStatusTextColor,
};
