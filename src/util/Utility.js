export function useUtility() {
  return actions;
}

function isPureString(text) {
  const regex = /\d/;
  return !regex.test(text);
}

function isPureNumber(text) {
  const regex = /^[0-9]+$/;
  return regex.test(text);
}

function dateToString(date) {
  if (!date) {
    return "";
  }
  return date.toDate().toString();
}

function showConfirmDialog(msg) {
  return window.confirm(msg);
}

const actions = {
  isPureString,
  isPureNumber,
  dateToString,
  showConfirmDialog,
};
