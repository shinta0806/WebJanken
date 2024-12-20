// ============================================================================
// 
// Web じゃんけん用データベース新規作成プログラム
// 
// ============================================================================

// ----------------------------------------------------------------------------
// 初回のみ実行する
// ----------------------------------------------------------------------------

// データベース操作
function run(db, sentence) {
    console.log(sentence);
    db.run(sentence);
}

// モジュール
const fs = require("fs");
const sqlite3 = require("sqlite3");
const dbc = require("./lib/db_constants");

// フォルダー作成
if (fs.existsSync(dbc.folder)) {
    console.log("データベース用フォルダーは既に存在しています。");
} else {
    console.log("データベース用フォルダーを作成します...");
    fs.mkdirSync(dbc.folder, { recursive: true });
}

// データベース存在チェック
if (fs.existsSync(dbc.path)) {
    console.log("データベースが既に存在しているため、作成を中止します。");
    return;
}

// 作成
const db = new sqlite3.Database(dbc.path);
db.serialize(() => {
    // グループ
    let sentence = "create table " + dbc.group.t + "("
        + dbc.group.cId + " " + dbc.tInt + " " + dbc.pPrimaryKey + " " + dbc.pAutoIncrement + ", "
        + dbc.group.cUuid + " " + dbc.tText + " " + dbc.pNotNull + " " + dbc.pUnique + ", "
        + dbc.group.cCreated + " " + dbc.tReal + " " + dbc.pNotNull + ", "
        + dbc.group.cStatus + " " + dbc.tInt + " " + dbc.pNotNull + ")";
    run(db, sentence);
    sentence = "create index index_" + dbc.group.cUuid + " on " + dbc.group.t + "(" + dbc.group.cUuid + ")";
    run(db, sentence);
    sentence = "create index index_" + dbc.group.cCreated + " on " + dbc.group.t + "(" + dbc.group.cCreated + ")";
    run(db, sentence);

    // グループメンバー
    sentence = "create table " + dbc.member.t + "("
        + dbc.member.cId + " " + dbc.tInt + " " + dbc.pPrimaryKey + " " + dbc.pAutoIncrement + ", "
        + dbc.member.cGroup + " " + dbc.tInt + " " + dbc.pNotNull + ", "
        + dbc.member.cSerial + " " + dbc.tInt + " " + dbc.pNotNull + ", "
        + dbc.member.cName + " " + dbc.tText + " " + dbc.pNotNull + ", "
        + dbc.member.cStatus + " " + dbc.tInt + " " + dbc.pNotNull + ", "
        + dbc.member.cSocket + " " + dbc.tText + " " + dbc.pNotNull + ")";
    run(db, sentence);
    sentence = "create index index_" + dbc.member.cGroup + " on " + dbc.member.t + "(" + dbc.member.cGroup + ")";
    run(db, sentence);
    sentence = "create index index_" + dbc.member.cSocket + " on " + dbc.member.t + "(" + dbc.member.cSocket + ")";
    run(db, sentence);
});

db.close();
console.log("データベース作成が完了しました。");
