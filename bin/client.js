const WebSocket = require("ws");
const {
  encryptData,
  getSumCheckMessage,
  getRandomValue,
} = require("../routes/services/services");

const ws = new WebSocket("ws://localhost:3000");
ws.on("open", function open() {
  setInterval(function () {
    let limit = getRandomValue(1, 5);
    let serializeData = [];
    for (let i = 0; i < limit; i++) {
      serializeData.push(encryptData(JSON.stringify(getSumCheckMessage())));
    }
    ws.send(serializeData.join("|"));
  }, 10000);
});
