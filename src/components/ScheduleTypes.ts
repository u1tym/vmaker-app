export const enum ScheduleType {
    Todo,
    Task,
}

export interface ScheduleRecord {
    id: number
    schedule_type: ScheduleType
    title: string
    all_day_flag: boolean
    start: Date
    end: Date
}
