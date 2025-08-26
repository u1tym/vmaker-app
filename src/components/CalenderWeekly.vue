<template>
    <div>
        <div class="p">
            <div id="a">aaa</div>
        </div>
        <div class="b" ref="hoge"></div>


    </div>
</template>

<style scoped>
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
    oneH_H: number
    title_W: number
    oneDay_W: number
}

const hoge = ref(null)

onMounted(() => {
    console.log("onMounted")
    test()
})

const test = () => {
    d3.select("#a")
        .selectAll("svg")
        .remove()

    d3.select("#a")
        .append("svg")
        .attr("width", 400)
        .attr("height", 300)
        .append("circle")
        .attr("cx", 200)
        .attr("cy", 150)
        .attr("r", 50)
        .style("fill", "steelblue")


    const elm = d3.select(hoge.value)
    const cnf = {
        oneH_H: 20,
        title_W: 80,
        oneDay_W: 100,
    }
    drawAll(elm, cnf)

}



interface TimesField {
    st: number
    ed: number
    text: string
}

const drawAll = (elm: d3.Selection<HTMLElement, unknown, null, undefined>, conf: TFConfig) => {
    let tf: list[TimesField] = []
    for(let idx = 0; idx < 24; ++idx) {
        tf.push({
            st: idx * conf.oneH_H,
            ed: (idx + 1) * conf.oneH_H,
            text: ('00' + idx).slice(-2) + ":00"
        })
    }

    console.log(tf)
    elm.selectAll("svg").remove()

    const all_H = conf.oneH_H * 24
    const fld = elm.append("svg").attr("width", conf.title_W).attr("height", all_H)
    fld.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", conf.title_W)
        .attr("y2", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 1)

    fld.selectAll("line")
        .data(tf)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d) => { return d.ed })
        .attr("x2", conf.title_W)
        .attr("y2", (d) => { return d.ed })
        .attr("stroke", "black")
        .attr("stroke-width", 1)

}

</script>
