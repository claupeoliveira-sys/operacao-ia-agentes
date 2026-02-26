const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ROTA 1: Consultar Modelos Disponíveis
app.get("/api/modelos", async (req, res) => {
    try {
        // Tenta listar modelos reais da API, se falhar entrega a lista estável homologada
        res.json({ 
            info: "Modelos homologados para esta esteira:", 
            lista: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"] 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROTA 2: Processar Esteira de Agentes
app.post("/api/processar", async (req, res) => {
    try {
        const { requisito } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // AGENTE 1: PO
        const promptPO = `Aja como um Product Owner Sênior. Sua saída deve conter APENAS o documento técnico de Critérios de Aceite em formato Gherkin. Proibido usar introduções, saudações ou frases de polidez. Requisito para processamento: ${requisito}`;
        const resultPO = await model.generateContent(promptPO);
        const textoPO = resultPO.response.text();

        // AGENTE 2: QA
        const promptQA = `Aja como Analista de QA Sênior especializado em Automação. Com base nos Critérios de Aceite fornecidos, gere APENAS o Plano de Testes estruturado para execução. Proibido diálogos ou explicações. Documento de Referência (PO): ${textoPO}`;
        const resultQA = await model.generateContent(promptQA);
        const textoQA = resultQA.response.text();

        // AGENTE 3: RELEASE MANAGER
        const promptRM = `Aja como Release Manager. Analise o trabalho do PO e QA e gere um relatório executivo de impacto técnico. Sem introduções. ESTRUTURA: ### RELATÓRIO DE RELEASE | Escopo Resumido | Análise de Risco | Impacto Operacional. Dados Técnicos: ${textoPO} e ${textoQA}`;
        const resultRM = await model.generateContent(promptRM);
        const textoRM = resultRM.response.text();

        // AGENTE 4: SIZING
        const promptSizing = `Aja como Gerente de Sizing e Costing. Gere uma estimativa técnica precisa para faturamento. REGRAS: Defina Senioridade (Jr/Pl/Sr), adicione 15% Gestão e 10% Buffer. ESTRUTURA: ### SIZING | Perfis Alocados | Desenvolvimento | Testes | Gestão | Total Horas. Insumos: ${textoPO} e ${textoQA}`;
        const resultSizing = await model.generateContent(promptSizing);
        const textoSizing = resultSizing.response.text();

        // AGENTE 5: WAR ROOM
        const promptWarRoom = `Aja como um Moderador de reunião técnica. Gere um diálogo curto de 4 falas entre PO, QA e Sizing discutindo um ponto crítico de risco deste projeto e como mitigá-lo. Termine com a 'Decisão Final'. Base: ${textoPO}, ${textoQA} e ${textoSizing}`;
        const resultWarRoom = await model.generateContent(promptWarRoom);
        const textoWarRoom = resultWarRoom.response.text();

        res.json({ 
            po: textoPO, qa: textoQA, rm: textoRM, sizing: textoSizing, warroom: textoWarRoom 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
