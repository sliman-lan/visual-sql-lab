// src/composables/useDatabase.js
import alasql from "alasql";
import { ref } from "vue";

const db = ref(null);
const dbName = ref("بيانات تجريبية");
const tableList = ref([]);

export function useDatabase() {
    const initDatabase = () => {
        try {
            db.value = alasql;
            console.log("✅ تم تهيئة AlaSQL بنجاح");
            updateTableList();
        } catch (error) {
            console.error("فشل تحميل AlaSQL:", error);
            throw error;
        }
    };

    const updateTableList = () => {
        try {
            const tables = db.value("SHOW TABLES");
            tableList.value = tables
                .map((t) => t.tableid || t.name || Object.values(t)[0])
                .filter(Boolean);
        } catch (e) {
            tableList.value = [];
        }
    };

    // دالة تحميل CSV يدوياً (آمنة وتدعم العربية)
    const loadCSVFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;

                    // تقسيم النص إلى أسطر مع تجاهل الأسطر الفارغة
                    const lines = csvText
                        .split(/\r?\n/)
                        .filter((line) => line.trim() !== "");
                    if (lines.length < 2) {
                        reject("ملف CSV يجب أن يحتوي على رأس وبيانات");
                        return;
                    }

                    // استخراج أسماء الأعمدة من السطر الأول
                    const headers = lines[0]
                        .split(",")
                        .map((h) => h.trim().replace(/^"|"$/g, ""));

                    // تحضير اسم جدول آمن
                    let tableName = file.name
                        .replace(/\.csv$/i, "")
                        .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
                    if (!tableName || /^\d/.test(tableName))
                        tableName = "tbl_" + tableName;

                    // قراءة البيانات
                    const rows = [];
                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i]
                            .split(",")
                            .map((v) => v.trim().replace(/^"|"$/g, ""));
                        if (values.length === headers.length) {
                            const row = {};
                            headers.forEach((h, idx) => {
                                // تحويل القيم الرقمية تلقائياً
                                const num = Number(values[idx]);
                                row[h] = isNaN(num) ? values[idx] : num;
                            });
                            rows.push(row);
                        }
                    }

                    if (rows.length === 0) {
                        reject("لم يتم العثور على بيانات صالحة في الملف");
                        return;
                    }

                    // حذف الجدول إذا كان موجوداً مسبقاً
                    try {
                        db.value(`DROP TABLE IF EXISTS ${tableName}`);
                    } catch (err) {}

                    // إنشاء الجدول يدوياً باستخدام أنواع البيانات المناسبة
                    const sampleRow = rows[0];
                    const columnDefs = Object.keys(sampleRow)
                        .map((col) => {
                            const val = sampleRow[col];
                            const type =
                                typeof val === "number" ? "FLOAT" : "STRING";
                            return `\`${col}\` ${type}`;
                        })
                        .join(", ");

                    db.value(`CREATE TABLE ${tableName} (${columnDefs})`);

                    // إدخال البيانات صفاً صفاً
                    const insertStmt = db.value.compile(
                        `INSERT INTO ${tableName} VALUES (${Object.keys(
                            sampleRow,
                        )
                            .map(() => "?")
                            .join(",")})`,
                    );
                    rows.forEach((row) => {
                        const values = Object.values(row);
                        insertStmt(values);
                    });

                    dbName.value = file.name;
                    updateTableList();
                    resolve(
                        `✅ تم إنشاء جدول "${tableName}" (${rows.length} صف)`,
                    );
                } catch (error) {
                    console.error("خطأ تحليل CSV:", error);
                    reject("فشل تحليل CSV: " + error.message);
                }
            };
            reader.onerror = () => reject("فشل قراءة الملف");
            reader.readAsText(file, "UTF-8");
        });
    };

    // تصدير قاعدة البيانات الحالية كملف JSON
    const exportDatabaseAsJSON = () => {
        if (!db.value) return null;

        const tables = tableList.value;
        const exportData = {
            version: "1.0",
            tables: {},
        };

        tables.forEach((tableName) => {
            try {
                const data = db.value(`SELECT * FROM ${tableName}`);
                const schema = db.value(
                    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
                );
                exportData.tables[tableName] = {
                    schema: schema.length
                        ? schema[0].sql
                        : `CREATE TABLE ${tableName} (...)`,
                    data: data,
                };
            } catch (e) {
                console.warn(`تعذر تصدير جدول ${tableName}:`, e);
            }
        });

        return exportData;
    };

    // استيراد قاعدة بيانات من JSON
    const importDatabaseFromJSON = (jsonData) => {
        return new Promise((resolve, reject) => {
            try {
                const data =
                    typeof jsonData === "string"
                        ? JSON.parse(jsonData)
                        : jsonData;

                // حذف جميع الجداول الحالية
                tableList.value.forEach((table) => {
                    try {
                        db.value(`DROP TABLE IF EXISTS ${table}`);
                    } catch (e) {}
                });

                // إنشاء الجداول وإدخال البيانات
                Object.entries(data.tables).forEach(
                    ([tableName, tableInfo]) => {
                        // محاولة استخدام المخطط المحفوظ أو إنشاء جدول بسيط
                        try {
                            if (tableInfo.schema) {
                                db.value(tableInfo.schema);
                            } else {
                                // إنشاء جدول بسيط من البيانات
                                const sampleRow = tableInfo.data[0];
                                if (sampleRow) {
                                    const columns = Object.keys(sampleRow)
                                        .map((col) => `${col} STRING`)
                                        .join(", ");
                                    db.value(
                                        `CREATE TABLE ${tableName} (${columns})`,
                                    );
                                }
                            }
                        } catch (e) {
                            // إذا فشل المخطط، أنشئ جدولاً بسيطاً
                            const sampleRow = tableInfo.data[0];
                            if (sampleRow) {
                                const columns = Object.keys(sampleRow)
                                    .map((col) => `${col} STRING`)
                                    .join(", ");
                                db.value(
                                    `CREATE TABLE ${tableName} (${columns})`,
                                );
                            }
                        }

                        // إدخال البيانات
                        if (tableInfo.data && tableInfo.data.length) {
                            tableInfo.data.forEach((row) => {
                                const keys = Object.keys(row);
                                const values = keys.map((k) => row[k]);
                                const placeholders = keys
                                    .map(() => "?")
                                    .join(",");
                                db.value(
                                    `INSERT INTO ${tableName} (${keys.join(",")}) VALUES (${placeholders})`,
                                    values,
                                );
                            });
                        }
                    },
                );

                dbName.value = "مستورد من JSON";
                updateTableList();
                resolve(`تم استيراد ${Object.keys(data.tables).length} جداول`);
            } catch (error) {
                reject("فشل استيراد JSON: " + error.message);
            }
        });
    };

    const loadSampleData = () => {
        if (!db.value) return;

        db.value("DROP TABLE IF EXISTS users");
        db.value(`
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name STRING,
        age INT,
        city STRING
      )
    `);

        const sampleUsers = [
            { id: 1, name: "أحمد", age: 28, city: "الرياض" },
            { id: 2, name: "سارة", age: 34, city: "جدة" },
            { id: 3, name: "خالد", age: 22, city: "الدمام" },
            { id: 4, name: "نورة", age: 29, city: "مكة" },
            { id: 5, name: "فهد", age: 41, city: "المدينة" },
        ];

        db.value.tables.users.data = sampleUsers;
        dbName.value = "بيانات تجريبية";
        updateTableList();
    };

    const executeQuery = async (sql) => {
        if (!db.value) throw new Error("قاعدة البيانات غير مهيأة");
        try {
            return db.value(sql);
        } catch (error) {
            throw new Error(`خطأ في SQL: ${error.message}`);
        }
    };

    return {
        db,
        dbName,
        tableList,
        initDatabase,
        loadSampleData,
        loadCSVFile,
        exportDatabaseAsJSON,
        importDatabaseFromJSON,
        executeQuery,
        updateTableList,
    };
}
