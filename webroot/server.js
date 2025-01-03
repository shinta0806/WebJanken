// モジュール
const express = require("express");
const http = require("http");

// ルーティング
const expressApp = express();
expressApp.use("/public", express.static("public"));
const httpServer = http.Server(expressApp);

// 待ち受け
const port = process.env.PORT || 3000;
httpServer.listen(port, function () {
  console.log("稼働開始。ポート番号：" + httpServer.address().port);
});
