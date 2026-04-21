<template>
    <div class="examples-gallery">
        <button @click="isOpen = !isOpen" class="toggle-btn">
            📚 أمثلة جاهزة {{ isOpen ? "▼" : "▶" }}
        </button>

        <div v-if="isOpen" class="examples-list">
            <div
                v-for="example in examples"
                :key="example.name"
                class="example-item"
            >
                <div class="example-header">
                    <span class="example-name">{{ example.name }}</span>
                    <button
                        @click="$emit('load-example', example.sql)"
                        class="load-btn"
                    >
                        تحميل
                    </button>
                </div>
                <p class="example-desc">{{ example.description }}</p>
                <pre class="example-sql">{{ example.sql }}</pre>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);

const examples = [
    {
        name: "🔍 تحديد الكل",
        description: "جلب جميع البيانات من جدول users",
        sql: "SELECT * FROM users",
    },
    {
        name: "📊 ترشيح بسيط",
        description: "المستخدمين الذين أعمارهم أكبر من 25 سنة",
        sql: "SELECT name, age FROM users WHERE age > 25",
    },
    {
        name: "📈 ترتيب تنازلي",
        description: "ترتيب المستخدمين حسب العمر من الأكبر للأصغر",
        sql: "SELECT * FROM users ORDER BY age DESC",
    },
    {
        name: "🧮 دالة تجميع",
        description: "متوسط أعمار المستخدمين حسب المدينة",
        sql: "SELECT city, AVG(age) AS avg_age FROM users GROUP BY city",
    },
    {
        name: "🔢 تحديد عدد",
        description: "عدد المستخدمين الإجمالي",
        sql: "SELECT COUNT(*) AS total_users FROM users",
    },
    {
        name: "🎯 شرط مركب",
        description: "مستخدمين من الرياض أو جدة وأعمارهم أقل من 30",
        sql: "SELECT * FROM users WHERE city IN ('الرياض', 'جدة') AND age < 30",
    },
];

defineEmits(["load-example"]);
</script>

<style scoped>
.examples-gallery {
    margin-bottom: 15px;
}

.toggle-btn {
    background: transparent;
    border: 1px solid #00d8ff40;
    color: #00d8ff;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-family: "Tajawal", sans-serif;
    transition: all 0.2s;
}

.toggle-btn:hover {
    background: #00d8ff20;
}

.examples-list {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.example-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 15px;
}

.example-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.example-name {
    font-weight: 600;
    color: #e0e0e0;
}

.load-btn {
    background: #0f3460;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    cursor: pointer;
}

.example-desc {
    color: #aaa;
    font-size: 0.85rem;
    margin-bottom: 8px;
}

.example-sql {
    background: #1a1a2e;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    direction: ltr;
    overflow-x: auto;
    color: #d4d4d4;
}
</style>
