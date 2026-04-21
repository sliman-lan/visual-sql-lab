<template>
    <div class="execution-stats">
        <div class="stat-item">
            <span class="stat-icon">⚡</span>
            <span class="stat-label">زمن التنفيذ:</span>
            <span class="stat-value">{{ executionTime }} ms</span>
        </div>
        <div class="stat-item" v-if="rowCount !== null">
            <span class="stat-icon">📊</span>
            <span class="stat-label">عدد الصفوف:</span>
            <span class="stat-value">{{ rowCount }}</span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    executionTime: {
        type: Number,
        default: 0,
    },
    rowCount: {
        type: Number,
        default: null,
    },
});
</script>

<style scoped>
.execution-stats {
    display: flex;
    gap: 24px;
    padding: 8px 16px;
    background: rgba(0, 216, 255, 0.05);
    border-radius: 30px;
    font-size: 0.9rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.stat-icon {
    opacity: 0.8;
}

.stat-label {
    color: #aaa;
}

.stat-value {
    color: #00d8ff;
    font-weight: 600;
}
</style>
