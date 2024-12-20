// ============================================================================
// 
// Web じゃんけんサーバープログラム
// Copyright (C) 2024 by SHINTA
// 
// ============================================================================

// ----------------------------------------------------------------------------
// Node.js により node server.js にて起動される
// ----------------------------------------------------------------------------

console.log("サーバー準備中...");

// モジュール
const express = require("express");
const http = require("http");
const routesIndex = require("./routes/index");

// ルーティング
const expressApp = express();
routesIndex.setRoutesIndex(express, expressApp);

// ソケット通信
const setSocket = require("./lib/socket");
const httpServer = http.Server(expressApp);
setSocket.setSocket(httpServer);

// 待ち受け
const port = process.env.PORT || 3000;
httpServer.listen(port, function () {
  console.log("稼働開始。ポート番号：" + httpServer.address().port);
});
