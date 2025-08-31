<template>
    <div class="elem-all">
        <div class="elem-top">
            <div ref="ref_tl"></div>
            <div class="elem-top-right">
                <div ref="ref_tra"></div>
            </div>
        </div>
        <div class="elem-bottom" ref="ref_b">
            <div class="elem-bottom-left">
                <div ref="ref_bla"></div>
            </div>
            <div class="elem-bottom-right">
                <div ref="ref_bra" ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.elem-all {
    display: flex;
    flex-direction: column;
    border: 1px solid #00f;
    width: 100%;
    height: 100%;
}
.elem-top {
    display: flex;
    flex-direction: row;
    flex: 1;
    border-bottom: 1px solid #00f;
    width: 100%;
    height: 140px; /* header_h + allday_h の値に合わせる */
    min-height: 140px; /* 最小高さも設定 */
    max-height: 140px; /* 最大高さも設定 */
}

.elem-top > div:first-child {
    flex-shrink: 0; /* 幅を固定 */
}
.elem-top-right {
    overflow-x: scroll;
    flex: 1; /* 残りのスペースを占有 */
    scrollbar-width: none;
}
.elem-bottom {
    display: flex;
    flex-direction: row;
    flex: 1;
    height: 200px;
    overflow: hidden;
    width: 100%;
    height: 200px;
}
.elem-bottom-left {
    overflow-y: scroll;
    scrollbar-width: none;
}
.elem-bottom-left svg {
    display: block; /* SVGをブロック要素として表示 */
}
.elem-bottom-right {
    overflow-x: auto;
    overflow-y: scroll;
    flex: 1; /* 残りのスペースを占有 */
}

/* Webkit系ブラウザ用（Chrome, Safari, Edge等） */
.elem-bottom-right::-webkit-scrollbar {
    width: 0px;  /* 縦スクロールバーの幅を0に */
    height: 8px; /* 横スクロールバーの高さ */
}

.elem-bottom-right::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.elem-bottom-right::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.elem-bottom-right::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.elem-bottom-right svg {
    display: block; /* SVGをブロック要素として表示 */
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

import type { ScheduleRecord } from './ScheduleTypes'
import { ScheduleType } from './ScheduleTypes'

// 表示エリアの設定
interface TFConfig {
    header_h: number // ヘッダーの高さ
    allday_h: number // 終日欄の高さ
    hour_h: number  // 1時間の高さ
    hour_w: number  // 時間欄の幅
    day_w: number   // 日毎欄の幅
}


interface TFSchdAllDay {
    date: Date
    schdType: ScheduleType
    todo_done: boolean | null
    title: string
    color: string
}
interface TFSchdTime {
    startTime: Date
    endTime: Date
    schdType: ScheduleType
    todo_done: boolean | null
    title: string
    color: string
}
interface TFDay {
    date: Date
    sche_allday: TFSchdAllDay[] 
    schedules: TFSchdTime[]
}

// -----------------------------------------------------

// ランダム文字列生成
const rstr = (l: number): string => {
    const S = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from(Array(l))
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join("")
}

// 曜日取得
const getWeek = (date: Date): string => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
        return weekdays[date.getDay()];
}

const dateStart = (dt: Date): Date => {
    let d = new Date(dt)
    d.setHours(0, 0, 0, 0)
    return d
}

const dateEnd = (dt: Date): Date => {
    let d = new Date(dt)
    d.setHours(23, 59, 59, 999)
    return d
}

const acrossDay = (dtmSt: Date, dtmEd: Date, tgt: Date): boolean => {
    const tgtSt = dateStart(tgt)
    const tgtEd = dateEnd(tgt)
    if(dtmEd < tgtSt) return false
    if(tgtEd < dtmSt) return false
    return true
}

// スケジュールのソート
// 1. all_day_flag (true < false)
// 2. start (早い順)
// 3. end (早い順)
// 4. type (meeting < task < reminder)
// 5. title (辞書順)
const sortSchedules = (a: ScheduleRecord, b: ScheduleRecord): number => {
    if(a.all_day_flag && !b.all_day_flag) return -1
    if(!a.all_day_flag && b.all_day_flag) return 1
    if(a.start < b.start) return -1
    if(a.start > b.start) return 1
    if(a.end < b.end) return -1
    if(a.end > b.end) return 1
    if(a.schedule_type < b.schedule_type) return -1
    if(a.schedule_type > b.schedule_type) return 1
    if(a.title < b.title) return -1
    if(a.title > b.title) return 1
    return 0
}

interface Props {
    start: Date             // 表示開始日
    count: number           // 表示日数
    schedules: ScheduleRecord[]
}
const props = defineProps<Props>()

const ref_tl = ref(null)
const ref_tr = ref(null)
const ref_tra = ref(null)
const ref_bl = ref(null)
const ref_bla = ref(null)
const ref_br = ref(null)
const ref_bra = ref(null)
const ref_b = ref(null)

const key = rstr(8)
const keyTL = "tl_" + key
const keyTR = "tr_" + key
const keyTRA = "tra_" + key
const keyBL = "bl_" + key
const keyBLA = "bla_" + key
const keyBR = "br_" + key
const keyBRA = "bra_" + key
const keyB = "b_" + key

let schedule_list: ScheduleRecord[] = []
let schedule_start: Date | null = null
let schedule_count: number | null = null

onMounted(() => {
    console.log("onMounted")
    if(ref_tl.value) {
        (ref_tl.value as HTMLElement).id = keyTL
    }

    if(ref_tr.value) {
        (ref_tr.value as HTMLElement).id = keyTR
    }
    if(ref_tra.value) {
        (ref_tra.value as HTMLElement).id = keyTRA
    }

    if(ref_bl.value) {
        (ref_bl.value as HTMLElement).id = keyBL
    }
    if(ref_bla.value) {
        (ref_bla.value as HTMLElement).id = keyBLA
    }

    if(ref_br.value) {
        (ref_br.value as HTMLElement).id = keyBR
    }
    if(ref_bra.value) {
        (ref_bra.value as HTMLElement).id = keyBRA
    }

    if(ref_b.value) {
        (ref_b.value as HTMLElement).id = keyB
    }

    watch(
        () => props.schedules,
        (newVal) => {
            if(!newVal) return
            schedule_list = newVal.slice()
            schedule_list.sort(sortSchedules)

            draw()
        }, { immediate: true }
    )
    watch(
        () => props.start,
        (newVal) => {
            if(!newVal) return
            schedule_start = newVal

            draw()
        }, { immediate: true }
    )
    watch(
        () => props.count,
        (newVal) => {
            if(!newVal) return
            schedule_count = newVal

            draw()
        }, { immediate: true }
    )

    draw()

    // スクロール同期の設定
    setupScrollSync()
})

// スクロール同期機能
const setupScrollSync = () => {
    const leftElement = document.querySelector('.elem-bottom-left') as HTMLElement
    const rightElement = document.querySelector('.elem-bottom-right') as HTMLElement
    const topRightElement = document.querySelector('.elem-top-right') as HTMLElement

    if (!leftElement || !rightElement || !topRightElement) return

    let isScrollingVertical = false
    let isScrollingHorizontal = false

    // 縦スクロール同期（左右の要素）
    leftElement.addEventListener('scroll', (_e) => {
        if (isScrollingVertical) return
        isScrollingVertical = true

        const scrollTop = leftElement.scrollTop
        rightElement.scrollTop = scrollTop

        setTimeout(() => {
            isScrollingVertical = false
        }, 10)
    })

    rightElement.addEventListener('scroll', (_e) => {
        if (isScrollingVertical) return
        isScrollingVertical = true

        const scrollTop = rightElement.scrollTop
        leftElement.scrollTop = scrollTop

        setTimeout(() => {
            isScrollingVertical = false
        }, 10)
    })

    // 横スクロール同期（右側の要素と上部の要素）
    rightElement.addEventListener('scroll', (_e) => {
        if (isScrollingHorizontal) return
        isScrollingHorizontal = true

        const scrollLeft = rightElement.scrollLeft
        topRightElement.scrollLeft = scrollLeft

        setTimeout(() => {
            isScrollingHorizontal = false
        }, 10)
    })

    topRightElement.addEventListener('scroll', (_e) => {
        if (isScrollingHorizontal) return
        isScrollingHorizontal = true

        const scrollLeft = topRightElement.scrollLeft
        rightElement.scrollLeft = scrollLeft

        setTimeout(() => {
            isScrollingHorizontal = false
        }, 10)
    })
}

const draw = () => {
    // データがそろっていない場合は処理しない-
    if(schedule_start == null) return
    if(schedule_count == null) return
    if(schedule_list.length == 0) return

    const cnf: TFConfig = {
        header_h: 60,
        allday_h: 80,
        hour_h: 60,
        hour_w: 80,
        day_w: 200,
    }

    let elmTL = document.getElementById(keyTL)
    if(elmTL) {
        elmTL.style.width = cnf.hour_w + "px"
        elmTL.style.height = (cnf.header_h + cnf.allday_h) + "px"
    }

    let elmTR = document.getElementById(keyTR)
    if(elmTR) {
        elmTR.style.width = (cnf.day_w * 7) + "px"
        elmTR.style.height = (cnf.header_h + cnf.allday_h) + "px"
    }

    let elmTRA = document.getElementById(keyTRA)
    if(elmTRA) {
        elmTRA.style.width = (cnf.day_w * 7) + "px"
        elmTRA.style.height = (cnf.header_h + cnf.allday_h) + "px"
    }

    let elmBL = document.getElementById(keyBLA)
    if(elmBL) {
        elmBL.style.width = cnf.hour_w + "px"
        elmBL.style.height = (cnf.hour_h * 24 + 16) + "px"
    }

    let elmBR = document.getElementById(keyBRA)
    if(elmBR) {
        elmBR.style.width = (cnf.day_w * schedule_count) + "px"
        elmBR.style.height = (cnf.hour_h * 24) + "px"
    }

    const dl: TFDay[] = []
    for(let idx = 0; idx < schedule_count; ++idx) {
        const n = new Date(schedule_start)
        n.setDate(schedule_start.getDate() - 1 + idx)
        dl.push({
            date: n,
            sche_allday: [],
            schedules: []
        })
    }

    const addSchedule = (d: Date, s: ScheduleRecord, pos: number): number => {
        let res = -1
        for(let tgt of dl) {
            if(tgt.date.getFullYear() != d.getFullYear()) continue
            if(tgt.date.getMonth() != d.getMonth()) continue
            if(tgt.date.getDate() != d.getDate()) continue

            if(s.all_day_flag) {
                if(pos > 0 && tgt.sche_allday.length <= pos) {
                    const add_count = pos - tgt.sche_allday.length
                    tgt.sche_allday.push( ...Array(add_count).fill(null))
                }
                tgt.sche_allday.push({
                    date: d,
                    schdType: s.schedule_type,
                    todo_done: s.todo_done,
                    title: s.title,
                    color: s.color,
                })
                res = tgt.sche_allday.length - 1
            } else {
                if(pos > 0 && tgt.schedules.length <= pos) {
                    const add_count = pos - tgt.schedules.length
                    tgt.schedules.push( ...Array(add_count).fill(null))
                }
                const st = new Date(s.start)
                const ed = new Date(s.end)
                tgt.schedules.push({
                    startTime: st,
                    endTime: ed,
                    schdType: s.schedule_type,
                    todo_done: s.todo_done,
                    title: s.title,
                    color: s.color,
                })
                res = tgt.schedules.length - 1
            }
            break
        }
        return res
    }

    for(let s of schedule_list) {
        let s_st = new Date(s.start)
        let s_ed = new Date(s.end)
        if(s.all_day_flag) {
            s_st = dateStart(s_st)
            s_ed = dateEnd(s_ed)
        }

        let pos = 0
        for(let d of dl) {
            if(acrossDay(s_st, s_ed, d.date)) {
                let res = addSchedule(d.date, s, pos)
                if(res >= 0) {
                    pos = res
                }
            }
        }
    }

    console.log("★")
    console.log(dl)

    drawTL(cnf)
    drawTR(cnf, dl)
    drawBL(cnf)
    drawBR(cnf, schedule_count, dl)
}




interface TimesLine {
    text: string
    top: number
    bottom: number
    bottomWidth: number
    bottomColor: string
}

interface TimeBox {
    x: number
    y: number
    w: number
    h: number
    color: string
    text: string
}

const drawBL = (conf: TFConfig) => {
    const elm = d3.select("#" + keyBLA)

    let tf: TimesLine[] = []
    for(let idx = 0; idx < 24; ++idx) {
        // :00
        tf.push({
            text: ('00' + idx).slice(-2) + ":00",
            top: idx * conf.hour_h,
            bottom: idx * conf.hour_h + conf.hour_h / 2,
            bottomWidth: 0.5,
            bottomColor: "lightgray",
        })

        // :30
        tf.push({
            text: ('00' + idx).slice(-2) + ":30",
            top: idx * conf.hour_h + conf.hour_h / 2,
            bottom: (idx + 1) * conf.hour_h,
            bottomWidth: 2,
            bottomColor: "lightgray",
        })
    }

    console.log(tf)
    elm.selectAll("svg").remove()

    const all_H = conf.hour_h * 24
    const fld = elm.append("svg").attr("width", conf.hour_w).attr("height", all_H)

    fld.selectAll("line")
        .data(tf)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d) => { return d.bottom })
        .attr("x2", conf.hour_w)
        .attr("y2", (d) => { return d.bottom })
        .attr("stroke", (d) => { return d.bottomColor })
        .attr("stroke-width", (d) => { return d.bottomWidth })

    fld.selectAll("text")
        .data(tf)
        .enter()
        .append("text")
        .attr("x", 5)
        .attr("y", (d) => { return (d.top + d.bottom) / 2 })
        .attr("dominant-baseline", "middle")
        .text((d) => { return d.text })
        .attr("font-size", 12)
        .attr("fill", "gray")
}

const drawTL = (conf: TFConfig) => {
    const elm = d3.select("#" + keyTL)

    elm.selectAll("svg").remove()

    const all_W = conf.hour_w
    const all_H = conf.header_h + conf.allday_h
    const fld = elm.append("svg").attr("width", all_W).attr("height", all_H)

    fld.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", all_W)
        .attr("height", conf.header_h)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
    fld.append("rect")
        .attr("x", 0)
        .attr("y", conf.header_h)
        .attr("width", all_W)
        .attr("height", conf.allday_h)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
    fld.append("text")
        .attr("x", all_W / 2)
        .attr("y", conf.header_h + conf.allday_h / 2)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .text("終日")
        .attr("font-size", 16)
        .attr("fill", "black")
}

const pos_x = (conf: TFConfig, dl: TFDay[], dt: Date): number => {
    for(let idx = 0; idx < dl.length; ++idx) {
        if(dl[idx].date.getFullYear() != dt.getFullYear()) continue
        if(dl[idx].date.getMonth() != dt.getMonth()) continue
        if(dl[idx].date.getDate() != dt.getDate()) continue
        return idx * conf.day_w
    }
    return -1
}

const pos_y = (conf: TFConfig, dt: Date): number => {
    const h = dt.getHours()
    const m = dt.getMinutes()
    const y = h * conf.hour_h + (m / 60) * conf.hour_h
    return y
}

const pos_T_y = (conf: TFConfig, index: number): number => {
    return conf.header_h + 20 * index
}

const drawTR = (conf: TFConfig, days: TFDay[]) => {
    const elm = d3.select("#" + keyTRA)

    let day_labels: {x:number, y:number, text:string}[] = []
    for(let idx = 0; idx < days.length; ++idx) {
        console.log(String(days[idx].date.getDate()))
        day_labels.push({
            x: idx * conf.day_w + conf.day_w / 2,
            y: 40,
            text: String(days[idx].date.getDate())
        })
        day_labels.push({
            x: idx * conf.day_w + conf.day_w / 2,
            y: 20,
            text: getWeek(days[idx].date)
        })
    }

    let sch_boxes: TimeBox[] = []
    for(let d of days) {
        // 終日スケジュール
        for(let idx = 0; idx < d.sche_allday.length; ++idx) {
            const s = d.sche_allday[idx]
            if(!s) continue

            const x = pos_x(conf, days, s.date)
            const y = pos_T_y(conf, idx)
            const w = conf.day_w - 10
            const h = 16
            let color = s.color

            let text = s.title
            sch_boxes.push({
                x: x + 5,
                y: y,
                w: w,
                h: h,
                color: color,
                text: text
            })
        }
    }
    console.log(day_labels)
    elm.selectAll("svg").remove()

    const all_W = conf.day_w * days.length
    const all_H = conf.header_h + conf.allday_h
    const fld = elm.append("svg").attr("width", all_W).attr("height", all_H)

    fld.selectAll("rect.day")
        .data(day_labels)
        .enter()
        .append("rect")
        .attr("x", (_d, i) => { return i * conf.day_w })
        .attr("y", 0)
        .attr("width", conf.day_w)
        .attr("height", conf.header_h)
        .attr("fill", (_d, i) => { return i % 2 == 0 ? "#f0f0f0" : "#e0e0e0" })
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
    fld.selectAll("rect.all")
        .data(day_labels)
        .enter()
        .append("rect")
        .attr("x", (_d, i) => { return i * conf.day_w })
        .attr("y", conf.header_h)
        .attr("width", conf.day_w)
        .attr("height", conf.allday_h)
        .attr("fill", (_d, i) => { return i % 2 == 0 ? "#f0f0f0" : "#e0e0e0" })
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
    

    fld.selectAll("text")
        .data(day_labels)
        .enter()
        .append("text")
        .attr("x", (d) => { return d.x })
        .attr("y", (d) => { return d.y })
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .text((d) => { return d.text })
        .attr("font-size", 16)
        .attr("fill", "black")
    
    fld.selectAll("rect.s")
        .data(sch_boxes)
        .enter()
        .append("rect")
        .attr("x", (d) => { return d.x })
        .attr("y", (d) => { return d.y })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", (d) => { return d.w })
        .attr("height", (d) => { return d.h })
        .attr("fill", (d) => { return d.color })
        .attr("stroke", (d) => { return d.color })
        .attr("stroke-width", 1)
    
    const svg = d3.select("svg")
    const tempText = svg.append("text").attr("font-size", 12).attr("visibility", "hidden");
    if(!tempText) return;

    fld.selectAll("text.s")
        .data(sch_boxes)
        .enter()
        .append("text")
        .attr("x", (d) => { return d.x + 5 })
        .attr("y", (d) => { return d.y + d.h / 2 })
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .text((d) => {
            let text = d.text
            tempText.text(text)
            while (true) {
                let elm = tempText.node()
                if(elm == null) break

                if(!(elm.getComputedTextLength() > (d.w - 10) && text.length > 0)) break
                text = text.slice(0, -1)
                tempText.text(text + "...")
            }
            return text.length < d.text.length ? text + "..." : text
        })
        .attr("font-size", 12)
        .attr("fill", "white")
        .attr("pointer-events", "none")
}



const time_string = (dt: Date): string => {
    return ('00' + dt.getHours()).slice(-2) + ":" + ('00' + dt.getMinutes()).slice(-2)
}

const drawBR = (conf: TFConfig, days: number, dl: TFDay[]) => {
    const elm = d3.select("#" + keyBRA)

    let tf: TimesLine[] = []
    for(let idx = 0; idx < 24; ++idx) {
        // :00
        tf.push({
            text: ('00' + idx).slice(-2) + ":00",
            top: idx * conf.hour_h,
            bottom: idx * conf.hour_h + conf.hour_h / 2,
            bottomWidth: 0.5,
            bottomColor: "lightgray",
        })

        // :30
        tf.push({
            text: ('00' + idx).slice(-2) + ":30",
            top: idx * conf.hour_h + conf.hour_h / 2,
            bottom: (idx + 1) * conf.hour_h,
            bottomWidth: 2,
            bottomColor: "lightgray",
        })
    }
    let day_vl: number[] = []
    for(let d = 0; d < days; ++d) {
        day_vl.push(d * conf.day_w)
    }

    let sch_boxes: TimeBox[] = []
    for(let d of dl) {

        // 時間指定スケジュール
        for(let idx = 0; idx < d.schedules.length; ++idx) {
            const s = d.schedules[idx]
            if(!s) continue

            const x = pos_x(conf, dl, s.startTime)
            const y = pos_y(conf, s.startTime)
            const w = conf.day_w - 10
            const h = pos_y(conf, s.endTime) - pos_y(conf, s.startTime)
            let color = s.color

            let text = time_string(s.startTime) + " " + s.title
            sch_boxes.push({
                x: x + 5,
                y: y,
                w: w,
                h: h,
                color: color,
                text: text
            })
        }
    }
    console.log(tf)
    elm.selectAll("svg").remove()

    const all_H = conf.hour_h * 24
    const fld = elm.append("svg").attr("width", conf.day_w * days).attr("height", all_H)

    fld.selectAll("line.h")
        .data(tf)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d) => { return d.bottom })
        .attr("x2", conf.day_w * days)
        .attr("y2", (d) => { return d.bottom })
        .attr("stroke", (d) => { return d.bottomColor })
        .attr("stroke-width", (d) => { return d.bottomWidth })
    fld.selectAll("line.v")
        .data(day_vl)
        .enter()
        .append("line")
        .attr("x1", (d) => { return d })
        .attr("y1", 0)
        .attr("x2", (d) => { return d })
        .attr("y2", all_H)
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
    fld.selectAll("rect.s")
        .data(sch_boxes)
        .enter()
        .append("rect")
        .attr("x", (d) => { return d.x })
        .attr("y", (d) => { return d.y })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", (d) => { return d.w })
        .attr("height", (d) => { return d.h })
        .attr("fill", (d) => { return d.color })
        .attr("stroke", (d) => { return d.color })
        .attr("stroke-width", 1)
    
    const svg = d3.select("svg")
    const tempText = svg.append("text").attr("font-size", 12).attr("visibility", "hidden");
    if(!tempText) return;

    fld.selectAll("text.s")
        .data(sch_boxes)
        .enter()
        .append("text")
        .attr("x", (d) => { return d.x + 5 })
        .attr("y", (d) => { return d.y + 5 })
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "start")
        .text((d) => { 
            let text = d.text
            tempText.text(text)
            while (true) {
                let elm = tempText.node()
                if(elm == null) break

                if(!(elm.getComputedTextLength() > (d.w - 10) && text.length > 0)) break
                text = text.slice(0, -1)
                tempText.text(text + "...")
            }
            return text.length < d.text.length ? text + "..." : text
         })
        .attr("font-size", 12)
        .attr("fill", "white")
        .attr("pointer-events", "none")

}


</script>
