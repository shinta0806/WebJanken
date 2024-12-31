// ============================================================================
//
// ラウンジコンポーネント（ゲスト）
//
// ============================================================================

<template>
    <div>
        <p id="loungeTitle">ラウンジ（ゲスト）</p>
        <p>グループ：{{ groupUuid }}</p>
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

<script setup>
import { ref, onBeforeMount } from "vue";

// ====================================================================
// 構築時受領
// ====================================================================

const props = defineProps(["groupConst", "vueApp"]);

// ====================================================================
// リアクティブ
// ====================================================================

// --------------------------------------------------------------------
// ホスト・ゲスト共通部分
// --------------------------------------------------------------------

// グループ UUID
const groupUuid = ref(props.groupConst);

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
        // 既存グループ参加依頼
        //console.log(this.socket);
        //console.log(this.groupConst);
        socket.emit(csConstants.socketEvents.joinGroup, props.groupConst);
    });

    // 人数通知が来た
    socket.on(csConstants.socketEvents.numParticipants, (num) => {
        //console.log(this.vueApp);
        numParticipants.value = num;
    });

    // ホスト・ゲスト共通イベント
    setSocketOnCommon();
});

// ====================================================================
// 関数
// ====================================================================

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
