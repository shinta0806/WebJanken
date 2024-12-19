// ============================================================================
//
// ラウンジコンポーネント（ゲスト）
//
// ============================================================================

// ====================================================================
// View
// ====================================================================

<template>
    <div>
        <p>ラウンジ（ゲスト）</p>
        <p>{{ groupUuid }}</p>
        <p>ホストが参加者を募集中です。現在の参加者：{{ numParticipants }}</p>
        <p>ホストがプレイ開始するのを待っています...</p>
        <p>{{ errorMessage }}</p>
    </div>
</template>

<script>
export default {
    // ====================================================================
    // 構築時受領
    // ====================================================================

    props: ["groupConst"],

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // 確認済のグループ UUID
            groupUuid: null,

            // 参加人数
            numParticipants: 1,

            // エラーメッセージ
            errorMessage: null,

            // ソケット通信用
            socket: null,
        };
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        // ソケット接続中
        this.socket = io();

        // 接続時イベント
        this.socket.on("connect", () => {
            // 既存グループ参加依頼
            console.log(this.socket);
            this.socket.emit(csConstants.socketEvents.joinGroup, this.groupConst);
        });

        // 人数通知が来た
        this.socket.on(csConstants.socketEvents.numParticipants, (numParticipants) => {
            this.numParticipants = numParticipants;
        });

        // エラー通知が来た
        this.socket.on(csConstants.socketEvents.errorMessage, (errorMessage) => {
            this.errorMessage = errorMessage;
        });
    },

}
</script>

<style></style>
