<!-- src/components/DatabaseManager.vue -->
<template>
    <div class="database-manager">
        <div class="db-header">
            <div class="db-info">
                <span class="db-icon">🗄️</span>
                <span class="db-name">{{ dbName }}</span>
                <span v-if="tableList.length" class="table-count"
                    >{{ tableList.length }} جداول</span
                >
            </div>
            <div class="db-actions">
                <button @click="$emit('load-sample')" class="btn-secondary">
                    📂 عينة
                </button>
                <button @click="triggerFileInput" class="btn-primary">
                    📤 رفع ملف
                </button>
            </div>
        </div>

        <div v-if="tableList.length" class="table-list">
            <div class="list-title">📋 الجداول المتاحة:</div>
            <div class="table-tags">
                <span
                    v-for="table in tableList"
                    :key="table"
                    class="table-tag"
                    >{{ table }}</span
                >
            </div>
        </div>

        <input
            ref="fileInput"
            type="file"
            accept=".db,.sqlite,.sqlite3,.csv"
            style="display: none"
            @change="handleFileUpload"
        />

        <!-- منطقة السحب والإفلات -->
        <div
            v-if="isDragging"
            class="drop-overlay"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @dragover.prevent
        >
            <div class="drop-message">
                <span>📂</span>
                <p>أفلت الملف هنا لتحميله</p>
            </div>
        </div>

        <!-- إشعارات Toast بسيطة -->
        <div v-if="toastMessage" class="toast" :class="toastType">
            {{ toastMessage }}
        </div>
        <!-- داخل .db-actions أضف: -->
        <button
            @click="$emit('export-db')"
            class="btn-secondary"
            title="تصدير قاعدة البيانات"
        >
            💾 تصدير
        </button>
        <button
            @click="triggerJsonInput"
            class="btn-secondary"
            title="استيراد قاعدة بيانات"
        >
            📥 استيراد
        </button>

        <!-- أضف input خفي لملفات JSON -->
        <input
            ref="jsonInput"
            type="file"
            accept=".json,application/json"
            style="display: none"
            @change="handleJsonUpload"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps(["dbName", "tableList"]);
const emit = defineEmits(["load-sample", "file-loaded"]);

const fileInput = ref(null);
const isDragging = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

// إظهار إشعار مؤقت
const showToast = (message, type = "success") => {
    toastMessage.value = message;
    toastType.value = type;
    setTimeout(() => {
        toastMessage.value = "";
    }, 3000);
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        showToast(`جاري تحميل ${file.name}...`, "info");
        await emit("file-loaded", file);
        showToast(`✅ تم تحميل ${file.name} بنجاح`, "success");
    } catch (error) {
        showToast(`❌ ${error}`, "error");
    } finally {
        fileInput.value.value = "";
    }
};

const handleDrop = async (event) => {
    isDragging.value = false;
    const file = event.dataTransfer.files[0];
    if (!file) return;

    try {
        showToast(`جاري تحميل ${file.name}...`, "info");
        await emit("file-loaded", file);
        showToast(`✅ تم تحميل ${file.name} بنجاح`, "success");
    } catch (error) {
        showToast(`❌ ${error}`, "error");
    }
};

// مستمعات السحب والإفلات على مستوى النافذة
const handleDragOver = (e) => {
    e.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = (e) => {
    if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
        isDragging.value = false;
    }
};

onMounted(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
});

onUnmounted(() => {
    window.removeEventListener("dragover", handleDragOver);
    window.removeEventListener("dragleave", handleDragLeave);
});
</script>

<style scoped>
.database-manager {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
}

.db-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.db-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.db-icon {
    font-size: 24px;
}

.db-name {
    font-weight: 600;
    color: #fff;
}

.table-count {
    background: #00d8ff20;
    color: #00d8ff;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.85rem;
}

.db-actions {
    display: flex;
    gap: 10px;
}

.btn-primary,
.btn-secondary {
    padding: 8px 16px;
    border-radius: 8px;
    font-family: "Tajawal", sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: #00d8ff;
    color: #1a1a2e;
}

.btn-primary:hover {
    background: #33e0ff;
    box-shadow: 0 0 15px #00d8ff80;
}

.btn-secondary {
    background: #0f3460;
    color: #e0e0e0;
    border: 1px solid #2a4a6a;
}

.btn-secondary:hover {
    background: #1a4a7a;
}

.table-list {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.list-title {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 10px;
}

.table-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.table-tag {
    background: #0f3460;
    color: #e0e0e0;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    border: 1px solid #00d8ff40;
}

/* منطقة السحب والإفلات */
.drop-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border: 4px dashed #00d8ff;
    margin: 20px;
    border-radius: 24px;
}

.drop-message {
    text-align: center;
    color: white;
}

.drop-message span {
    font-size: 64px;
    display: block;
    margin-bottom: 20px;
}

.drop-message p {
    font-size: 24px;
    font-weight: 600;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e1e2e;
    color: white;
    padding: 12px 24px;
    border-radius: 40px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    z-index: 2000;
    border-right: 4px solid;
    animation: slideUp 0.3s ease;
}

.toast.success {
    border-color: #00d8ff;
}

.toast.error {
    border-color: #ff4d4d;
}

.toast.info {
    border-color: #ffaa00;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>
