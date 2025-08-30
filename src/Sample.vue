<script setup lang="ts">
import { ref, onMounted } from 'vue'
import C1 from './components/CalenderWeekly.vue'
import type { ScheduleRecord } from './components/ScheduleTypes'
import { ScheduleType } from './components/ScheduleTypes'

const slist = ref<ScheduleRecord[]>([])
const today = ref<Date>(new Date(2025, 8 - 1, 28))
const count = ref<number>(7)

onMounted(() => {
    slist.value = [
        {
            id: 1,
            title: "Event 1",
            start: new Date(2025, 8 - 1, 30,  0,  0),
            end:   new Date(2025, 8 - 1, 30, 23, 59),
            schedule_type: ScheduleType.Task,
            all_day_flag: true,
        },
        {
            id: 2,
            title: "Event 2",
            start: new Date(2025, 8 - 1, 30,  0,  0),
            end:   new Date(2025, 8 - 1, 31, 23, 59),
            schedule_type: ScheduleType.Todo,
            all_day_flag: true,
        },
        {
            id: 3,
            title: "Event 3",
            start: new Date(2025, 9 - 1, 1,  0,  0),
            end:   new Date(2025, 9 - 1, 1, 23, 59),
            schedule_type: ScheduleType.Task,
            all_day_flag: true,
        },
    ]
})
</script>

<template>
    <div>
        <C1 :schedules="slist" :start="today" :count="count"/>
    </div>
</template>

<style scoped>
</style>
