"""
services/verification.py — Updated for v6 schema
Uses customer_id (Firestore doc ID) instead of worker_id.
"""

from services.firebase_service import get_worker_by_customer_id, get_zone_workers


def verify_worker_claim(customer_id, disruption_data):
    worker = get_worker_by_customer_id(customer_id)

    if not worker:
        return {"approved": False, "layers_passed": 0, "reason": "Worker not found"}

    result = {"approved": False, "layers_passed": 0, "reason": ""}

    # Layer 1 — Work Intent
    # Without day_started toggle (removed from product), check policyStatus instead
    if worker.get("policyStatus") not in ("active",):
        result["reason"] = "Policy is not active"
        return result
    result["layers_passed"] += 1

    # Layer 2 — Activity Check (distance proxy)
    if worker.get("active_deliveries_during", 0) > 0:
        result["reason"] = "Active deliveries detected during disruption"
        return result
    result["layers_passed"] += 1

    # Layer 3 — Zone Correlation
    zone_workers    = get_zone_workers(worker.get("zone", ""))
    if len(zone_workers) > 1:
        inactive_count  = sum(1 for w in zone_workers if w.get("policyStatus") == "active")
        if inactive_count / len(zone_workers) < 0.3:
            result["reason"] = "Zone not widely affected — disruption not corroborated"
            return result
    result["layers_passed"] += 1

    # Layer 4 — Self Declaration (checked via self_declared field or defaulting to True for auto-flow)
    if not worker.get("self_declared", True):
        result["reason"] = "Did not confirm disruption impact"
        return result
    result["layers_passed"] += 1

    # Layer 5 — KavachScore gate
    if worker.get("kavachScore", 750) < 300:
        result["reason"] = "KavachScore too low — manual review required"
        return result
    result["layers_passed"] += 1

    result["approved"] = True
    result["reason"]   = "All 5 verification layers passed"
    return result
