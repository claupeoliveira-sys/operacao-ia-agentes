const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const delay = ms => new Promise(res => setTimeout(res, ms));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

app.post("/api/processar", async (req, res) => {
    const { requisito, modelo } = req.body;
    const modeloFinal = modelo || "gemini-2.5-flash";

    console.log(`[${new Date().toISOString()}] 🚀 Iniciando Processamento: ${modeloFinal}`);

    try {
        const model = genAI.getGenerativeModel({ model: modeloFinal });

        // AGENTE 1: PO (DOCUMENTAÇÃO GHERKIN)
        console.log("-> Operando: Agente PO");
        const resPO = await model.generateContent(`Aja como PO Sênior. Forneça EXCLUSIVAMENTE Critérios de Aceite Gherkin para: ${requisito}. Proibido introduções.`);
        const textoPO = resPO.response.text();
        await delay(3000);

        // AGENTE 2: QA (REPOSITÓRIO DE TESTES)
        console.log("-> Operando: Agente QA");
        const resQA = await model.generateContent(`Aja como QA Lead. Gere APENAS Casos de Teste UI com Steps e Resultados Esperados baseados em: ${textoPO}. Proibido saudações.`);
        const textoQA = resQA.response.text();
        await delay(3000);

        // AGENTE 3: RM (RELATÓRIO DE IMPACTO)
        console.log("-> Operando: Agente RM");
        const resRM = await model.generateContent(`Aja como Release Manager. Forneça EXCLUSIVAMENTE Relatório de Impacto e Release Notes. Sem textos introdutórios. Base: ${textoPO} e ${textoQA}`);
        const textoRM = resRM.response.text();
        await delay(3000);

        // AGENTE 4: SIZING (CAPACITY PLANNING)
        console.log("-> Operando: Agente Sizing");
        const resSizing = await model.generateContent(`Aja como Gerente de Sizing. Gere APENAS tabela de esforço (H/M e Perfis), com 15% Gestão e 10% Buffer. Foco em otimização operacional. Base: ${textoQA}`);
        const textoSizing = resSizing.response.text();
        await delay(3000);

        // AGENTE 5: WAR ROOM (COMITÊ DE RISCO)
        console.log("-> Operando: Agente War Room");
        const resWar = await model.generateContent(`Aja como Moderador Técnico. Gere diálogo de 4 falas entre as áreas sobre Riscos e Veredito GO/NO-GO. Base: ${textoPO}, ${textoQA} e ${textoSizing}`);
        const textoWarRoom = resWar.response.text();

        console.log(`✅ Sucesso total.`);
        res.json({ po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom });

    } catch (error) {
        console.error("❌ Erro de Processamento:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
