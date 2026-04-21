<template>
    <div class="container">
        <header>
            <h1>🔬 مختبر SQL البصري</h1>
            <p>اكتب استعلام SQL وشاهد كيف يعمل خطوة بخطوة</p>
        </header>

        <!-- 🆕 مدير قاعدة البيانات (رفع CSV، تصدير/استيراد JSON) -->
        <DatabaseManager
            :dbName="dbName"
            :tableList="tableList"
            @load-sample="loadSampleData"
            @file-loaded="handleFileLoaded"
            @export-db="handleExportDatabase"
            @import-db="handleImportDatabase"
        />

        <!-- 🆕 سجل الاستعلامات (يظهر أعلى المحرر) -->
        <HistoryPanel
            :history="history"
            @load-query="(sql) => (query = sql)"
            @clear-history="clearHistory"
            @remove-history="removeFromHistory"
        />

        <div class="editor-panel">
            <div class="panel-title">
                <span>📝 محرر الاستعلام</span>
                <div style="display: flex; gap: 15px; align-items: center">
                    <!-- 🆕 مؤشر الإحصاءات (يظهر وقت التنفيذ وعدد الصفوف) -->
                    <ExecutionStats
                        :executionTime="executionTime"
                        :rowCount="queryResult.length"
                        v-if="executionTime !== null"
                    />
                    <button
                        @click="executeQuery"
                        :disabled="!query"
                        class="execute-btn"
                    >
                        <span v-if="!isLoading">▶ تنفيذ وتحليل</span>
                        <span v-else class="spinner"></span>
                    </button>
                </div>
            </div>
            <QueryEditor v-model="query" />
        </div>

        <!-- 🆕 مكتبة الأمثلة الجاهزة (تظهر تحت المحرر) -->
        <ExamplesGallery @load-example="(sql) => (query = sql)" />

        <div class="editor-panel" v-if="astData">
            <div class="panel-title">🌳 شجرة التنفيذ المنطقية</div>
            <ExecutionPlan :ast="astData" :sql="query" />
        </div>

        <div class="editor-panel" v-if="queryResult.length">
            <div class="panel-title">
                📋 النتائج ({{ queryResult.length }} صف)
            </div>
            <DataTable :data="queryResult" />
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import QueryEditor from "./components/QueryEditor.vue";
import ExecutionPlan from "./components/ExecutionPlan.vue";
import DataTable from "./components/DataTable.vue";
import DatabaseManager from "./components/DatabaseManager.vue";
// 🆕 استيراد المكونات الجديدة
import HistoryPanel from "./components/HistoryPanel.vue";
import ExamplesGallery from "./components/ExamplesGallery.vue";
import ExecutionStats from "./components/ExecutionStats.vue";

import { useDatabase } from "./composables/useDatabase";
import { useParser } from "./composables/useParser";
import { useHistory } from "./composables/useHistory"; // 🆕 استيراد السجل

const query = ref("");
const astData = ref(null);
const queryResult = ref([]);
const isLoading = ref(false);
const executionTime = ref(null); // 🆕 وقت التنفيذ

const {
    dbName,
    tableList,
    initDatabase,
    loadSampleData: loadSample,
    loadCSVFile,
    exportDatabaseAsJSON,
    importDatabaseFromJSON,
    executeQuery: runQuery,
    updateTableList,
} = useDatabase();

const { parseSQL } = useParser();
const { history, addToHistory, clearHistory, removeFromHistory } = useHistory(); // 🆕 السجل

// تهيئة قاعدة البيانات
initDatabase();
loadSample(); // تحميل البيانات التجريبية افتراضياً

const executeQuery = async () => {
    if (!query.value.trim()) return;

    isLoading.value = true;
    executionTime.value = null; // تصفير الوقت

    try {
        // تحليل الاستعلام
        const ast = parseSQL(query.value);
        astData.value = ast;

        // 🆕 قياس وقت التنفيذ
        const startTime = performance.now();
        const result = await runQuery(query.value);
        const endTime = performance.now();

        executionTime.value = Math.round((endTime - startTime) * 100) / 100;
        queryResult.value = result;

        // 🆕 إضافة الاستعلام الناجح إلى السجل
        addToHistory(query.value);
    } catch (error) {
        alert("خطأ: " + error.message);
        astData.value = null;
        queryResult.value = [];
        executionTime.value = null;
    } finally {
        isLoading.value = false;
    }
};

const loadSampleData = () => {
    loadSample();
    query.value = "";
    astData.value = null;
    queryResult.value = [];
    executionTime.value = null;
};

const handleFileLoaded = async (file) => {
    isLoading.value = true;
    try {
        const extension = file.name.split(".").pop().toLowerCase();
        if (extension === "csv") {
            await loadCSVFile(file);
        } else {
            alert("يرجى رفع ملف CSV فقط");
            return;
        }
        query.value = "";
        astData.value = null;
        queryResult.value = [];
        executionTime.value = null;
        updateTableList();
    } catch (error) {
        alert("فشل تحميل الملف: " + error.message);
    } finally {
        isLoading.value = false;
    }
};

// 🆕 تصدير قاعدة البيانات
const handleExportDatabase = () => {
    const data = exportDatabaseAsJSON();
    if (!data) {
        alert("لا توجد بيانات للتصدير");
        return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

// 🆕 استيراد قاعدة البيانات
const handleImportDatabase = async (jsonString) => {
    isLoading.value = true;
    try {
        await importDatabaseFromJSON(jsonString);
        query.value = "";
        astData.value = null;
        queryResult.value = [];
        executionTime.value = null;
    } catch (error) {
        alert("فشل استيراد قاعدة البيانات: " + error.message);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 20px;
}

header h1 {
    color: #00d8ff;
    text-shadow: 0 0 20px #00d8ff80;
    margin-bottom: 8px;
}

header p {
    color: #ccc;
}

.editor-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: #00d8ff;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.execute-btn {
    background: #00d8ff;
    color: #1a1a2e;
    border: none;
    padding: 10px 24px;
    border-radius: 30px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.execute-btn:hover:not(:disabled) {
    background: #33e0ff;
    box-shadow: 0 0 15px #00d8ff80;
}

.execute-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #1a1a2e;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
