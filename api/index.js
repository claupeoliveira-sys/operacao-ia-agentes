const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.5-flash";

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        // AGENTE 1: PO
        const resPO = await model.generateContent(`Aja como PO Sênior. Forneça EXCLUSIVAMENTE Critérios de Aceite Gherkin: ${requisito}. Proibido saudações.`);
        const textoPO = resPO.response.text();
        await delay(3000);

        // AGENTE 2: QA
        const resQA = await model.generateContent(`Aja como QA Sênior. Gere APENAS Plano de Testes com Steps e Resultados Esperados: ${textoPO}`);
        const textoQA = resQA.response.text();
        await delay(3000);

        // AGENTE 3: RM (RELEASE)
        const resRM = await model.generateContent(`Aja como Release Manager. Forneça EXCLUSIVAMENTE Relatório de Impacto e Release Notes: ${textoQA}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        // AGENTE 4: SIZING
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere APENAS tabela de esforço (H/M e Perfis), 15% Gestão e 10% Buffer. Base: ${textoQA}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        // AGENTE 4.5: AUDITOR (SANITIZAÇÃO)
        const resAudit = await model.generateContent(`Aja como Auditor de Qualidade. Cruze o SIZING (${textoSizing}) com os TESTES (${textoQA}). Aponte gaps ou riscos de subestimação.`);
        const textoAudit = resAudit.response.text();
        await delay(3000);

        // AGENTE 5: WAR ROOM
        const resWar = await model.generateContent(`Aja como Moderador. Diálogo de 4 falas sobre Riscos e Veredito GO/NO-GO baseado no relatório e auditoria: ${textoAudit}`);
        const textoWarRoom = resWar.response.text();

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, auditoria: textoAudit, warroom: textoWarRoom });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
