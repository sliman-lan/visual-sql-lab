import { ref } from "vue";

const STORAGE_KEY = "sql_lab_history";
const MAX_HISTORY = 15;

export function useHistory() {
    const history = ref([]);

    const loadHistory = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            history.value = stored ? JSON.parse(stored) : [];
        } catch {
            history.value = [];
        }
    };

    const addToHistory = (sql) => {
        if (!sql.trim()) return;

        // تجنب التكرار المتتالي
        if (history.value[0]?.sql === sql) return;

        history.value.unshift({
            sql,
            timestamp: new Date().toLocaleTimeString("ar-SA"),
        });

        if (history.value.length > MAX_HISTORY) {
            history.value.pop();
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
    };

    const clearHistory = () => {
        history.value = [];
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeFromHistory = (index) => {
        history.value.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
    };

    loadHistory();

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
    };
}
