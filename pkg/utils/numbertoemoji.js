// https://github.com/anton-bot/number-to-emoji
const numberToEmoji = str => {
  if (str === undefined || str === null || str === '') {
    return str;
  }

  if (typeof str !== 'string') {
    str = str.toString();
  }

  if (str === "0") {
    return "🅾️";
  }

  if (str === '10') {
    return '🔟';
  }
  return str
    .replace(/0/g, '0️⃣')
    .replace(/1/g, '1️⃣')
    .replace(/2/g, '2️⃣')
    .replace(/3/g, '3️⃣')
    .replace(/4/g, '4️⃣')
    .replace(/5/g, '5️⃣')
    .replace(/6/g, '6️⃣')
    .replace(/7/g, '7️⃣')
    .replace(/8/g, '8️⃣')
    .replace(/9/g, '9️⃣');
}

module.exports = {
  numberToEmoji,
}