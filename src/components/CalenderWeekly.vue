<template>
    <div id="a">aaa</div>
</template>

<style scoped>
#a {
    width: 300px;
    height: 200px;
    border: 1px solid #f00;
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
    console.log("xyz")
})
</script>
