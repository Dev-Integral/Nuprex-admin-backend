const randomString = require("randomstring");

const codeGenerator = (length, type) => {
  return randomString.generate({
    length: length,
    charset: type, //alphanumeric - [0-9 a-z A-Z], alphabetic - [a-z A-Z], numeric - [0-9], hex - [0-9 a-f], binary - [01], octal - [0-7], custom - any given characters
  });
};

module.exports = codeGenerator;
