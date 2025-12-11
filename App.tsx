
import React, { useState, useMemo } from 'react';
import { CalculationInputs, CalculationResults, TerminationReason, NoticeType } from './types';
import { calculateTermination } from './services/terminationLogic';
import { getCalculationExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    salary: 3500,
    admissionDate: '2022-01-01',
    resignationDate: '2024-05-15',
    reason: TerminationReason.WITHOUT_CAUSE,
    fgtsBalance: 8500,
    hasOverdueVacations: false,
    noticeType: NoticeType.INDEMNIFIED
  });

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const results = useMemo(() => calculateTermination(inputs), [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : finalValue
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleGenerateAiReport = async () => {
    setLoadingAi(true);
    const explanation = await getCalculationExplanation(results, inputs);
    setAiExplanation(explanation || "Erro ao gerar explicação.");
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span className="bg-blue-600 text-white p-2 rounded-lg">CLT</span>
          Calculadora de Rescisão Pro
        </h1>
        <p className="text-slate-500 mt-2">Cálculos precisos baseados na Lei 12.506 e Reforma Trabalhista.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Dados do Contrato</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Salário Base (Bruto)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">R$</span>
                    <input 
                    type="number" 
                    name="salary"
                    value={inputs.salary}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="0,00"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Data de Admissão</label>
                <input 
                  type="date" 
                  name="admissionDate"
                  value={inputs.admissionDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Data de Demissão</label>
                <input 
                  type="date" 
                  name="resignationDate"
                  value={inputs.resignationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Motivo do Desligamento</label>
                <select 
                  name="reason"
                  value={inputs.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={TerminationReason.WITHOUT_CAUSE}>Sem Justa Causa (Empregador)</option>
                  <option value={TerminationReason.RESIGNATION}>Pedido de Demissão (Empregado)</option>
                  <option value={TerminationReason.WITH_CAUSE}>Por Justa Causa</option>
                  <option value={TerminationReason.AGREEMENT}>Acordo Comum (Art. 484-A)</option>
                  <option value={TerminationReason.END_OF_CONTRACT}>Término de Contrato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Aviso Prévio</label>
                <select 
                  name="noticeType"
                  value={inputs.noticeType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={NoticeType.WORKED}>Trabalhado</option>
                  <option value={NoticeType.INDEMNIFIED}>Indenizado</option>
                  <option value={NoticeType.WAIVED}>Dispensado / Não cumprido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Saldo do FGTS (p/ Multa)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">R$</span>
                    <input 
                    type="number" 
                    name="fgtsBalance"
                    value={inputs.fgtsBalance}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  name="hasOverdueVacations"
                  id="hasOverdueVacations"
                  checked={inputs.hasOverdueVacations}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasOverdueVacations" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Possui Férias Vencidas?
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Resumo Financeiro</h3>
                <p className="text-slate-400 text-sm">Projeção estimada de valores</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-400 block uppercase tracking-wider font-semibold">Total Líquido</span>
                <span className="text-3xl font-black text-emerald-400">{formatCurrency(results.totalNet)}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Saldo de Salário</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.salaryBalance)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">13º Salário Proporcional</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.thirteenthProportional)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Férias Proporcionais</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.vacationsProportional)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">1/3 sobre Férias</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.vacationsOneThird)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Férias Vencidas (+1/3)</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.vacationsOverdue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Aviso Prévio (Proporcional)</span>
                  <span className={`font-semibold ${results.noticeIndemnified < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                    {formatCurrency(results.noticeIndemnified)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Multa FGTS</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(results.fgtsPenalty)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Total Bruto</span>
                  <span className="font-bold text-slate-900">{formatCurrency(results.totalGross)}</span>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="block text-xs text-blue-500 uppercase font-bold mb-1">Tempo de Casa</span>
                  <span className="text-lg font-bold text-blue-900">{results.details.years} Anos</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-blue-500 uppercase font-bold mb-1">Dias de Aviso</span>
                  <span className="text-lg font-bold text-blue-900">{results.details.noticeDays} Dias</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-blue-500 uppercase font-bold mb-1">Data Projetada</span>
                  <span className="text-lg font-bold text-blue-900">{results.details.projectedDate}</span>
                </div>
              </div>

              <button 
                onClick={handleGenerateAiReport}
                disabled={loadingAi}
                className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-70"
              >
                {loadingAi ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Gerando Análise Especializada...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Analisar com Inteligência Artificial
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Explanation Area */}
          {aiExplanation && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl animate-fade-in">
              <h4 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Análise do Especialista (IA)
              </h4>
              <div className="prose prose-sm max-w-none text-emerald-900 whitespace-pre-line">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm pb-8">
        <p>© 2024 Calculadora CLT Pro. Este sistema é uma simulação e não substitui o parecer jurídico oficial ou o cálculo do contador.</p>
      </footer>
    </div>
  );
};

export default App;
