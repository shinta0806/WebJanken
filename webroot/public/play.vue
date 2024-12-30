// ============================================================================
//
// プレイコンポーネント
//
// ============================================================================

<template>
    <p>プレイ</p>
    <participantPanel v-for="participantInfo in participantInfos" :participantInfo="participantInfo"></participantPanel>
    <p>{{ judgementMessage }}</p>
    <p>次は何を出しますか？</p>
    <p>
        <button :class="guClasses" @click="onTacticsGuClicked()" :disabled="isTacticsButtonDisabled">
            <img class="tacticsImg" src="tactics_gu.png" />
        </button>
        <button :class="chokiClasses" @click="onTacticsChokiClicked()" :disabled="isTacticsButtonDisabled">
            <img class="tacticsImg" src="tactics_choki.png" />
        </button>
        <button :class="paClasses" @click="onTacticsPaClicked()" :disabled="isTacticsButtonDisabled">
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

.selectedButton {
    background-color: #CCFFCC;
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

            // 勝敗メッセージ
            judgementMessage: null,

            // 手ボタンのスタイルクラス
            guClasses: null,
            chokiClasses: null,
            paClasses: null,

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
        // 手ボタン初期化
        clearTactics() {
            this.guClasses = ["tacticsButton"];
            this.chokiClasses = ["tacticsButton"];
            this.paClasses = ["tacticsButton"];
            this.isTacticsButtonDisabled = false;
        },

        // グーを出す
        onTacticsGuClicked() {
            // ToDo: button.@click の引数に csConstants.tactics.gu を記述すると認識されないのでワンクッション置いている
            this.sendTactics(csConstants.tactics.gu, this.guClasses);
        },

        // チョキを出す
        onTacticsChokiClicked() {
            this.sendTactics(csConstants.tactics.choki, this.chokiClasses);
        },

        // パーを出す
        onTacticsPaClicked() {
            this.sendTactics(csConstants.tactics.pa, this.paClasses);
        },

        // 手をサーバーに送信
        sendTactics(tactics, classes) {
            // UI 処理
            this.isTacticsButtonDisabled = true;
            this.statusMessage = "他の参加者が手を出すのを待っています...";
            classes.push("selectedButton");

            // 送信
            this.socket.emit(csConstants.socketEvents.selectTactics, tactics);
        },
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        // 手ボタン初期化
        this.clearTactics();

        // 参加者情報群が来た
        this.socket.on(csConstants.socketEvents.participantInfos, (participantInfosString) => {
            this.participantInfos = JSON.parse(participantInfosString);
            console.log("participantInfos 到着");
            console.log(this.participantInfos);
        });

        // 勝敗が来た
        this.socket.on(csConstants.socketEvents.judgement, (judgement) => {
            switch (judgement) {
                case csConstants.judgement.win:
                    this.judgementMessage = "勝ち！　勝利点 +1";
                    break;
                case csConstants.judgement.lose:
                    this.judgementMessage = "負け...";
                    break;
                case csConstants.judgement.draw:
                    this.judgementMessage = "あいこ";
                    break;
            }
            this.clearTactics();
            this.statusMessage = null;
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
