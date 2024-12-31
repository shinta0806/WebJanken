// ============================================================================
//
// ラウンジコンポーネント（ゲスト）
//
// ============================================================================

<template>
    <div>
        <p id="loungeTitle">ラウンジ（ゲスト）</p>
        <p>{{ groupUuid }}</p>
        <p>ホストが参加者を募集中です。現在の参加者：{{ numParticipants }}</p>
        <p>ホストがプレイ開始するのを待っています...</p>
        <p>{{ errorMessage }}</p>
    </div>
</template>

<style>
p#loungeTitle {
    background-color: #ddaaff;
}
</style>

<script>
import loungeBase from "./lounge_base.vue";

export default {
    // ====================================================================
    // 継承
    // ====================================================================

    extends: loungeBase,

    // ====================================================================
    // 構築時受領
    // ====================================================================

    props: ["groupConst"],

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
        };
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        // ソケットインスタンス作成時に接続しに行く
        this.socket = io();

        // 接続時イベント
        this.socket.on("connect", () => {
            // 既存グループ参加依頼
            //console.log(this.socket);
            //console.log(this.groupConst);
            this.socket.emit(csConstants.socketEvents.joinGroup, this.groupConst);
        });

        // 人数通知が来た
        this.socket.on(csConstants.socketEvents.numParticipants, (numParticipants) => {
            //console.log(this.vueApp);
            this.numParticipants = numParticipants;
        });

        // ホスト・ゲスト共通イベント
        this.setSocketOn();
    },
}
</script>
