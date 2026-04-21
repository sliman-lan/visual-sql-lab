<template>
    <div style="overflow-x: auto">
        <div
            style="
                display: flex;
                justify-content: flex-end;
                margin-bottom: 10px;
            "
        >
            <button @click="exportToCSV" class="export-btn">
                📥 تصدير CSV
            </button>
        </div>
        <table v-if="data.length" class="result-table">
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col">{{ col }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, idx) in data" :key="idx">
                    <td v-for="col in columns" :key="col">{{ row[col] }}</td>
                </tr>
            </tbody>
        </table>
        <p v-else style="text-align: center; padding: 20px">
            لا توجد نتائج لعرضها
        </p>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps(["data"]);

const columns = computed(() => {
    if (!props.data.length) return [];
    return Object.keys(props.data[0]);
});

const exportToCSV = () => {
    if (!props.data.length) return;

    const headers = Object.keys(props.data[0]);
    const csvRows = [];

    csvRows.push(headers.join(","));

    for (const row of props.data) {
        const values = headers.map((header) => {
            const val = row[header];
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;",
    }); // BOM للعربية
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
</script>

<style scoped>
.result-table {
    width: 100%;
    border-collapse: collapse;
    color: #e0e0e0;
}

.result-table th,
.result-table td {
    padding: 12px 15px;
    text-align: right;
    border-bottom: 1px solid #2a2a4a;
}

.result-table th {
    background: #0f3460;
    color: #00d8ff;
    font-weight: 600;
}

.result-table tr:hover {
    background: rgba(255, 255, 255, 0.03);
}
</style>
