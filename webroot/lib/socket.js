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
const participantInfo = require("./participant_info");

// グループを更新（更新の可能性があるカラムのみ）
async function updateGroupAsync(db, groupRecord) {
    await new Promise((resolve, reject) => {
        const sentence = "update " + dbc.group.t + " set "
            + dbc.group.cStatus + " = ? "
            + "where " + dbc.group.cId + " = ?";
        db.run(sentence, groupRecord[dbc.group.cStatus], groupRecord[dbc.group.cId], (err) => {
            if (err) {
                reject(new Error("グループを更新できませんでした：" + groupRecord[dbc.group.cId]));
            } else {
                resolve();
            }
        });
    });
}

// 指定されたグループ ID（整数）でグループを検索し、レコードを返す
async function selectGroupByIdAsync(db, id) {
    return await new Promise((resolve, reject) => {
        const sentence = "select * from " + dbc.group.t + " where " + dbc.group.cId + " = ?";
        db.get(sentence, id, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたグループは存在しません：" + id));
            }
        });
    });
}

// 指定されたグループ UUID でグループを検索し、レコードを返す
async function selectGroupByUuidAsync(db, uuid) {
    return await new Promise((resolve, reject) => {
        const sentence = "select * from " + dbc.group.t + " where " + dbc.group.cUuid + " = ?";
        db.get(sentence, uuid, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたグループは存在しません：" + uuid));
            }
        });
    });
}

// 指定されたソケット ID が属するグループを検索し、レコードを返す
async function selectGroupBySocketIdAsync(db, socketId) {
    // メンバー検索
    const memberRecord = await selectMemberBySocketIdAsync(db, socketId);

    // グループ検索
    return await selectGroupByIdAsync(db, memberRecord[dbc.member.cGroup]);
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
    if (serial === 0) {
        name = "Host";
    } else {
        name = "Guest " + serial;
    }

    // 登録
    await new Promise((resolve, reject) => {
        const sentence = "insert into " + dbc.member.t
            + "(" + dbc.member.cGroup + ", " + dbc.member.cSerial + ", " + dbc.member.cName + ", "
            + dbc.member.cStatus + ", " + dbc.member.cSocket + ", " + dbc.member.cTactics + ", " + dbc.member.cPoint + ") "
            + "values(?, ?, ?, ?, ?, ?, ?)";
        db.run(sentence, groupId, serial, name, dbc.member.status.playing, socketId, csc.tactics.thinking, 0,
            (err) => {
                if (err) {
                    reject(new Error("メンバー登録できませんでした：" + groupId + ", " + name));
                } else {
                    console.log("メンバー登録：" + groupId + ", " + name + ", " + socketId);
                    resolve();
                }
            });
    });
}

// メンバーを更新（更新の可能性があるカラムのみ）
async function updateMemberAsync(db, memberRecord) {
    await new Promise((resolve, reject) => {
        const sentence = "update " + dbc.member.t + " set "
            + dbc.member.cName + " = ?, " + dbc.member.cStatus + " = ?, " + dbc.member.cTactics + " = ?, " + dbc.member.cPoint + " = ? "
            + "where " + dbc.member.cId + " = ?";
        db.run(sentence, memberRecord[dbc.member.cName], memberRecord[dbc.member.cStatus], memberRecord[dbc.member.cId],
            memberRecord[dbc.member.cTactics], memberRecord[dbc.member.cPoint], (err) => {
                if (err) {
                    reject(new Error("メンバー更新できませんでした：" + memberRecord[dbc.member.cGroup] + ", " + memberRecord[dbc.member.cName]));
                } else {
                    resolve();
                }
            });
    });
}

// 指定されたソケット ID でメンバーを検索し、レコードを返す
async function selectMemberBySocketIdAsync(db, socketId) {
    return await new Promise((resolve, reject) => {
        const sentence = "select * from " + dbc.member.t + " where " + dbc.member.cSocket + " = ?";
        db.get(sentence, socketId, (err, res) => {
            if (res) {
                resolve(res);
            } else {
                reject(new Error("指定されたメンバーは存在しません：" + socketId));
            }
        });
    });
}

// 参加者の数
async function countMemberAsync(db, groupId) {
    return await new Promise((resolve, reject) => {
        const sentence = "select count(*) from " + dbc.member.t
            + " where " + dbc.member.cGroup + " = ? and " + dbc.member.cStatus + " = ?";
        db.get(sentence, groupId, dbc.member.status.playing, (err, res) => {
            if (res) {
                resolve(res["count(*)"]);
            } else {
                reject(new Error("指定されたグループは存在しません：" + uuid));
            }
        });
    });
}

// 参加人数をグループ全員に通知
async function notifyNumParticipantsAsync(io, db, groupRecord) {
    const numParticipants = await countMemberAsync(db, groupRecord[dbc.group.cId]);
    io.to(groupRecord[dbc.group.cUuid]).emit(csc.socketEvents.numParticipants, numParticipants);
}

// 参加者情報群をグループ全員に通知
async function notifyparticipantInfosToAllAsync(io, db, groupRecord) {
    const jsonString = await participantInfosStringAsync(db, groupRecord);
    io.to(groupRecord[dbc.group.cUuid]).emit(csc.socketEvents.participantInfos, jsonString);
}

// 参加者情報群を一人に通知
async function notifyparticipantInfosToOneAsync(socket, db, groupRecord) {
    const jsonString = await participantInfosStringAsync(db, groupRecord);
    socket.emit(csc.socketEvents.participantInfos, jsonString);
}

// 参加者情報群 JSON 文字列
async function participantInfosStringAsync(db, groupRecord) {
    const participantInfos = await new Promise((resolve, reject) => {
        // 参加者情報を集める
        const participantInfos = [];
        const sentence = "select * from " + dbc.member.t
            + " where " + dbc.member.cGroup + " = ? and " + dbc.member.cStatus + " = ?";
        db.each(sentence, groupRecord[dbc.group.cId], dbc.member.status.playing, (err, res) => {
            const info = new participantInfo(res[dbc.member.cName], res[dbc.member.cPoint]);
            participantInfos.push(info);
        }, () => {
            resolve(participantInfos);
        });
    });
    return JSON.stringify(participantInfos);
}

// 新規グループ作成イベント
async function onNewGroupRequestedAsync(socket) {
    // UUID 決定
    const uuid = crypto.randomUUID();

    // db.serialize() はエラー処理も含めて考えると微妙なので、個別に await new Promise する
    const db = new sqlite3.Database(dbc.path);

    // グループテーブルに新規グループを登録
    const created = julianDay.dateTimeToModifiedJulianDate(new Date());
    await new Promise((resolve, reject) => {
        const sentence = "insert into " + dbc.group.t
            + "(" + dbc.group.cUuid + ", " + dbc.group.cCreated + ", " + dbc.group.cStatus + ") "
            + "values(?, ?, ?)";
        db.run(sentence, uuid, created, dbc.group.status.hiring, (err) => {
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

// プレイ開始イベント（ホストから受領し、ホストを含む全員にプレイ開始イベントを送信）
async function onStartPlayRequestedAsync(io, socket) {
    const db = new sqlite3.Database(dbc.path);

    // グループ検索
    const groupRecord = await selectGroupBySocketIdAsync(db, socket.id);

    // グループステータス更新
    if (groupRecord[dbc.group.cStatus] !== dbc.group.status.hiring) {
        // 多重にプレイ開始を受領
        throw new Error("既にプレイ開始されています。");
    }
    groupRecord[dbc.group.cStatus] = dbc.group.status.playing;
    await updateGroupAsync(db, groupRecord);

    // プレイ開始を全員に通知
    io.to(groupRecord[dbc.group.cUuid]).emit(csc.socketEvents.startPlay);
}

// プレイ開始準備完了イベント
// 内容的にはプレイ開始イベントの末尾で送りたいものだが、それだとクライアント側のページ切替前に送ってしまい、
// ページ切替後に反映されないため、クライアントからのページ切替を待ってから送るためのイベント
async function onPlayReadyRequestedAsync(socket) {
    const db = new sqlite3.Database(dbc.path);

    // グループ検索
    const groupRecord = await selectGroupBySocketIdAsync(db, socket.id);

    // 参加者情報群を通知
    await notifyparticipantInfosToOneAsync(socket, db, groupRecord);
}

// 手選択イベント
async function onSelectTacticsRequestedAsync(socket, tactics) {
    if (!tactics) {
        throw new Error("手が選択されていません。");
    }

    // tactics を整数で受信するとは限らないので、あくまでも簡易的なチェック
    if (tactics < csc.tactics.gu || tactics > csc.tactics.pa) {
        throw new Error("手が不正です。");
    }

    const db = new sqlite3.Database(dbc.path);

    // グループ検索
    const groupRecord = await selectGroupBySocketIdAsync(db, socket.id);
    if (groupRecord[dbc.group.cStatus] !== dbc.group.status.playing) {
        throw new Error("プレイ中ではないのに手が選択されました。");
    }

    // 手を記録
    const memberRecord = await selectMemberBySocketIdAsync(db, socket.id);
    if (memberRecord[dbc.member.cTactics] !== csc.tactics.thinking) {
        throw new Error("既に手は選択済です。");
    }
    memberRecord[dbc.member.cTactics] = tactics;
    await updateMemberAsync(db, memberRecord);

    // 全員の手が出そろったか？
}

// 切断イベント
async function onDisconnectedAsync(io, socket) {
    const db = new sqlite3.Database(dbc.path);

    // メンバー検索
    const memberRecord = await selectMemberBySocketIdAsync(db, socket.id);

    // ステータスを変更
    memberRecord[dbc.member.cStatus] = dbc.member.status.withdrew;
    await updateMemberAsync(db, memberRecord);
    console.log("メンバー削除：" + memberRecord[dbc.member.cGroup] + ", " + memberRecord[dbc.member.cName] + ", " + socket.id);
    // ToDo: ソケットからも削除

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

        // プレイ開始イベント
        socket.on(csc.socketEvents.startPlay, async () => {
            try {
                await onStartPlayRequestedAsync(io, socket);
            } catch (e) {
                notifyException(socket, e);
            }
        });

        // プレイ開始準備完了イベント
        socket.on(csc.socketEvents.playReady, async () => {
            try {
                await onPlayReadyRequestedAsync(socket);
            } catch (e) {
                notifyException(socket, e);
            }
        });

        // 手選択イベント
        socket.on(csc.socketEvents.selectTactics, async (tactics) => {
            try {
                await onSelectTacticsRequestedAsync(socket, tactics);
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
