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
        const resPO = await model.generateContent(`Aja como PO Sênior. Forneça EXCLUSIVAMENTE Critérios de Aceite Gherkin para: ${requisito}. Proibido introduções.`);
        const textoPO = resPO.response.text();
        await delay(2500);

        // AGENTE 2: QA
        const resQA = await model.generateContent(`Aja como QA Lead. Gere APENAS Casos de Teste UI com Steps baseados em: ${textoPO}. Proibido saudações.`);
        const textoQA = resQA.response.text();
        await delay(2500);

        // AGENTE 3: RM (RELEASE)
        const resRM = await model.generateContent(`Aja como Release Manager. Forneça EXCLUSIVAMENTE Relatório de Impacto e Release Notes. Base: ${textoPO} e ${textoQA} Proibido introduções.`);
        const textoRM = resRM.response.text();
        await delay(2500);

        // AGENTE 4: SIZING
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere APENAS tabela de esforço (H/M e Perfis), com 15% Gestão e 10% Buffer. Base: ${textoQA} Proibido introduções.`);
        const textoSizing = resSizing.response.text();
        await delay(2500);

        // --- NOVO AGENTE 4.5: AUDITOR (SANITIZAÇÃO) ---
        console.log("-> Operando: Agente Auditor de Sanitização");
        const resAudit = await model.generateContent(`Aja como Auditor de Qualidade e Operações. Analise se o SIZING (${textoSizing}) é suficiente para cobrir os CASOS DE TESTE (${textoQA}). Aponte riscos de subestimação ou gaps de cobertura. Seja EXTREMAMENTE técnico e direto.`);
        const textoAudit = resAudit.response.text();
        await delay(2500);

        // AGENTE 5: WAR ROOM
        const resWar = await model.generateContent(`Aja como Moderador. Gere diálogo de 4 falas sobre Riscos e Veredito GO/NO-GO baseado no relatório anterior e na Auditoria: ${textoAudit} Proibido introduções.`);
        const textoWarRoom = resWar.response.text();

        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, auditoria: textoAudit, warroom: textoWarRoom });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
