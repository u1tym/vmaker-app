<template>
    <div>
        <div class="elem-all">
            <div class="elem-top">
                <div ref="ref_tl"></div>
                <div ref="ref_tr"></div>
            </div>
            <div class="elem-bottom" ref="ref_b">
                <div ref="ref_bl"></div>
                <div ref="ref_br"></div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.elem-all {
    display: flex;
    flex-direction: column;
    border: 1px solid #00f;
    width: 400px;
    height: 300px;
}
.elem-top {
    display: flex;
    flex-direction: row;
    flex: 1;
    border-bottom: 1px solid #00f;
}
.elem-bottom {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow-y: scroll;
    scrollbar-width: none;
    height: 200px
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

interface TFConfig {

    hour_h: number
    hour_w: number
    day_w: number
}

const rstr = (l: number): string => {
    const S = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from(Array(l))
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join("")
}

const ref_tl = ref(null)
const ref_tr = ref(null)
const ref_bl = ref(null)
const ref_br = ref(null)
const ref_b = ref(null)

const key = rstr(8)
const keyTL = "tl_" + key
const keyTR = "tr_" + key
const keyBL = "bl_" + key
const keyBR = "br_" + key
const keyB = "b_" + key

onMounted(() => {
    console.log("onMounted")
    if(ref_tl.value) {
        (ref_tl.value as HTMLElement).id = keyTL
    }
    if(ref_tr.value) {
        (ref_tr.value as HTMLElement).id = keyTR
    }
    if(ref_bl.value) {
        (ref_bl.value as HTMLElement).id = keyBL
    }
    if(ref_br.value) {
        (ref_br.value as HTMLElement).id = keyBR
    }
    if(ref_b.value) {
        (ref_b.value as HTMLElement).id = keyB
    }

    test()
})

const test = () => {

    const cnf = {
        hour_h: 60,
        hour_w: 80,
        day_w: 200,
    }

    d3.select("#b")
        .attr("width", cnf.hour_w + cnf.day_w * 7)
        .attr("height", cnf.hour_h * 24)
    d3.select("#bl")
        .attr("width", cnf.hour_w)
        .attr("height", cnf.hour_h * 24)
    d3.select("#br")
        .attr("width", cnf.day_w * 7)
        .attr("height", cnf.hour_h * 24)
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
    const elm = d3.select("#" + keyBL)

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

const drawBR = (conf: TFConfig, days: number) => {
    const elm = d3.select("#" + keyBR)

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
    const fld = elm.append("svg").attr("width", conf.day_w * days).attr("height", all_H)

    fld.selectAll("line")
        .data(tf)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d) => { return d.bottom })
        .attr("x2", conf.day_w * days)
        .attr("y2", (d) => { return d.bottom })
        .attr("stroke", (d) => { return d.bottomColor })
        .attr("stroke-width", (d) => { return d.bottomWidth })
}



</script>
