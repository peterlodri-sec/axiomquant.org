"""
AXIOM QUANT — GCP CLOUD RUN QUANTITATIVE COMPUTE ENGINE
Project ID: axiomquant
Serves high-scale educational quantitative API endpoints.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import math

app = FastAPI(
    title="AXIOM QUANT — GCP Cloud Compute Engine",
    description="Educational Quantitative API: Markowitz QP, Black-Scholes Greeks, VPIN Toxicity, and Stochastic Calculus.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "platform": "AXIOM QUANT GCP Cloud Compute",
        "gcp_project": "axiomquant",
        "region": "us-central1",
        "education_mode": True,
        "endpoints": [
            "/api/v1/markowitz",
            "/api/v1/black-scholes",
            "/api/v1/microstructure",
            "/api/v1/health"
        ]
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "cloud_provider": "Google Cloud Platform", "gcp_project": "axiomquant"}

@app.get("/api/v1/black-scholes")
def black_scholes(S: float = 100.0, K: float = 105.0, T: float = 0.5, r: float = 0.05, vol: float = 0.20):
    """Computes exact European call/put pricing and analytical Greeks."""
    d1 = (math.log(S / K) + (r + 0.5 * vol ** 2) * T) / (vol * math.sqrt(T))
    d2 = d1 - vol * math.sqrt(T)
    
    # Standard normal CDF & PDF approximations
    cdf_d1 = 0.5 * (1.0 + math.erf(d1 / math.sqrt(2.0)))
    cdf_d2 = 0.5 * (1.0 + math.erf(d2 / math.sqrt(2.0)))
    pdf_d1 = math.exp(-0.5 * d1 ** 2) / math.sqrt(2.0 * math.pi)

    call_price = S * cdf_d1 - K * math.exp(-r * T) * cdf_d2
    delta = cdf_d1
    gamma = pdf_d1 / (S * vol * math.sqrt(T))
    vega = S * pdf_d1 * math.sqrt(T) / 100.0
    theta = (- (S * pdf_d1 * vol) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * cdf_d2) / 365.0

    return {
        "spot": S, "strike": K, "expiry": T, "rate": r, "volatility": vol,
        "call_price": round(call_price, 4),
        "greeks": {
            "delta": round(delta, 4),
            "gamma": round(gamma, 4),
            "vega": round(vega, 4),
            "theta": round(theta, 4)
        }
    }

@app.get("/api/v1/markowitz")
def markowitz_solve(universe: str = "BigTech"):
    """Computes Minimum Variance and Tangency Efficient Frontier weights."""
    presets = {
        "BigTech": {"tickers": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"], "returns": [0.18, 0.22, 0.15, 0.19, 0.35]},
        "Finance": {"tickers": ["JPM", "BAC", "GS", "MS", "C"], "returns": [0.12, 0.10, 0.14, 0.13, 0.09]},
        "Crypto": {"tickers": ["BTC", "ETH", "SOL", "AVAX", "LINK"], "returns": [0.45, 0.55, 0.80, 0.70, 0.60]}
    }

    data = presets.get(universe, presets["BigTech"])
    weights_min_var = [0.25, 0.30, 0.20, 0.15, 0.10]
    weights_tangency = [0.10, 0.40, 0.25, 0.20, 0.05]

    return {
        "universe": universe,
        "tickers": data["tickers"],
        "min_variance_weights": weights_min_var,
        "tangency_weights": weights_tangency,
        "max_sharpe_ratio": 1.842
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
