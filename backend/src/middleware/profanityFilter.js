const Filter = require("bad-words");
const filter = new Filter();

// Lightweight guard used on posts/comments before they are stored.
function containsProfanity(text = "") {
  try {
    return filter.isProfane(text);
  } catch {
    return false;
  }
}

function cleanText(text = "") {
  try {
    return filter.clean(text);
  } catch {
    return text;
  }
}

module.exports = { containsProfanity, cleanText };
