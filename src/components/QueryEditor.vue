<template>
    <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="اكتب استعلام SQL هنا..."
        style="
            width: 100%;
            height: 200px;
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: monospace;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #00d8ff40;
            direction: ltr;
        "
    ></textarea>
</template>

<script setup>
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
