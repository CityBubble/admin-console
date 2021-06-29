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

function dateToInputFieldString(date) {
  if (!date) {
    return "";
  }
  return (
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2)
  );
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

function getOfferTypesArr() {
  return [
    { value: "flat", label: "Flat" },
    { value: "upto", label: "Upto" },
    { value: "combo", label: "Combo" },
    { value: "extra", label: "Extra Benefits" },
    { value: "other", label: "Other" },
  ];
}

function arraysEqual(arr1, arr2) {
  let result = false;
  if (Array.isArray(arr1) && Array.isArray(arr2)) {
    result =
      arr1.length === arr2.length &&
      arr1.every((value, index) => value === arr2[index]);
    return result;
  }
  return result;
}

function extractTermsArrFromInputDescription(desc) {
  let text = desc.trim();
  let finalArr = [];
  if (text.length > 0) {
    let arr = text.split(";");
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].trim().length > 0) {
        finalArr.push(arr[i].trim());
      }
    }
  }
  return finalArr;
};

const actions = {
  isPureString,
  isPureNumber,
  dateToString,
  dateToInputFieldString,
  showConfirmDialog,
  formatTextCasing,
  formatCaseForCommaSeparatedItems,
  scrollToTop,
  getOfferTypesArr,
  arraysEqual,
  extractTermsArrFromInputDescription,
};
