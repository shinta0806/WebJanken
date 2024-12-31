// ============================================================================
//
// ラウンジコンポーネント（ホスト）
//
// ============================================================================

<template>
    <div>
        <p id="loungeTitle">ラウンジ（ホスト）</p>
        <p>グループを作ります。一緒にプレイしたい人に、以下の URL にアクセスしてもらってください。</p>
        <div id="showQr"></div>
        <p>{{ invitationUrl }} <button @click="onCopyClicked">コピー</button></p>
        <button @click="onPlayClicked" :disabled="isPlayButtonDisabled">{{ numParticipants }} 人でプレイ開始</button>
        <p>{{ errorMessage }}</p>
    </div>
</template>

<style>
p#loungeTitle {
    background-color: #99ffff;
}
</style>

<script setup>
import { ref, onBeforeMount } from "vue";

// ====================================================================
// 構築時受領
// ====================================================================

const props = defineProps(["vueApp"]);

// ====================================================================
// リアクティブ
// ====================================================================

// 招待 URL
const invitationUrl = ref(null);

// プレイ開始ボタン無効化
const isPlayButtonDisabled = ref(true);

// --------------------------------------------------------------------
// ホスト・ゲスト共通部分（ToDo: コンポーザブル化）
// --------------------------------------------------------------------

// グループ UUID
const groupUuid = ref(null);

// 参加人数
const numParticipants = ref(1);

// エラーメッセージ
const errorMessage = ref(null);

// ====================================================================
// 変数
// ====================================================================

// --------------------------------------------------------------------
// ホスト・ゲスト共通部分
// --------------------------------------------------------------------

// ソケット通信用
let socket = null;

// ====================================================================
// イベントハンドラー
// ====================================================================

onBeforeMount(() => {
    // ソケットインスタンス作成時に接続しに行く
    socket = io();

    // 接続時イベント
    socket.on("connect", () => {
        // 新規グループ作成依頼
        //console.log(this.socket);
        socket.emit(csConstants.socketEvents.newGroup);
    });

    // グループ UUID 通知が来た
    socket.on(csConstants.socketEvents.groupUuid, (uuid) => {
        //console.log(this.vueApp);
        groupUuid.value = uuid;
        invitationUrl.value = uuidToInvitationUrl(uuid);
        document.getElementById("showQr").textContent = "";
        new QRCode(document.getElementById("showQr"), invitationUrl.value);
    });

    // 人数通知が来た
    socket.on(csConstants.socketEvents.numParticipants, (num) => {
        //console.log("host 人数通知受領");
        numParticipants.value = num;
        isPlayButtonDisabled.value = numParticipants.value === 1;
    });

    // ホスト・ゲスト共通イベント
    setSocketOnCommon();
});

// ====================================================================
// 関数
// ====================================================================

// グループ UUID から招待用 URL を得る
function uuidToInvitationUrl(uuid) {
    let pathnamePos = location.href.indexOf(location.pathname);
    let base = location.href.substring(0, pathnamePos + location.pathname.length);
    return base + "?" + csConstants.params.group + "=" + uuid;
}

// コピーボタンがクリックされた
function onCopyClicked() {
    // 非同期メソッドだが待つ必要は無い
    navigator.clipboard.writeText(invitationUrl.value);
}

// プレイ開始ボタンがクリックされた
function onPlayClicked() {
    socket.emit(csConstants.socketEvents.startPlay);
}

// --------------------------------------------------------------------
// ホスト・ゲスト共通部分
// --------------------------------------------------------------------

// ソケットイベントハンドラー（ホストとゲストの共通部分）を設定
function setSocketOnCommon() {
    // プレイ開始通知が来た
    socket.on(csConstants.socketEvents.startPlay, () => {
        let vueApp = props.vueApp;
        //console.log(vueApp);
        // ToDo: socket.on イベントハンドラー解除
        vueApp.unmount();

        // 新しいコンポーネント
        const options = loadModuleOptions();
        const { loadModule } = window["vue3-sfc-loader"];
        let playProps = {};
        playProps["socket"] = socket;
        vueApp = Vue.createApp(Vue.defineAsyncComponent(() => loadModule("./play.vue", options)), playProps);
        playProps["vueApp"] = vueApp;
        vueApp.mount(document.body);
        //console.log("ラウンジ props");
        //console.log(props);
    });

    // エラー通知が来た
    socket.on(csConstants.socketEvents.errorMessage, (message) => {
        errorMessage.value = message;
    });
}
</script>
