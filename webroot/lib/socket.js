// ============================================================================
// 
// ソケット通信
// 
// ============================================================================

// ----------------------------------------------------------------------------
// クライアント・サーバー通信用
// ----------------------------------------------------------------------------

// モジュール
const sqlite3 = require("sqlite3");
const csc = require("../public/cs_constants");
const dbc = require("./db_constants");
const julianDay = require("./julian_day");

// 指定されたグループ ID（整数）を検索し、レコードを返す
async function selectGroupByIdAsync(db, id) {
    let sentence = "select * from " + dbc.group.t + " where " + dbc.group.cId + " = ?";
    return await new Promise((resolve, reject) => {
        db.get(sentence, id, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたグループは存在しません：" + id));
            }
        });
    });
}

// 指定されたグループ UUID を検索し、レコードを返す
async function selectGroupByUuidAsync(db, uuid) {
    let sentence = "select * from " + dbc.group.t + " where " + dbc.group.cUuid + " = ?";
    return await new Promise((resolve, reject) => {
        db.get(sentence, uuid, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたグループは存在しません：" + uuid));
            }
        });
    });
}

// 参加者の数
async function countMemberAsync(db, groupId) {
    let sentence = "select count(*) from " + dbc.member.t
        + " where " + dbc.member.cGroup + " = ? and " + dbc.member.cStatus + " = ?";
    return await new Promise((resolve, reject) => {
        db.get(sentence, groupId, dbc.member.status.playing, (err, res) => {
            if (res) {
                resolve(res["count(*)"]);
            } else {
                reject(new Error("指定されたグループは存在しません：" + uuid));
            }
        });
    });
}

// メンバーを更新（更新の可能性があるカラムのみ）
async function updateMemberAsync(db, memberRecord) {
    let sentence = "update " + dbc.member.t + " set "
        + dbc.member.cName + " = ?, " + dbc.member.cStatus + " = ? "
        + "where " + dbc.member.cId + " = ?";
    await new Promise((resolve, reject) => {
        db.run(sentence, memberRecord[dbc.member.cName], memberRecord[dbc.member.cStatus], memberRecord[dbc.member.cId], (err) => {
            if (err) {
                reject(new Error("メンバー更新できませんでした：" + memberRecord[dbc.member.cGroup] + ", " + memberRecord[dbc.member.cName]));
            } else {
                resolve();
            }
        });
    });
}

// 参加人数をグループ全員に通知
async function notifyNumParticipantsAsync(io, db, groupRecord) {
    let numParticipants = await countMemberAsync(db, groupRecord[dbc.group.cId]);
    io.to(groupRecord[dbc.group.cUuid]).emit(csc.socketEvents.numParticipants, numParticipants);
}

// メンバーを登録
// ToDo: 同時に登録されると serial が重複する
// ToDo: socketId よりも auth がベター 
// https://socket.io/docs/v4/server-socket-instance/#socketid
async function insertMemberAsync(db, groupId, socketId) {
    // 登録済人数の取得
    const serial = await countMemberAsync(db, groupId);

    // 名前の決定
    let name;
    if (serial == 0) {
        name = "Host";
    } else {
        name = "Guest " + serial;
    }

    // 登録
    let sentence = "insert into " + dbc.member.t
        + "(" + dbc.member.cGroup + ", " + dbc.member.cSerial + ", " + dbc.member.cName + ", "
        + dbc.member.cStatus + ", " + dbc.member.cSocket + ") "
        + "values(?, ?, ?, ?, ?)";
    await new Promise((resolve, reject) => {
        db.run(sentence, groupId, serial, name, dbc.member.status.playing, socketId, (err) => {
            if (err) {
                reject(new Error("メンバー登録できませんでした：" + groupId + ", " + name));
            } else {
                console.log("メンバー登録：" + groupId + ", " + name + ", " + socketId);
                resolve();
            }
        });
    });
}

// 新規グループ作成イベント
async function onNewGroupRequestedAsync(socket) {
    // UUID 決定
    const uuid = crypto.randomUUID();

    // db.serialize() はエラー処理も含めて考えると微妙なので、個別に await new Promise する
    const db = new sqlite3.Database(dbc.path);

    // グループテーブルに新規グループを登録
    const created = julianDay.dateTimeToModifiedJulianDate(new Date());
    let sentence = "insert into " + dbc.group.t
        + "(" + dbc.group.cUuid + ", " + dbc.group.cCreated + ", " + dbc.group.cStatus + ") "
        + "values(?, ?, ?)";
    await new Promise((resolve, reject) => {
        db.run(sentence, uuid, created, 0, (err) => {
            if (err) {
                reject(new Error("グループ UUID が重複しました：" + uuid + ", " + err));
            } else {
                resolve();
            }
        });
    });

    // 登録したグループの ID などを取得
    const groupRecord = await selectGroupByUuidAsync(db, uuid);

    // グループメンバーテーブルにホストユーザーを登録
    await insertMemberAsync(db, groupRecord[dbc.group.cId], socket.id);

    // ソケット上のグループを登録
    socket.join(uuid);

    // クライアント（ホスト）にグループ UUID を通知
    socket.emit(csc.socketEvents.groupUuid, uuid);
}

// 既存グループ参加イベント
async function onJoinGroupRequestedAsync(io, socket, groupUuid) {
    if (!groupUuid) {
        throw new Error("グループが指定されていません。");
    }
    const db = new sqlite3.Database(dbc.path);

    // グループ検索
    const groupRecord = await selectGroupByUuidAsync(db, groupUuid);

    // グループメンバーテーブルにゲストユーザーを登録
    await insertMemberAsync(db, groupRecord[dbc.group.cId], socket.id);

    // ソケット上のグループを登録
    socket.join(groupUuid);

    // 参加人数をグループ全員に通知
    await notifyNumParticipantsAsync(io, db, groupRecord);
}

// 切断イベント
async function onDisconnectedAsync(io, socket) {
    const db = new sqlite3.Database(dbc.path);

    // メンバー検索
    let sentence = "select * from " + dbc.member.t + " where " + dbc.member.cSocket + " = ?";
    const memberRecord = await new Promise((resolve, reject) => {
        db.get(sentence, socket.id, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたメンバーは存在しません：" + uuid));
            }
        });
    });

    // ステータスを変更
    memberRecord[dbc.member.cStatus] = dbc.member.status.withdrew;
    await updateMemberAsync(db, memberRecord);
    console.log("メンバー削除：" + memberRecord[dbc.member.cGroup] + ", " + memberRecord[dbc.member.cName] + ", " + socket.id);

    // 参加人数をグループ全員に通知
    const groupRecord = await selectGroupByIdAsync(db, memberRecord[dbc.member.cGroup]);
    await notifyNumParticipantsAsync(io, db, groupRecord);
}

// エラーをクライアントに通知
function notifyException(socket, e) {
    console.log("エラー：" + e.message);
    socket.emit(csc.socketEvents.errorMessage, e.message);
}

// エクスポート関数
function setSocket(httpServer) {
    const io = require("socket.io")(httpServer);

    // socket.io 接続イベント
    io.on("connection", (socket) => {

        // 接続以外のクライアントからのイベント受信は io.on() ではなく socket.on() であることに注意
        //console.log("connection: " + socket.id);

        // 新規グループ作成イベント
        socket.on(csc.socketEvents.newGroup, async () => {
            try {
                await onNewGroupRequestedAsync(socket);
            } catch (e) {
                notifyException(socket, e);
            }
        });

        // 既存グループ参加イベント
        socket.on(csc.socketEvents.joinGroup, async (group) => {
            try {
                await onJoinGroupRequestedAsync(io, socket, group);
            } catch (e) {
                notifyException(socket, e);
            }
        });

        // 切断イベント
        socket.on("disconnect", async () => {
            try {
                await onDisconnectedAsync(io, socket);
            } catch (e) {
                notifyException(socket, e);
            }
        });
    });
}

exports.setSocket = setSocket;
