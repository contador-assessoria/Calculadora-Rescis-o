
import { GoogleGenAI } from "@google/genai";
import { CalculationResults, CalculationInputs, TerminationReason } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REASON_LABELS: Record<TerminationReason, string> = {
    [TerminationReason.WITHOUT_CAUSE]: "Demissão sem Justa Causa",
    [TerminationReason.WITH_CAUSE]: "Demissão por Justa Causa",
    [TerminationReason.RESIGNATION]: "Pedido de Demissão",
    [TerminationReason.AGREEMENT]: "Rescisão por Acordo (Art. 484-A)",
    [TerminationReason.END_OF_CONTRACT]: "Término de Contrato"
};

export async function getCalculationExplanation(results: CalculationResults, inputs: CalculationInputs) {
  try {
    const prompt = `
      Você é um especialista em Departamento Pessoal e Direito do Trabalho no Brasil. 
      Analise o seguinte cálculo de rescisão:
      
      - Motivo: ${REASON_LABELS[inputs.reason]}
      - Salário Base: R$ ${inputs.salary.toFixed(2)}
      - Data Admissão: ${inputs.admissionDate}
      - Data Demissão: ${inputs.resignationDate}
      - Tempo de Casa: ${results.details.years} anos
      - Aviso Prévio: ${results.details.noticeDays} dias
      
      Resultados calculados:
      - Saldo de Salário: R$ ${results.salaryBalance.toFixed(2)}
      - 13º Proporcional: R$ ${results.thirteenthProportional.toFixed(2)}
      - Férias Proporcionais + 1/3: R$ ${(results.vacationsProportional + results.vacationsOneThird).toFixed(2)}
      - Aviso Prévio Indenizado: R$ ${results.noticeIndemnified.toFixed(2)}
      - Multa FGTS: R$ ${results.fgtsPenalty.toFixed(2)}
      - TOTAL LÍQUIDO: R$ ${results.totalNet.toFixed(2)}

      Explique brevemente ao colaborador seus direitos neste cenário específico, validando se o aviso prévio proporcional (Lei 12.506) foi aplicado corretamente e dando dicas sobre o saque do FGTS e Seguro Desemprego se aplicável. Mantenha um tom profissional e acolhedor. Responda em Português.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Não foi possível gerar a explicação via IA no momento. Por favor, revise os valores manualmente.";
  }
}
