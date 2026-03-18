from services.firebase_service import get_worker, get_zone_workers


def verify_worker_claim(worker_id, disruption_data):
    worker = get_worker(worker_id)

    if not worker:
        return {"approved": False, "layers_passed": 0, "reason": "Worker not found"}

    result = {"approved": False, "layers_passed": 0, "reason": ""}

    # Layer 1 - Work Intent
    if not worker.get("day_started", False):
        result["reason"] = "Did not declare work intent"
        return result
    result["layers_passed"] += 1

    # Layer 2 - Activity Check
    if worker.get("active_deliveries_during", 0) > 0:
        result["reason"] = "Active deliveries detected during disruption"
        return result
    result["layers_passed"] += 1

    # Layer 3 - Zone Correlation
    zone_workers = get_zone_workers(worker.get("zone", ""))
    if len(zone_workers) > 1:
        inactive_count = sum(1 for w in zone_workers if not w.get("active", False))
        if inactive_count / len(zone_workers) < 0.5:
            result["reason"] = "Zone not widely affected"
            return result
    result["layers_passed"] += 1

    # Layer 4 - Self Declaration
    if not worker.get("self_declared", False):
        result["reason"] = "Did not confirm disruption impact"
        return result
    result["layers_passed"] += 1

    # Layer 5 - KavachScore
    if worker.get("kavachScore", 750) < 300:
        result["reason"] = "KavachScore too low - manual review required"
        return result
    result["layers_passed"] += 1

    result["approved"] = True
    result["reason"] = "All 5 verification layers passed"
    return result