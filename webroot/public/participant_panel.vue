// ============================================================================
//
// 参加者情報（一人分）表示コンポーネント
//
// ============================================================================

<template>
    <span :class="rootClasses">
        <span>{{ participantInfo.name }}</span>
        <span>：</span>
        <span>{{ participantInfo.point }} 点</span>
    </span>
</template>

<style>
.rootBase {
    margin: 0 2em 0 0;
}

.playerHost {
    background-color: #99ffff;
}

.playerGuest {
    background-color: #ddaaff;
}
</style>

<script>
export default {
    // ====================================================================
    // 構築時受領
    // ====================================================================

    props: ["participantInfo", "playerName"],

    // ====================================================================
    // リアクティブ
    // ====================================================================

    data() {
        return {
            // ルート要素のスタイルクラス
            rootClasses: ["rootBase"],
        };
    },

    // ====================================================================
    // 関数
    // ====================================================================

    methods: {
        // ルート要素のスタイルクラスを更新
        updateRootClasses() {
            if (!this.playerName) {
                return;
            }

            // 参加者名が参加者情報と異なる場合は色づけしない
            if (this.playerName !== this.participantInfo.name) {
                return;
            }

            // 役割に応じた色づけをする
            let className;
            if (this.playerName === "Host") {
                className = "playerHost";
            } else {
                className = "playerGuest";
            }
            if (!this.rootClasses.includes(className)) {
                console.log("updateRootClasses() クラス追加");
                this.rootClasses.push(className);
            }
        }
    },

    // ====================================================================
    // イベントハンドラー
    // ====================================================================

    beforeMount() {
        this.updateRootClasses();
    },

    beforeUpdate() {
        // 通常は beforeMount() の段階で this.playerName が設定されているが、ネットワークの状態によっては
        // this.playerName よりも参加者情報群が先に届き、本コンポーネント構築時には this.playerName が
        // 設定されていないことがあり得るかもしれないので、念のため beforeUpdate() も捕捉する
        // なお、beforeUpdate() の before は「DOM 更新の前」であり、リアクティブの内容は更新済
        console.log("beforeUpdate()");
        this.updateRootClasses();
    },
}
</script>
