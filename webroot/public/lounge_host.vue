// ============================================================================
//
// ラウンジコンポーネント（ホスト）
//
// ============================================================================

// ====================================================================
// View
// ====================================================================

<template>
    <div>
        <p>ラウンジ（ホスト）</p>
        <p>グループを作ります。一緒にプレイしたい人に、以下の URL にアクセスしてもらってください。</p>
        <div id="showQr"></div>
        <p>{{ invitationUrl }}</p>
        <button @click="onPlayClicked" :disabled="isPlayButtonDisabled">{{ numParticipants }} 人でプレイ開始</button>
        <p>{{ errorMessage }}</p>
    </div>
</template>

<script>
import loungeBase from "./lounge_base.vue";

export default {
    // ====================================================================
    // 継承
    // ====================================================================

    extends: loungeBase,

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // 招待 URL
            invitationUrl: null,

            // プレイ開始ボタン無効化
            isPlayButtonDisabled: true,
        };
    },

    // ====================================================================
    // 関数
    // ====================================================================

    methods: {
        // グループ UUID から招待用 URL を得る
        uuidToInvitationUrl(uuid) {
            let pathnamePos = location.href.indexOf(location.pathname);
            let base = location.href.substring(0, pathnamePos + location.pathname.length);
            return base + "?" + csConstants.params.group + "=" + uuid;
        },
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        // ソケットインスタンス作成時に接続しに行く
        this.socket = io();

        // 接続時イベント
        this.socket.on("connect", () => {
            // 新規グループ作成依頼
            //console.log(this.socket);
            this.socket.emit(csConstants.socketEvents.newGroup);
        });

        // グループ UUID 通知が来た
        this.socket.on(csConstants.socketEvents.groupUuid, (uuid) => {
            this.groupUuid = uuid;
            this.invitationUrl = this.uuidToInvitationUrl(uuid);
            document.getElementById("showQr").textContent = "";
            new QRCode(document.getElementById("showQr"), this.invitationUrl);
        });

        // 人数通知が来た
        this.socket.on(csConstants.socketEvents.numParticipants, (numParticipants) => {
            this.numParticipants = numParticipants;
            this.isPlayButtonDisabled = numParticipants == 1;
        });

        // ホスト・ゲスト共通イベント
        this.setSocketOn();
    },
}
</script>

// ====================================================================
// CSS
// ====================================================================

<style></style>
