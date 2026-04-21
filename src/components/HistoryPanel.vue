<template>
    <div class="history-panel">
        <div class="history-header">
            <span>📜 سجل الاستعلامات ({{ history.length }})</span>
            <button
                v-if="history.length"
                @click="clearHistory"
                class="clear-btn"
            >
                مسح الكل
            </button>
        </div>

        <div v-if="history.length" class="history-list">
            <div
                v-for="(item, index) in history"
                :key="index"
                class="history-item"
            >
                <div class="history-info">
                    <span class="history-time">{{ item.timestamp }}</span>
                    <button
                        @click="$emit('load-query', item.sql)"
                        class="load-query-btn"
                    >
                        ↻
                    </button>
                    <button
                        @click="removeFromHistory(index)"
                        class="remove-btn"
                    >
                        ✕
                    </button>
                </div>
                <pre class="history-sql">{{ item.sql }}</pre>
            </div>
        </div>

        <div v-else class="empty-history">لا توجد استعلامات سابقة</div>
    </div>
</template>

<script setup>
defineProps(["history"]);
defineEmits(["load-query", "clear-history", "remove-history"]);

const removeFromHistory = (index) => {
    if (confirm("حذف هذا الاستعلام من السجل؟")) {
        emit("remove-history", index);
    }
};
</script>

<style scoped>
.history-panel {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.clear-btn {
    background: transparent;
    border: 1px solid #ff4d4d60;
    color: #ff8a8a;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    cursor: pointer;
}

.history-list {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.history-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 8px 12px;
}

.history-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
}

.history-time {
    font-size: 0.75rem;
    color: #888;
    flex: 1;
}

.load-query-btn,
.remove-btn {
    background: transparent;
    border: none;
    color: #aaa;
    cursor: pointer;
    font-size: 1rem;
    padding: 0 4px;
}

.load-query-btn:hover {
    color: #00d8ff;
}

.remove-btn:hover {
    color: #ff4d4d;
}

.history-sql {
    font-family: monospace;
    font-size: 0.85rem;
    direction: ltr;
    background: #1a1a2e;
    padding: 6px 8px;
    border-radius: 4px;
    white-space: nowrap;
    overflow-x: auto;
}
</style>
