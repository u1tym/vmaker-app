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
            title: "Event 1 abcdefghijklmnopqrstuvwxyz1234567890",
            start: new Date(2025, 8 - 1, 30,  0,  0),
            end:   new Date(2025, 8 - 1, 30, 23, 59),
            schedule_type: ScheduleType.Task,
            todo_done: null,
            all_day_flag: true,
            color: '#f44336',
        },
        {
            id: 2,
            title: "Event 2",
            start: new Date(2025, 8 - 1, 30,  0,  0),
            end:   new Date(2025, 8 - 1, 31, 23, 59),
            schedule_type: ScheduleType.Todo,
            todo_done: false,
            all_day_flag: true,
            color: '#f44336',
        },
        {
            id: 3,
            title: "Event 3",
            start: new Date(2025, 9 - 1, 1, 10,  0),
            end:   new Date(2025, 9 - 1, 1, 11, 30),
            schedule_type: ScheduleType.Task,
            todo_done: null,
            all_day_flag: false,
            color: '#f44336',
        },
        {
            id: 4,
            title: "Event 4 abcdefghijklmnopqrstu",
            start: new Date(2025, 8 - 1, 27, 0, 45),
            end:   new Date(2025, 8 - 1, 27, 1, 30),
            schedule_type: ScheduleType.Task,
            todo_done: null,
            all_day_flag: false,
            color: '#f44336',
        },
    ]
})
</script>

<template>
    <div class="all">
        <C1 :schedules="slist" :start="today" :count="count"/>
    </div>
</template>

<style scoped>
.all {
    width: 90vw;
    height: 90vh;
    box-sizing: border-box;
    padding: 10px;
    overflow: hidden;
}
</style>
