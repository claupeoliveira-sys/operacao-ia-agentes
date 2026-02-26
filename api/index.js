const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        if (!process.env.GEMINI_API_KEY) throw new Error("API KEY faltando nas variáveis de ambiente.");

        const model = genAI.getGenerativeModel({ model: "gemini-3" });

        // AGENTE 1: PO
        const resultPO = await model.generateContent(`Aja como um Product Owner Sênior. Sua saída deve conter APENAS o documento técnico de Critérios de Aceite em formato Gherkin. Proibido usar introduções, saudações ou frases de polidez. Requisito para processamento: ${requisito}`);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA
        const resultQA = await model.generateContent(`Aja como Analista de QA Sênior especializado em Automação. Com base nos Critérios de Aceite fornecidos, gere APENAS o Plano de Testes estruturado para execução. Proibido diálogos ou explicações. Documento de Referência (PO): ${textoPO}`);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RELEASE MANAGER
        const resultRM = await model.generateContent(`Aja como Release Manager. Analise o trabalho do PO e QA e gere um relatório executivo de impacto técnico. Sem introduções. ESTRUTURA: ### RELATÓRIO DE RELEASE | Escopo Resumido | Análise de Risco | Impacto Operacional. Dados Técnicos: ${textoPO} e ${textoQA}`);
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING (Baseado no seu Case de Sizing)
        const resultSizing = await model.generateContent(`Aja como Gerente de Sizing e Costing. Gere uma estimativa técnica precisa para faturamento. REGRAS: Defina Senioridade (Jr/Pl/Sr), adicione 15% Gestão e 10% Buffer. ESTRUTURA: ### SIZING | Perfis Alocados | Desenvolvimento | Testes | Gestão | Total Horas. Insumos: ${textoPO} e ${textoQA}`);
        const textoSizing = resultSizing.response.text();

        // AGENTE 5: WAR ROOM (A "Discussão" solicitada)
        const resultWarRoom = await model.generateContent(`Aja como um Moderador de reunião técnica. Gere um diálogo curto de 2 falas por perfil respondendo entre si, entre PO, QA e Sizing discutindo um ponto crítico de risco deste projeto e como mitigá-lo. Termine com a 'Decisão Final' e 'Observações'. Base: ${textoPO}, ${textoQA} e ${textoSizing}`);
        const textoWarRoom = resultWarRoom.response.text();

        // Retorno garantido como JSON
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            po: textoPO,
            qa: textoQA,
            rm: textoRM,
            sizing: textoSizing,
            warroom: textoWarRoom
        });

    } catch (error) {
        console.error("ERRO BACKEND:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
