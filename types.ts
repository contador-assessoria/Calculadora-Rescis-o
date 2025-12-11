
export enum TerminationReason {
  WITHOUT_CAUSE = 'WITHOUT_CAUSE',
  WITH_CAUSE = 'WITH_CAUSE',
  RESIGNATION = 'RESIGNATION',
  AGREEMENT = 'AGREEMENT',
  END_OF_CONTRACT = 'END_OF_CONTRACT'
}

export enum NoticeType {
  WORKED = 'WORKED',
  INDEMNIFIED = 'INDEMNIFIED',
  WAIVED = 'WAIVED'
}

export interface CalculationInputs {
  salary: number;
  admissionDate: string;
  resignationDate: string;
  reason: TerminationReason;
  fgtsBalance: number;
  hasOverdueVacations: boolean;
  noticeType: NoticeType;
}

export interface CalculationResults {
  salaryBalance: number;
  thirteenthProportional: number;
  vacationsProportional: number;
  vacationsOneThird: number;
  vacationsOverdue: number;
  noticeIndemnified: number;
  fgtsPenalty: number;
  fgtsTotalBalance: number;
  totalGross: number;
  totalNet: number;
  details: {
    years: number;
    months: number;
    days: number;
    noticeDays: number;
    projectedDate: string;
  };
}
