import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

BSE_SUFFIX = ".BO"
NSE_SUFFIX = ".NS"

def get_ticker(company: str) -> tuple[yf.Ticker, str, str]:
    symbol = company.strip().upper()
    for suffix, exchange in [(NSE_SUFFIX, "NSE"), (BSE_SUFFIX, "BSE")]:
        ticker = yf.Ticker(symbol + suffix)
        info = ticker.fast_info
        try:
            price = info.last_price
            if price and price > 0:
                return ticker, symbol + suffix, exchange
        except Exception:
            pass
    raise ValueError(f"Could not find '{company}' on NSE or BSE. Try the exact ticker symbol.")


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def compute_macd(series: pd.Series):
    ema12 = series.ewm(span=12, adjust=False).mean()
    ema26 = series.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_bollinger(series: pd.Series, period: int = 20):
    sma = series.rolling(period).mean()
    std = series.rolling(period).std()
    return sma + 2 * std, sma, sma - 2 * std


def compute_stochastic(high: pd.Series, low: pd.Series, close: pd.Series, k=14, d=3):
    low_min = low.rolling(k).min()
    high_max = high.rolling(k).max()
    k_pct = 100 * (close - low_min) / (high_max - low_min).replace(0, np.nan)
    d_pct = k_pct.rolling(d).mean()
    return k_pct, d_pct


def compute_atr(high, low, close, period=14):
    tr = pd.concat([
        high - low,
        (high - close.shift()).abs(),
        (low - close.shift()).abs()
    ], axis=1).max(axis=1)
    return tr.rolling(period).mean()


def support_resistance(close: pd.Series, n=5):
    highs, lows = [], []
    arr = close.values
    for i in range(n, len(arr) - n):
        if arr[i] == max(arr[i-n:i+n+1]):
            highs.append(arr[i])
        if arr[i] == min(arr[i-n:i+n+1]):
            lows.append(arr[i])
    resistance = sorted(set(round(x, 2) for x in highs), reverse=True)[:3]
    support = sorted(set(round(x, 2) for x in lows), reverse=False)[:3]
    return support, resistance


def analyze_timeframe(df: pd.DataFrame, label: str):
    # Drop rows where Close is NaN (e.g. today's incomplete candle)
    df = df.dropna(subset=["Close"])
    close = df["Close"].squeeze()
    high = df["High"].squeeze()
    low = df["Low"].squeeze()
    volume = df["Volume"].squeeze()

    rsi = compute_rsi(close)
    macd_line, signal_line, histogram = compute_macd(close)
    bb_upper, bb_mid, bb_lower = compute_bollinger(close)
    k_pct, d_pct = compute_stochastic(high, low, close)
    atr = compute_atr(high, low, close)

    ema20 = close.ewm(span=20, adjust=False).mean()
    ema50 = close.ewm(span=50, adjust=False).mean()
    ema200 = close.ewm(span=200, adjust=False).mean()
    sma20 = close.rolling(20).mean()

    def safe(series, decimals=2):
        v = float(series.iloc[-1])
        return round(v, decimals) if not np.isnan(v) else 0.0

    latest = float(close.iloc[-1])
    rsi_val = safe(rsi)
    macd_val = safe(macd_line, 4)
    signal_val = safe(signal_line, 4)
    hist_val = safe(histogram, 4)
    bb_upper_val = safe(bb_upper)
    bb_lower_val = safe(bb_lower)
    bb_mid_val = safe(bb_mid)
    k_val = safe(k_pct)
    d_val = safe(d_pct)
    atr_val = safe(atr)
    ema20_val = safe(ema20)
    ema50_val = safe(ema50)
    ema200_val = safe(ema200)

    vol_avg = float(volume.rolling(20).mean().iloc[-1])
    vol_latest = float(volume.iloc[-1])
    vol_ratio = round(vol_latest / vol_avg, 2) if vol_avg else 1.0

    price_change_pct = round((float(close.iloc[-1]) - float(close.iloc[0])) / float(close.iloc[0]) * 100, 2)

    support, resistance = support_resistance(close)

    # --- Scoring ---
    score = 0
    signals = []

    # Trend
    if latest > ema20_val > ema50_val:
        score += 2; signals.append("Price above EMA20 > EMA50 (bullish trend)")
    elif latest < ema20_val < ema50_val:
        score -= 2; signals.append("Price below EMA20 < EMA50 (bearish trend)")

    if len(close) >= 200 and not np.isnan(ema200_val):
        if latest > ema200_val:
            score += 1; signals.append("Price above EMA200 (long-term bullish)")
        else:
            score -= 1; signals.append("Price below EMA200 (long-term bearish)")

    # RSI
    if rsi_val < 30:
        score += 2; signals.append(f"RSI={rsi_val} — oversold, potential reversal up")
    elif rsi_val > 70:
        score -= 2; signals.append(f"RSI={rsi_val} — overbought, potential reversal down")
    elif 40 <= rsi_val <= 60:
        score += 1; signals.append(f"RSI={rsi_val} — neutral / healthy momentum")
    else:
        signals.append(f"RSI={rsi_val}")

    # MACD
    if macd_val > signal_val and hist_val > 0:
        score += 2; signals.append("MACD above signal & positive histogram (bullish momentum)")
    elif macd_val < signal_val and hist_val < 0:
        score -= 2; signals.append("MACD below signal & negative histogram (bearish momentum)")
    elif macd_val > signal_val:
        score += 1; signals.append("MACD crossed above signal (early bullish)")
    else:
        score -= 1; signals.append("MACD below signal (early bearish)")

    # Bollinger Bands
    if latest < bb_lower_val:
        score += 1; signals.append(f"Price below lower BB={bb_lower_val} — potential bounce")
    elif latest > bb_upper_val:
        score -= 1; signals.append(f"Price above upper BB={bb_upper_val} — potential pullback")
    else:
        signals.append(f"Price within BB ({bb_lower_val}–{bb_upper_val})")

    # Stochastic
    if k_val < 20 and d_val < 20:
        score += 1; signals.append(f"Stochastic oversold K={k_val}, D={d_val}")
    elif k_val > 80 and d_val > 80:
        score -= 1; signals.append(f"Stochastic overbought K={k_val}, D={d_val}")

    # Volume
    if vol_ratio > 1.5:
        signals.append(f"Volume surge ({vol_ratio}x avg) — confirms current move")
    elif vol_ratio < 0.5:
        signals.append(f"Low volume ({vol_ratio}x avg) — weak conviction")

    # Verdict
    if score >= 4:
        verdict = "STRONG BUY"
        confidence = "High"
    elif score >= 2:
        verdict = "BUY"
        confidence = "Moderate"
    elif score <= -4:
        verdict = "STRONG SELL"
        confidence = "High"
    elif score <= -2:
        verdict = "SELL"
        confidence = "Moderate"
    else:
        verdict = "HOLD / NEUTRAL"
        confidence = "Low"

    # Levels
    current = round(float(latest), 2)
    stop_loss = round(current - 1.5 * atr_val, 2)
    target1 = round(current + 1.5 * atr_val, 2)
    target2 = round(current + 3.0 * atr_val, 2)
    target3 = round(current + 4.5 * atr_val, 2)

    return {
        "timeframe": label,
        "candles": len(df),
        "price_change_pct": price_change_pct,
        "indicators": {
            "rsi": rsi_val,
            "macd": macd_val,
            "macd_signal": signal_val,
            "macd_histogram": hist_val,
            "ema20": ema20_val,
            "ema50": ema50_val,
            "ema200": ema200_val,
            "bb_upper": bb_upper_val,
            "bb_mid": bb_mid_val,
            "bb_lower": bb_lower_val,
            "stoch_k": k_val,
            "stoch_d": d_val,
            "atr": atr_val,
            "volume_ratio": vol_ratio,
        },
        "levels": {
            "current_price": current,
            "support": support,
            "resistance": resistance,
            "stop_loss": stop_loss,
            "target_1": target1,
            "target_2": target2,
            "target_3": target3,
        },
        "signals": signals,
        "score": score,
        "verdict": verdict,
        "confidence": confidence,
    }


@app.route("/api/analyze", methods=["GET"])
def analyze():
    company = request.args.get("company", "").strip()
    if not company:
        return jsonify({"error": "company parameter is required"}), 400

    try:
        ticker, symbol, exchange = get_ticker(company)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    info = ticker.info
    name = info.get("longName") or info.get("shortName") or symbol
    sector = info.get("sector", "N/A")
    industry = info.get("industry", "N/A")
    market_cap = info.get("marketCap")
    pe_ratio = info.get("trailingPE")
    week52_high = info.get("fiftyTwoWeekHigh")
    week52_low = info.get("fiftyTwoWeekLow")

    end = datetime.today()
    results = []

    for months, label, interval in [
        (1, "1 Month", "1d"),
        (3, "3 Months", "1d"),
        (6, "6 Months", "1d"),
    ]:
        start = end - timedelta(days=months * 31)
        df = ticker.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"), interval=interval)
        if df.empty or len(df) < 20:
            results.append({"timeframe": label, "error": "Insufficient data"})
            continue
        results.append(analyze_timeframe(df, label))

    return jsonify({
        "company": name,
        "symbol": symbol,
        "exchange": exchange,
        "sector": sector,
        "industry": industry,
        "market_cap": market_cap,
        "pe_ratio": round(pe_ratio, 2) if pe_ratio else None,
        "week52_high": week52_high,
        "week52_low": week52_low,
        "analysis": results,
        "disclaimer": "This analysis is for educational purposes only and does not constitute financial advice. Always consult a SEBI-registered advisor before investing.",
    })


def build_strategy(data: dict) -> dict:
    age = int(data["age"])
    monthly_income = float(data["monthly_income"])
    monthly_expenses = float(data["monthly_expenses"])
    goal = data["goal"].strip()
    goal_years = int(data.get("goal_years", 10))
    risk_appetite = data.get("risk_appetite", "moderate").lower()

    monthly_surplus = monthly_income - monthly_expenses
    annual_income = monthly_income * 12
    savings_rate = round((monthly_surplus / monthly_income) * 100, 1) if monthly_income else 0
    years_to_retire = max(60 - age, 0)

    # --- Emergency Fund ---
    emergency_months = 6
    emergency_target = monthly_expenses * emergency_months

    # --- Rule-of-thumb equity % (100 - age, adjusted for risk) ---
    base_equity = 100 - age
    if risk_appetite == "aggressive":
        base_equity = min(base_equity + 10, 90)
    elif risk_appetite == "conservative":
        base_equity = max(base_equity - 15, 20)
    base_equity = max(20, min(80, base_equity))
    debt_pct = 100 - base_equity

    # --- Allocation buckets (% of investable surplus) ---
    # Emergency fund first — redirect 20% of surplus until built up
    emergency_monthly = round(monthly_surplus * 0.20, 0)
    investable = monthly_surplus - emergency_monthly

    if investable <= 0:
        investable = monthly_surplus
        emergency_monthly = 0

    # Equity sub-allocation
    eq = base_equity / 100
    db = debt_pct / 100

    large_cap_pct   = round(eq * 0.40, 3)
    mid_cap_pct     = round(eq * 0.25, 3)
    small_cap_pct   = round(eq * 0.15 if age < 45 else eq * 0.05, 3)
    intl_pct        = round(eq * 0.10, 3)
    gold_pct        = round(eq * 0.10, 3)

    ppf_pct         = round(db * 0.30, 3)
    debt_mf_pct     = round(db * 0.40, 3)
    nps_pct         = round(db * 0.30 if age < 55 else 0, 3)

    # Normalise to sum = 1
    total = large_cap_pct + mid_cap_pct + small_cap_pct + intl_pct + gold_pct + ppf_pct + debt_mf_pct + nps_pct
    def norm(x): return round(x / total * 100, 1) if total else 0

    allocation = {
        "Large Cap Equity (Nifty 50 Index)":    norm(large_cap_pct),
        "Mid Cap Equity (Nifty Midcap 150)":    norm(mid_cap_pct),
        "Small Cap Equity":                     norm(small_cap_pct),
        "International Equity (US/Global)":     norm(intl_pct),
        "Gold (SGBs / Gold ETF)":               norm(gold_pct),
        "PPF (Public Provident Fund)":          norm(ppf_pct),
        "Debt Mutual Funds":                    norm(debt_mf_pct),
        "NPS (Tier-1)":                         norm(nps_pct),
    }

    # Remove zero buckets
    allocation = {k: v for k, v in allocation.items() if v > 0}

    # Monthly amounts
    monthly_amounts = {k: round(investable * v / 100, 0) for k, v in allocation.items()}

    # --- Specific instruments ---
    instruments = {
        "Large Cap Equity (Nifty 50 Index)": [
            "Nifty 50 Index Fund — UTI Nifty 50 Index Fund (ER: 0.20%)",
            "Nifty 50 Index Fund — HDFC Index Fund Nifty 50 Plan (ER: 0.20%)",
        ],
        "Mid Cap Equity (Nifty Midcap 150)": [
            "Motilal Oswal Nifty Midcap 150 Index Fund (ER: 0.30%)",
            "Navi Nifty Midcap 150 Index Fund (ER: 0.12%)",
        ],
        "Small Cap Equity": [
            "Nippon India Small Cap Fund (active, strong track record)",
            "Quant Small Cap Fund (high risk-high reward, active)",
        ],
        "International Equity (US/Global)": [
            "Motilal Oswal S&P 500 Index Fund",
            "Mirae Asset NYSE FANG+ ETF (tech-heavy, aggressive)",
        ],
        "Gold (SGBs / Gold ETF)": [
            "RBI Sovereign Gold Bonds (SGBs) — 2.5% interest + gold appreciation",
            "Nippon India Gold BeES ETF (liquid, low cost)",
        ],
        "PPF (Public Provident Fund)": [
            "PPF Account — Post Office / SBI (7.1% p.a., tax-free, 15yr lock-in)",
            "Max ₹1.5L/yr, EEE status — best guaranteed return instrument",
        ],
        "Debt Mutual Funds": [
            "HDFC Short Duration Fund (2–3yr horizon, lower risk)",
            "ICICI Prudential Corporate Bond Fund (AAA rated papers)",
        ],
        "NPS (Tier-1)": [
            "NPS Auto Choice — Moderate LC-50 (50% equity till age 35, tapers down)",
            "Additional ₹50k/yr deduction under Sec 80CCD(1B) — saves ₹15,600/yr tax",
        ],
    }

    # --- Corpus projection (SIP compounding) ---
    # Conservative CAGR assumptions by asset class
    cagr_map = {
        "Large Cap Equity (Nifty 50 Index)": 0.12,
        "Mid Cap Equity (Nifty Midcap 150)": 0.14,
        "Small Cap Equity": 0.16,
        "International Equity (US/Global)": 0.12,
        "Gold (SGBs / Gold ETF)": 0.08,
        "PPF (Public Provident Fund)": 0.071,
        "Debt Mutual Funds": 0.075,
        "NPS (Tier-1)": 0.10,
    }

    total_corpus_10yr = 0
    total_corpus_goal = 0
    corpus_breakdown = {}

    for asset, pct in allocation.items():
        monthly_sip = investable * pct / 100
        r = cagr_map.get(asset, 0.10)
        mr = r / 12

        def future_value(sip, rate_monthly, n_months):
            if rate_monthly == 0:
                return sip * n_months
            return sip * (((1 + rate_monthly) ** n_months - 1) / rate_monthly) * (1 + rate_monthly)

        c10 = future_value(monthly_sip, mr, 120)
        cg  = future_value(monthly_sip, mr, goal_years * 12)
        total_corpus_10yr += c10
        total_corpus_goal += cg
        corpus_breakdown[asset] = {
            "monthly_sip": round(monthly_sip, 0),
            "assumed_cagr_pct": round(r * 100, 1),
            "corpus_10yr": round(c10, 0),
            "corpus_goal_yrs": round(cg, 0),
        }

    # --- Tax saving summary ---
    tax_savings = []
    if allocation.get("PPF (Public Provident Fund)", 0) > 0:
        tax_savings.append("PPF: Up to ₹46,800/yr tax saved (₹1.5L × 31.2% slab)")
    if allocation.get("NPS (Tier-1)", 0) > 0:
        tax_savings.append("NPS 80CCD(1B): Additional ₹15,600/yr tax saved on ₹50k contribution")
    if age < 60:
        tax_savings.append("ELSS Mutual Funds qualify under 80C (₹1.5L limit) — 3yr lock-in, market-linked")

    # --- Key rules applied ---
    rules = [
        f"50-30-20 Rule adapted: ~50% needs, ~30% wants, ~{savings_rate}% savings (your actual rate)",
        f"Rule of {100 - age}: {base_equity}% equity / {debt_pct}% debt based on age {age} + {risk_appetite} risk",
        "Emergency Fund First: 6 months of expenses before aggressive investing",
        "Thumb rule: Never invest money you'll need within 3 years in equity",
        "Gold 5–10%: Hedge against inflation and currency risk",
        "International diversification: Reduces INR concentration risk",
    ]
    if age < 35:
        rules.append("Young investor edge: Time in market beats timing the market — SIP discipline is key")
    if age > 50:
        rules.append("Near-retirement: Shift equity profits to debt 3–5 years before goal to lock gains")

    return {
        "profile": {
            "age": age,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "monthly_surplus": round(monthly_surplus, 0),
            "savings_rate_pct": savings_rate,
            "investable_monthly": round(investable, 0),
            "goal": goal,
            "goal_years": goal_years,
            "risk_appetite": risk_appetite,
            "years_to_retire": years_to_retire,
        },
        "emergency_fund": {
            "target": round(emergency_target, 0),
            "monthly_contribution": round(emergency_monthly, 0),
            "where": "Liquid Mutual Fund or High-yield Savings Account (e.g. IDFC First, AU Small Finance Bank ~7% SA rate)",
            "months_to_build": round(emergency_target / emergency_monthly, 0) if emergency_monthly else "N/A",
        },
        "allocation_pct": allocation,
        "monthly_amounts": monthly_amounts,
        "instruments": instruments,
        "corpus_projection": {
            "investable_monthly": round(investable, 0),
            "total_10yr": round(total_corpus_10yr, 0),
            "total_goal_yrs": round(total_corpus_goal, 0),
            "breakdown": corpus_breakdown,
        },
        "tax_savings": tax_savings,
        "key_rules": rules,
        "disclaimer": "Projections use historical average CAGR assumptions. Actual returns vary. Consult a SEBI-registered investment advisor before investing.",
    }


@app.route("/api/strategy", methods=["POST"])
def strategy():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400
    required = ["age", "monthly_income", "monthly_expenses", "goal", "goal_years"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    try:
        result = build_strategy(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path: str):
    full = os.path.join(STATIC_DIR, path)
    if path and os.path.exists(full):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
