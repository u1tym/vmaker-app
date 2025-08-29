const enum ScheduleType {
    Todo,
    Task,
}

export interface ScheduleRecord {
    schedule_type: ScheduleType
    title: string
    all_day_flag: boolean
    start: Date
    end: Date
}
