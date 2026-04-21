import alasql from "alasql";

export function useParser() {
    const parseSQL = (sqlText) => {
        try {
            // استخدام محلل AlaSQL المدمج
            const ast = alasql.parse(sqlText);
            console.log("✅ تم تحليل AST:", ast);
            return ast;
        } catch (error) {
            throw new Error(`فشل تحليل SQL: ${error.message}`);
        }
    };

    return {
        parseSQL,
    };
}
