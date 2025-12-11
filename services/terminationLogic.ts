
import { CalculationInputs, CalculationResults, TerminationReason, NoticeType } from '../types';

/**
 * Helper to get the difference in months and years between two dates
 * strictly following the 15-day rule for fractions.
 */
export function calculateDateDetails(admission: Date, resignation: Date, isIndemnified: boolean, salary: number) {
  const fullYears = Math.floor((resignation.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  
  // Lei 12.506/11: 30 days + 3 days per full year (max 90 total)
  let noticeDays = 30;
  if (fullYears >= 1) {
    noticeDays += Math.min(60, fullYears * 3);
  }

  // Projection
  const projectedDate = new Date(resignation);
  if (isIndemnified) {
    projectedDate.setDate(projectedDate.getDate() + noticeDays);
  }

  return {
    fullYears,
    noticeDays,
    projectedDate
  };
}

export function calculateTermination(inputs: CalculationInputs): CalculationResults {
  const { salary, admissionDate, resignationDate, reason, fgtsBalance, hasOverdueVacations, noticeType } = inputs;
  
  const adm = new Date(admissionDate);
  const res = new Date(resignationDate);
  const isIndemnified = noticeType === NoticeType.INDEMNIFIED;
  
  const { fullYears, noticeDays, projectedDate } = calculateDateDetails(adm, res, isIndemnified, salary);

  // 1. Saldo de Salário
  // Dias trabalhados no mês da demissão
  const daysInResignationMonth = res.getDate();
  let salaryBalance = (salary / 30) * daysInResignationMonth;

  // 2. 13º Salário Proporcional
  // Regra dos 15 dias: Se trabalhou 15+ dias no mês, conta como 1/12.
  // Consideramos o ano civil da demissão
  let thirteenthProportional = 0;
  if (reason !== TerminationReason.WITH_CAUSE) {
    const startOfYear = new Date(projectedDate.getFullYear(), 0, 1);
    const startCountingFrom = adm > startOfYear ? adm : startOfYear;
    
    let months = 0;
    let tempDate = new Date(startCountingFrom);
    while (tempDate <= projectedDate) {
        const currentMonthEnd = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
        const daysInMonth = (projectedDate.getMonth() === tempDate.getMonth()) 
            ? projectedDate.getDate() 
            : currentMonthEnd.getDate();
        
        const effectiveDays = (tempDate.getMonth() === startCountingFrom.getMonth())
            ? currentMonthEnd.getDate() - tempDate.getDate() + 1
            : daysInMonth;

        if (effectiveDays >= 15) months++;
        tempDate.setMonth(tempDate.getMonth() + 1);
        tempDate.setDate(1);
    }
    thirteenthProportional = (salary / 12) * Math.min(12, months);
  }

  // 3. Férias Proporcionais
  let vacationsProportional = 0;
  let vacationsOneThird = 0;
  if (reason !== TerminationReason.WITH_CAUSE) {
    // Calculado desde o último aniversário de admissão
    let lastAnniversary = new Date(projectedDate.getFullYear(), adm.getMonth(), adm.getDate());
    if (lastAnniversary > projectedDate) {
      lastAnniversary.setFullYear(lastAnniversary.getFullYear() - 1);
    }
    
    let months = 0;
    let tempDate = new Date(lastAnniversary);
    while (tempDate <= projectedDate) {
        const nextMonthRef = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate());
        const daysInPeriod = Math.floor((Math.min(projectedDate.getTime(), nextMonthRef.getTime()) - tempDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysInPeriod >= 15) months++;
        tempDate = nextMonthRef;
    }
    vacationsProportional = (salary / 12) * Math.min(12, months);
    vacationsOneThird = vacationsProportional / 3;
  }

  // 4. Férias Vencidas
  let vacationsOverdue = 0;
  if (hasOverdueVacations) {
    vacationsOverdue = salary + (salary / 3);
  }

  // 5. Aviso Prévio Indenizado
  let noticeValue = 0;
  if (reason === TerminationReason.WITHOUT_CAUSE) {
    if (noticeType === NoticeType.INDEMNIFIED) {
        noticeValue = (salary / 30) * noticeDays;
    }
  } else if (reason === TerminationReason.AGREEMENT) {
    if (noticeType === NoticeType.INDEMNIFIED) {
        noticeValue = ((salary / 30) * noticeDays) * 0.5; // Art 484-A
    }
  } else if (reason === TerminationReason.RESIGNATION) {
    if (noticeType === NoticeType.WAIVED) {
        noticeValue = -salary; // Desconto de aviso não cumprido
    }
  }

  // 6. Multa FGTS
  let fgtsPenalty = 0;
  if (reason === TerminationReason.WITHOUT_CAUSE) {
    fgtsPenalty = fgtsBalance * 0.40;
  } else if (reason === TerminationReason.AGREEMENT) {
    fgtsPenalty = fgtsBalance * 0.20;
  }

  const totalGross = salaryBalance + thirteenthProportional + vacationsProportional + vacationsOneThird + vacationsOverdue + (noticeValue > 0 ? noticeValue : 0) + fgtsPenalty;
  const totalNet = totalGross + (noticeValue < 0 ? noticeValue : 0);

  return {
    salaryBalance,
    thirteenthProportional,
    vacationsProportional,
    vacationsOneThird,
    vacationsOverdue,
    noticeIndemnified: noticeValue,
    fgtsPenalty,
    fgtsTotalBalance: fgtsBalance,
    totalGross,
    totalNet,
    details: {
        years: fullYears,
        months: 0, // Simplified for high level display
        days: 0,
        noticeDays,
        projectedDate: projectedDate.toISOString().split('T')[0]
    }
  };
}
