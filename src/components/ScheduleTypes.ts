export const enum ScheduleType {
    Todo,
    Task,
}

export interface ScheduleRecord {
    id: number
    schedule_type: ScheduleType
    todo_done: boolean | null
    title: string
    all_day_flag: boolean
    start: Date
    end: Date
    color: string
}
