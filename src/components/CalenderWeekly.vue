<template>
    <div>
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
    </div>
</template>

<style scoped>
.elem-all {
    display: flex;
    flex-direction: column;
    border: 1px solid #00f;
    width: 600px;
    height: 300px;
}
.elem-top {
    display: flex;
    flex-direction: row;
    flex: 1;
    border-bottom: 1px solid #00f;
    width: 100%;
    height: 100px;
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
.p {
    width: 300px;
    height: 200px;
    overflow: hidden;
    border: 1px solid #000;
}
#a {
    width: 100%;
    height: 100%;
    border: 1px solid #f00;
}
.b {
    margin-top: 20px;
    width: 300px;
    height: 200px;
    border: 1px solid #f00;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'

import { ScheduleRecord, ScheduleType } from 'ScheduleType'

interface TFConfig {
    header_h: number // ヘッダーの高さ
    allday_h: number // 終日欄の高さ
    hour_h: number  // 1時間の高さ

    hour_w: number  // 時間欄の幅
    day_w: number   // 日毎欄の幅
}

const rstr = (l: number): string => {
    const S = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from(Array(l))
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join("")
}

const getWeek = (date: Date): string => {

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return weekdays[date.getDay()];
}

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

    test()

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
    leftElement.addEventListener('scroll', (e) => {
        if (isScrollingVertical) return
        isScrollingVertical = true

        const scrollTop = leftElement.scrollTop
        rightElement.scrollTop = scrollTop

        setTimeout(() => {
            isScrollingVertical = false
        }, 10)
    })

    rightElement.addEventListener('scroll', (e) => {
        if (isScrollingVertical) return
        isScrollingVertical = true

        const scrollTop = rightElement.scrollTop
        leftElement.scrollTop = scrollTop

        setTimeout(() => {
            isScrollingVertical = false
        }, 10)
    })

    // 横スクロール同期（右側の要素と上部の要素）
    rightElement.addEventListener('scroll', (e) => {
        if (isScrollingHorizontal) return
        isScrollingHorizontal = true

        const scrollLeft = rightElement.scrollLeft
        topRightElement.scrollLeft = scrollLeft

        setTimeout(() => {
            isScrollingHorizontal = false
        }, 10)
    })

    topRightElement.addEventListener('scroll', (e) => {
        if (isScrollingHorizontal) return
        isScrollingHorizontal = true

        const scrollLeft = topRightElement.scrollLeft
        rightElement.scrollLeft = scrollLeft

        setTimeout(() => {
            isScrollingHorizontal = false
        }, 10)
    })
}

const test = () => {

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

    let elmTR = document.getElementById(keyTRA)
    if(elmTR) {
        elmTR.style.width = (cnf.day_w * 7) + "px"
        elmTR.style.height = (cnf.header_h + cnf.allday_h) + "px"
    }

    let elmBL = document.getElementById(keyBLA)
    if(elmBL) {
        elmBL.style.width = cnf.hour_w + "px"
        elmBL.style.height = (cnf.hour_h * 24 + 16) + "px"
    }

    let elmBR = document.getElementById(keyBRA)
    if(elmBR) {
        elmBR.style.width = (cnf.day_w * 7) + "px"
        elmBR.style.height = (cnf.hour_h * 24) + "px"
    }

    const dl: Date[] = []
    const today = new Date()
    for(let idx = 0; idx < 7; ++idx) {
        const n = new Date()
        n.setDate(today.getDate() + idx)
        dl.push(n)
    }
    drawTR(cnf, dl)
    drawBL(cnf)
    drawBR(cnf, 7)
}




interface TimesLine {
    text: string
    top: number
    bottom: number
    bottomWidth: number
    bottomColor: string
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

const drawTR = (conf: TFConfig, days: Date[]) => {
    const elm = d3.select("#" + keyTRA)

    let day_labels: {x:number, y:number, text:string}[] = []
    for(let idx = 0; idx < days.length; ++idx) {
        console.log(String(days[idx].getDate()))
        day_labels.push({
            x: idx * conf.day_w + conf.day_w / 2,
            y: 40,
            text: String(days[idx].getDate())
        })
        day_labels.push({
            x: idx * conf.day_w + conf.day_w / 2,
            y: 20,
            text: getWeek(days[idx])
        })
    }

    console.log(day_labels)
    elm.selectAll("svg").remove()

    const all_W = conf.day_w * days.length
    const all_H = conf.header_h + conf.allday_h
    const fld = elm.append("svg").attr("width", all_W).attr("height", all_H)

    fld.selectAll("rect")
        .data(day_labels)
        .enter()
        .append("rect")
        .attr("x", (d, i) => { return i * conf.day_w })
        .attr("y", 0)
        .attr("width", conf.day_w)
        .attr("height", all_H)
        .attr("fill", (d, i) => { return i % 2 == 0 ? "#f0f0f0" : "#e0e0e0" })
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
}

const drawBR = (conf: TFConfig, days: number) => {
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
}



</script>
