// ============================================================================
//
// ラウンジコンポーネント（基底）
//
// ============================================================================

<template>
</template>

<style></style>

<script>
export default {
    // ====================================================================
    // 構築時受領
    // ====================================================================

    props: ["vueApp"],

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // グループ UUID
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
    // 関数
    // ====================================================================

    methods: {
        // ソケットイベントハンドラー（ホストとゲストの共通部分）を設定
        setSocketOn() {
            // プレイ開始通知が来た
            this.socket.on(csConstants.socketEvents.startPlay, () => {
                let vueApp = this.vueApp;
                // ToDo: socket.on イベントハンドラー解除
                vueApp.unmount();

                // 新しいコンポーネント
                const options = loadModuleOptions();
                const { loadModule } = window["vue3-sfc-loader"];
                let props = {};
                props["socket"] = this.socket;
                vueApp = Vue.createApp(Vue.defineAsyncComponent(() => loadModule("./play.vue", options)), props);
                props["vueApp"] = vueApp;
                vueApp.mount(document.body);
            });

            // エラー通知が来た
            this.socket.on(csConstants.socketEvents.errorMessage, (errorMessage) => {
                this.errorMessage = errorMessage;
            });
        },
    },
}
</script>
