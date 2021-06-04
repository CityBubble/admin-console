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

function formatTextCasing(text) {
  if (!text) {
    return "";
  }
  const arrOfWords = text.split(" ");
  const arrOfWordsCased = [];
  for (let i = 0; i < arrOfWords.length; i++) {
    let word = arrOfWords[i];
    word = word.trim();
    if (word.length > 0) {
      arrOfWordsCased.push(word[0].toUpperCase() + word.slice(1).toLowerCase());
    }
  }
  return arrOfWordsCased.join(" ");
}

function formatCaseForCommaSeparatedItems(text) {
  const rawTextArr = text.split(",");
  let refinedTextArr = [];
  for (let i = 0; i < rawTextArr.length; i++) {
    const val = formatTextCasing(rawTextArr[i]);
    if (val.length > 0) {
      refinedTextArr.push(val);
    }
  }
  return refinedTextArr;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

const actions = {
  isPureString,
  isPureNumber,
  dateToString,
  showConfirmDialog,
  formatTextCasing,
  formatCaseForCommaSeparatedItems,
  scrollToTop,
};
