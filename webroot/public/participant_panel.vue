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

<script setup>
import { ref, onBeforeMount, onBeforeUpdate } from "vue";

// ====================================================================
// 構築時受領
// ====================================================================

const props = defineProps(["participantInfo", "playerName"]);

// ====================================================================
// リアクティブ
// ====================================================================

// ルート要素のスタイルクラス
const rootClasses = ref(["rootBase"]);

// ====================================================================
// イベントハンドラー
// ====================================================================

onBeforeMount(() => {
    updateRootClasses();
});

onBeforeUpdate(() => {
    // 通常は beforeMount() の段階で this.playerName が設定されているが、ネットワークの状態によっては
    // this.playerName よりも参加者情報群が先に届き、本コンポーネント構築時には this.playerName が
    // 設定されていないことがあり得るかもしれないので、念のため beforeUpdate() も捕捉する
    // なお、beforeUpdate() の before は「DOM 更新の前」であり、リアクティブの内容は更新済
    console.log("beforeUpdate()");
    updateRootClasses();
});

// ====================================================================
// 関数
// ====================================================================

// ルート要素のスタイルクラスを更新
function updateRootClasses() {
    if (!props.playerName) {
        return;
    }

    // 参加者名が参加者情報と異なる場合は色づけしない
    if (props.playerName !== props.participantInfo.name) {
        return;
    }

    // 役割に応じた色づけをする
    let className;
    if (props.playerName === "Host") {
        className = "playerHost";
    } else {
        className = "playerGuest";
    }
    if (!rootClasses.value.includes(className)) {
        console.log("updateRootClasses() クラス追加");
        rootClasses.value.push(className);
    }
}

</script>
