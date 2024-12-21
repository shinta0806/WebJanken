// ============================================================================
//
// プレイコンポーネント
//
// ============================================================================

<template>
    <p>プレイ</p>
    <participantPanel v-for="participantInfo in participantInfos" :participantInfo="participantInfo"></participantPanel>
    <p>{{ errorMessage }}</p>
</template>

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

            // エラーメッセージ
            errorMessage: null,
        };
    },

    // ====================================================================
    // 関数
    // ====================================================================

    methods: {
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

<style></style>
