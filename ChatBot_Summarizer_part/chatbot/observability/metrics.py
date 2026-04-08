"""
metrics.py
----------
Lightweight in-memory metrics collector
for Patient Query Tool prototype.
"""

import time
from typing import Dict


class MetricsCollector:
    def __init__(self):
        self.reset()

    def reset(self):
        self.metrics = {
            "total_requests": 0,
            "deterministic_success": 0,
            "deterministic_failure": 0,
            "fallback_triggered": 0,
            "fallback_validated": 0,
            "validation_failure": 0,
            "total_latency_ms": 0.0
        }

    def start_timer(self):
        return time.perf_counter()

    def stop_timer(self, start_time):
        elapsed = (time.perf_counter() - start_time) * 1000
        self.metrics["total_latency_ms"] += elapsed
        return elapsed

    def increment(self, key: str):
        if key in self.metrics:
            self.metrics[key] += 1

    def summary(self) -> Dict:
        avg_latency = 0.0
        if self.metrics["total_requests"] > 0:
            avg_latency = (
                self.metrics["total_latency_ms"]
                / self.metrics["total_requests"]
            )

        return {
            **self.metrics,
            "average_latency_ms": round(avg_latency, 2)
        }
