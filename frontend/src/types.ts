export interface Indicators {
  rsi: number;
  macd: number;
  macd_signal: number;
  macd_histogram: number;
  ema20: number;
  ema50: number;
  ema200: number;
  bb_upper: number;
  bb_mid: number;
  bb_lower: number;
  stoch_k: number;
  stoch_d: number;
  atr: number;
  volume_ratio: number;
}

export interface Levels {
  current_price: number;
  support: number[];
  resistance: number[];
  stop_loss: number;
  target_1: number;
  target_2: number;
  target_3: number;
}

export interface TimeframeAnalysis {
  timeframe: string;
  candles: number;
  price_change_pct: number;
  indicators: Indicators;
  levels: Levels;
  signals: string[];
  score: number;
  verdict: string;
  confidence: string;
  error?: string;
}

export interface AnalysisResult {
  company: string;
  symbol: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap: number | null;
  pe_ratio: number | null;
  week52_high: number | null;
  week52_low: number | null;
  analysis: TimeframeAnalysis[];
  disclaimer: string;
}

// Investment Planner types
export interface StrategyProfile {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_surplus: number;
  savings_rate_pct: number;
  investable_monthly: number;
  goal: string;
  goal_years: number;
  risk_appetite: string;
  years_to_retire: number;
}

export interface EmergencyFund {
  target: number;
  monthly_contribution: number;
  where: string;
  months_to_build: number | string;
}

export interface CorpusBreakdown {
  monthly_sip: number;
  assumed_cagr_pct: number;
  corpus_10yr: number;
  corpus_goal_yrs: number;
}

export interface CorpusProjection {
  investable_monthly: number;
  total_10yr: number;
  total_goal_yrs: number;
  breakdown: Record<string, CorpusBreakdown>;
}

export interface StrategyResult {
  profile: StrategyProfile;
  emergency_fund: EmergencyFund;
  allocation_pct: Record<string, number>;
  monthly_amounts: Record<string, number>;
  instruments: Record<string, string[]>;
  corpus_projection: CorpusProjection;
  tax_savings: string[];
  key_rules: string[];
  disclaimer: string;
}
