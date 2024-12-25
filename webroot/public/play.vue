// ============================================================================
//
// プレイコンポーネント
//
// ============================================================================

<template>
    <p>プレイ</p>
    <participantPanel v-for="participantInfo in participantInfos" :participantInfo="participantInfo"></participantPanel>
    <p>次は何を出しますか？</p>
    <p>
        <button class="tacticsButton" @click="onTacticsGuClicked()" :disabled="isTacticsButtonDisabled">
            <img class="tacticsImg" src="tactics_gu.png" />
        </button>
        <button class="tacticsButton" @click="onTacticsChokiClicked()" :disabled="isTacticsButtonDisabled">
            <img class="tacticsImg" src="tactics_choki.png" />
        </button>
        <button class="tacticsButton" @click="onTacticsPaClicked()" :disabled="isTacticsButtonDisabled">
            <img class="tacticsImg" src="tactics_pa.png" />
        </button>
    </p>
    <p>{{ statusMessage }}</p>
    <p>{{ errorMessage }}</p>
</template>

<style>
.tacticsButton {
    width: 100px;
    height: 100px;
    margin-right: 20px;
}

.tacticsImg {
    height: 90%;
}
</style>

<script>
import participantPanel from './participant_panel.vue'

export default {
    // ====================================================================
    // 構築時受領
    // ====================================================================

    props: ["socket", "vueApp"],

    // ====================================================================
    // カスタムコンポーネント
    // ====================================================================

    components: {
        participantPanel,
    },

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // 参加者情報群
            participantInfos: null,

            // 手ボタン無効化
            isTacticsButtonDisabled: false,

            // ステータスメッセージ
            statusMessage: null,

            // エラーメッセージ
            errorMessage: null,
        };
    },

    // ====================================================================
    // 関数
    // ====================================================================

    methods: {
        // グーを出す
        onTacticsGuClicked() {
            // ToDo: button.@click の引数に csConstants.tactics.gu を記述すると認識されないのでワンクッション置いている
            this.sendTactics(csConstants.tactics.gu);
        },

        // チョキを出す
        onTacticsChokiClicked() {
            this.sendTactics(csConstants.tactics.choki);
        },

        // パーを出す
        onTacticsPaClicked() {
            this.sendTactics(csConstants.tactics.pa);
        },

        // 手をサーバーに送信
        sendTactics(tactics) {
            // UI 処理
            this.isTacticsButtonDisabled = true;
            this.statusMessage = "他の参加者が手を出すのを待っています...";

            // 送信
            this.socket.emit(csConstants.socketEvents.selectTactics, tactics);
        },
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        // 参加者情報群が来た
        this.socket.on(csConstants.socketEvents.participantInfos, (participantInfosString) => {
            this.participantInfos = JSON.parse(participantInfosString);
        });

        // エラー通知が来た
        this.socket.on(csConstants.socketEvents.errorMessage, (errorMessage) => {
            this.errorMessage = errorMessage;
        });

        // socket.on イベントハンドラー設定完了後
        this.socket.emit(csConstants.socketEvents.playReady);
    },
}
</script>
