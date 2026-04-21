<template>
    <div ref="treeContainer" class="tree-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import * as d3 from "d3";

const props = defineProps(["ast", "sql"]); // <-- أضفنا sql هنا

const treeContainer = ref(null);

// تحويل AST أو SQL إلى تنسيق D3 (يدوياً)
const transformToTree = (ast, sqlText) => {
    const sql = sqlText || "";
    const root = {
        name: "SQL Query",
        children: [],
    };

    // 1. نوع العملية (SELECT, INSERT...)
    const commandMatch = sql.match(/^\s*(\w+)/i);
    if (commandMatch) {
        root.children.push({
            name: `نوع العملية: ${commandMatch[1].toUpperCase()}`,
        });
    }

    // 2. الأعمدة المختارة
    const columnsMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (columnsMatch) {
        const cols = columnsMatch[1].split(",").map((c) => c.trim());
        root.children.push({ name: `SELECT: ${cols.join(", ")}` });
    }

    // 3. اسم الجدول
    const fromMatch = sql.match(/FROM\s+([^\s;]+)/i);
    if (fromMatch) {
        root.children.push({ name: `FROM: ${fromMatch[1]}` });
    }

    // 4. شرط WHERE
    const whereMatch = sql.match(
        /WHERE\s+(.+?)(?:\s+GROUP|\s+ORDER|\s+LIMIT|\s*;|\s*$)/i,
    );
    if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        const whereNode = { name: "WHERE", children: [] };

        // تحليل شرط بسيط: عمود > قيمة
        const conditionMatch = whereClause.match(/(\w+)\s*([<>=!]+)\s*(.+)/);
        if (conditionMatch) {
            const [, left, op, right] = conditionMatch;
            whereNode.children.push({ name: `الطرف الأيسر: ${left}` });
            whereNode.children.push({ name: `العامل: ${op}` });
            whereNode.children.push({ name: `الطرف الأيمن: ${right}` });
        } else {
            whereNode.children.push({ name: whereClause });
        }
        root.children.push(whereNode);
    }

    // 5. ORDER BY
    const orderMatch = sql.match(/ORDER BY\s+(.+?)(?:\s+LIMIT|\s*;|\s*$)/i);
    if (orderMatch) {
        root.children.push({ name: `ORDER BY: ${orderMatch[1].trim()}` });
    }

    // 6. GROUP BY
    const groupMatch = sql.match(
        /GROUP BY\s+(.+?)(?:\s+HAVING|\s+ORDER|\s*;|\s*$)/i,
    );
    if (groupMatch) {
        root.children.push({ name: `GROUP BY: ${groupMatch[1].trim()}` });
    }

    return root;
};

// دالة رسم الشجرة
const drawTree = async (data) => {
    if (!treeContainer.value) return;

    await nextTick();

    const container = treeContainer.value;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    d3.select(container).selectAll("*").remove();

    const svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g");

    const treeLayout = d3
        .tree()
        .size([height - 100, width - 200])
        .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // عكس الإحداثيات للـ RTL
    treeData.descendants().forEach((d) => {
        const temp = d.x;
        d.x = width - d.y - 80;
        d.y = temp;
    });

    // رسم الروابط
    g.selectAll(".link")
        .data(treeData.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
            "d",
            d3
                .linkHorizontal()
                .x((d) => d.x)
                .y((d) => d.y),
        )
        .attr("fill", "none")
        .attr("stroke", "#00d8ff60")
        .attr("stroke-width", 2);

    // رسم العقد
    const nodes = g
        .selectAll(".node")
        .data(treeData.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodes
        .append("circle")
        .attr("r", 8)
        .attr("fill", "#0f3460")
        .attr("stroke", "#00d8ff")
        .attr("stroke-width", 2);

    nodes
        .append("text")
        .attr("dy", -15)
        .attr("text-anchor", "middle")
        .attr("fill", "#e0e0e0")
        .attr("font-family", "Tajawal, sans-serif")
        .attr("font-size", "14px")
        .text((d) => d.data.name);

    // ضبط viewBox تلقائياً
    const bbox = g.node().getBBox();
    const padding = 40;
    svg.attr(
        "viewBox",
        `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`,
    );
};

onMounted(() => {
    if (props.ast || props.sql) {
        const treeData = transformToTree(props.ast, props.sql);
        drawTree(treeData);
    }
});

watch([() => props.ast, () => props.sql], async ([newAst, newSql]) => {
    if (newAst || newSql) {
        const treeData = transformToTree(newAst, newSql);
        await drawTree(treeData);
    }
});
</script>

<style scoped>
.tree-container {
    width: 100%;
    height: 500px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    overflow: auto;
    position: relative;
    direction: rtl;
}
.tree-container svg {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
