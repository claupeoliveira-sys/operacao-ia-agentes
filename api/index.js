const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.5-flash";

    console.log(`[${new Date().toISOString()}] 🚀 Processando com: ${modeloFinal}`);

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        console.log("-> Agente PO...");
        const resPO = await model.generateContent(`Aja como um Product Owner Sênior. Produza EXCLUSIVAMENTE Critérios de Aceite em formato Gherkin: ${requisito}. Proibido introduções.`);
        const textoPO = resPO.response.text();
        await delay(3000);

        console.log("-> Agente QA...");
        const resQA = await model.generateContent(`Aja como QA Sênior. Gere APENAS o Plano de Testes detalhado com Steps, Entradas e Resultados Esperados: ${textoPO}`);
        const textoQA = resQA.response.text();
        await delay(3000);

        console.log("-> Agente RM...");
        const resRM = await model.generateContent(`Aja como Release Manager. Produza EXCLUSIVAMENTE Relatório de Impacto e Release Notes. Base: ${textoPO} e ${textoQA}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        console.log("-> Agente Sizing...");
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere APENAS uma tabela de esforço (H/M e Perfis), com 15% Gestão e 10% Buffer. Base: ${textoQA}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        // --- AGENTE DE SANITIZAÇÃO (Auditoria de Coerência) ---
        console.log("-> Agente Auditoria...");
        const resAudit = await model.generateContent(`Aja como Auditor de Qualidade. Analise tecnicamente se o SIZING (${textoSizing}) é suficiente para os TESTES (${textoQA}). Aponte riscos ou gaps. Seja direto.`);
        const textoAudit = resAudit.response.text();
        await delay(3000);

        console.log("-> Agente War Room...");
        const resWar = await model.generateContent(`Aja como Moderador. Gere diálogo de 4 falas sobre Riscos e Veredito GO/NO-GO baseado no relatório e auditoria: ${textoAudit}`);
        const textoWarRoom = resWar.response.text();

        console.log(`✅ Sucesso com ${modeloFinal}`);
        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, auditoria: textoAudit, warroom: textoWarRoom });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
