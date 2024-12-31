// ============================================================================
//
// プレイコンポーネント
//
// ============================================================================

<template>
    <p :class="playerClass">プレイ</p>
    <participantPanel v-for="participantInfo in participantInfos" :participantInfo="participantInfo"
        :playerName="playerName">
    </participantPanel>
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
.playerHost {
    background-color: #99ffff;
}

.playerGuest {
    background-color: #ddaaff;
}

.tacticsButton {
    width: 100px;
    height: 100px;
    margin-right: 20px;
}

.selectedButton {
    background-color: #ccffcc;
}

.tacticsImg {
    height: 90%;
}
</style>

<script setup>
import { ref, onBeforeMount } from "vue";
import { participantPanel } from "./participant_panel.vue";

// ====================================================================
// 構築時受領
// ====================================================================

const props = defineProps(["socket", "vueApp"]);

// ====================================================================
// リアクティブ
// ====================================================================

// 参加者表示用のスタイルクラス
const playerClass = ref(null);

// 参加者名
const playerName = ref(null);

// 参加者情報群
const participantInfos = ref(null);

// 勝敗メッセージ
const judgementMessage = ref(null);

// 手ボタンのスタイルクラス
const guClasses = ref(null);
const chokiClasses = ref(null);
const paClasses = ref(null);

// 手ボタン無効化
const isTacticsButtonDisabled = ref(false);

// ステータスメッセージ
const statusMessage = ref(null);

// エラーメッセージ
const errorMessage = ref(null);

// ====================================================================
// イベントハンドラー
// ====================================================================

onBeforeMount(() => {
    // 手ボタン初期化
    clearTactics();

    // 参加者名が来た
    props.socket.on(csConstants.socketEvents.playerName, (name) => {
        playerName.value = name;
        if (name === "Host") {
            playerClass.value = "playerHost";
        } else {
            playerClass.value = "playerGuest";
        }
    });

    // 参加者情報群が来た
    props.socket.on(csConstants.socketEvents.participantInfos, (participantInfosString) => {
        console.log("participantInfos 到着");
        const a = JSON.parse(participantInfosString);
        console.log(a);
        participantInfos.value = a;
        //participantInfos.value = JSON.parse(participantInfosString);
        console.log(participantInfos.value);
    });

    // 勝敗が来た
    props.socket.on(csConstants.socketEvents.judgement, (judgement) => {
        switch (judgement) {
            case csConstants.judgement.win:
                judgementMessage.value = "勝ち！　勝利点 +1";
                break;
            case csConstants.judgement.lose:
                judgementMessage.value = "負け...";
                break;
            case csConstants.judgement.draw:
                judgementMessage.value = "あいこ";
                break;
        }
        clearTactics();
        statusMessage = null;
    });

    // エラー通知が来た
    props.socket.on(csConstants.socketEvents.errorMessage, (message) => {
        errorMessage.value = message;
    });

    // socket.on イベントハンドラー設定完了後
    props.socket.emit(csConstants.socketEvents.playReady);
});

// ====================================================================
// 関数
// ====================================================================

// 手ボタン初期化
function clearTactics() {
    guClasses.value = ["tacticsButton"];
    chokiClasses.value = ["tacticsButton"];
    paClasses.value = ["tacticsButton"];
    isTacticsButtonDisabled.value = false;
}

// グーを出す
function onTacticsGuClicked() {
    // ToDo: button.@click の引数に csConstants.tactics.gu を記述すると認識されないのでワンクッション置いている
    sendTactics(csConstants.tactics.gu, guClasses);
}

// チョキを出す
function onTacticsChokiClicked() {
    sendTactics(csConstants.tactics.choki, chokiClasses);
}

// パーを出す
function onTacticsPaClicked() {
    sendTactics(csConstants.tactics.pa, paClasses);
}

// 手をサーバーに送信
function sendTactics(tactics, classes) {
    // UI 処理
    isTacticsButtonDisabled.value = true;
    statusMessage.value = "他の参加者が手を出すのを待っています...";
    classes.value.push("selectedButton");

    // 送信
    props.socket.emit(csConstants.socketEvents.selectTactics, tactics);
}
</script>
