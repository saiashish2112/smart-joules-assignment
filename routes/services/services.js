const fs = require("fs");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

var data = fs.readFileSync("../smart-joules-assignment/Utils/data.json", "utf8");
data = JSON.parse(data);

function getMessage() {
  if (data && data.names !== undefined && data.cities !== undefined) {
    const totalNames = data.names.length;
    const totalCities = data.cities.length;
    let message = {
      name: data.names[getRandomIndex(totalNames)],
      origin: data.cities[getRandomIndex(totalCities)],
      destination: data.cities[getRandomIndex(totalCities)],
    };
    return message;
  } else {
    throw new Error("Data has no required fields");
  }
}

function getHash(message) {
  if (message !== undefined) {
    return crypto.createHash("sha256").update(message).digest("hex");
  } else {
    throw new Error("Message is required");
  }
}

function getSumCheckMessage() {
  let message = getMessage();
  message["secret_key"] = getHash(JSON.stringify(message));
  return message;
}

function getInitVector() {
  return crypto.randomBytes(16);
}

function getAlogrithm() {
  return "aes-256-ctr";
}

function getSecretKey() {
  return crypto.scryptSync(process.env.SECRET_KEY, "salt", 32);
}

function addInitVectorToMsg(initVector, encryptedData) {
  return (encryptedData += initVector.toString("hex"));
}

function encryptData(message) {
  try {
    const algorithm = getAlogrithm();
    const key = getSecretKey();
    const initVector = getInitVector();
    const cipher = crypto.createCipheriv(algorithm, key, initVector);
    // encrypt the message
    let encryptedData = cipher.update(message, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    const encryptedDataWithIV = addInitVectorToMsg(initVector, encryptedData);
    return encryptedDataWithIV;
  } catch (err) {
    console.log("Error!!!", err);
  }
}

function decryptedData(message) {
  try {
    const algorithm = getAlogrithm();
    const key = getSecretKey();
    message = message.toString();
    console.log("received encrypted message:", message, "\n");
    const response = separateInitVector(message);
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(response.initVector, "hex")
    );

    let decryptedData = decipher.update(response.data, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    console.log("after decrypting:", decryptedData, "\n");
    return decryptedData;
  } catch (err) {
    console.log("Error!!! ", err);
  }
}

// function takes incoming message as a input and separates the vector and data from it
function separateInitVector(message) {
  const initVector = message.substring(message.length - 32);
  const data = message.substring(0, message.length - 32);

  return { initVector: initVector, data: data };
}

//validate if the decrypted data arrived is corrupted or not
function validateData(message) {
  try {
    message = JSON.parse(message);
    let data = {
      name: message.name,
      origin: message.origin,
      destination: message.destination,
    };

    let generatehash = getHash(JSON.stringify(data));
    console.log("Retrived data from encrypted message: ", data, "\n");
    if (generatehash == message.secret_key) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Error!!! ", err);
  }
}

function addTimestamp(message) {
  message = JSON.parse(message);
  let data = {
    name: message.name,
    origin: message.origin,
    destination: message.destination,
  };
  data["timestamp"] = new Date();

  console.log("message with timestamp", data, "\n");

  return data;
}

function processBatch(data, batch) {
  return batch.push(data);
}

function getRandomIndex(limit) {
  return Math.floor(Math.random() * limit);
}

function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.getRandomValue = getRandomValue;
module.exports.getSumCheckMessage = getSumCheckMessage;
module.exports.processBatch = processBatch;
module.exports.addTimestamp = addTimestamp;
module.exports.validateData = validateData;
module.exports.decryptedData = decryptedData;
module.exports.encryptData = encryptData;
