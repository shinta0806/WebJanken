<template>
    <div>
        <p class="hello">Hello, world!</p>
        <button @click="onButtonClicked">おまけ：{{ counter }}</button>
    </div>
</template>

<style>
.hello {
    background-color: azure;
}
</style>

<script>
export default {
    data() {
        return {
            counter: 0,
        };
    },
    methods: {
        onButtonClicked() {
            this.counter++;
        },
    },
}
</script>
