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
        <button @click="greet">{{ numParticipants }} 人でプレイ開始</button>
        <p>{{ errorMessage }}</p>
    </div>
</template>

<script>
export default {
    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // グループ UUID
            groupUuid: null,

            // 招待 URL
            invitationUrl: null,

            // 参加人数
            numParticipants: 1,

            // エラーメッセージ
            errorMessage: null,

            // ソケット通信用
            socket: null,
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
        // ソケット接続中
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
        });

        // エラー通知が来た
        this.socket.on(csConstants.socketEvents.errorMessage, (errorMessage) => {
            this.errorMessage = errorMessage;
        });
    },
}
</script>

// ====================================================================
// CSS
// ====================================================================

<style></style>
