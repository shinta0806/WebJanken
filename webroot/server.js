// ============================================================================
// 
// Web じゃんけんサーバープログラム
// Copyright (C) 2024-2025 by SHINTA
// 
// ============================================================================

// ----------------------------------------------------------------------------
// Node.js により node server.js にて起動される
// ----------------------------------------------------------------------------

console.log("サーバー準備中...");

// モジュール
const express = require("express");
const http = require("http");

// データベース作成
const createDatabase = require("./create_database");
createDatabase.createDatabase();

// ルーティング
const routesIndex = require("./routes/index");
const expressApp = express();
routesIndex.setRoutesIndex(express, expressApp);

// ソケット通信
const setSocket = require("./lib/socket");
const httpServer = http.Server(expressApp);
setSocket.setSocket(httpServer);

/*
const cscl = require("./public/cs_classes");
const a = new cscl.participantInfo("agasa", 9);
console.log(a);

const b = JSON.stringify(a);
console.log(b);

const c =  JSON.parse(b);
console.log(c);

const d = Object.assign(new cscl.participantInfo(), JSON.parse(b));
console.log(d);

const e = '{"NOTname":"jack","point":5}';
const f =  JSON.parse(e);
console.log(f);

const g = Object.assign(new cscl.participantInfo(), JSON.parse(e)); // エラーにはならず、{ name: undefined, point: 5, NOTname: 'jack' }
console.log(g);
*/

// 待ち受け
const port = process.env.PORT || 3000;
httpServer.listen(port, function () {
  console.log("稼働開始。ポート番号：" + httpServer.address().port);
});
