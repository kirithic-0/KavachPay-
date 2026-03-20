from datetime import datetime
import pandas as pd

SCORE_CHANGES = {
    'legitimate_claim':      10,
    'tenure_bonus':          15,
    'zero_fraud_30days':     8,
    'profile_complete':      12,
    'honest_opt_out':        20,
    'weekly_streak':         5,
    'active_during_claim':  -20,
    'multiple_fraud_flags': -50,
    'duplicate_claim':      -40,
    'weather_not_confirmed':-35,
    'suspicious_pattern':   -25,
    'policy_lapse':         -10,
    'missed_declaration':   -5,
}

def get_score_tier(score):
    if score >= 750:
        return {'tier':'green','payout_speed':'instant','premium_modifier':-0.08}
    elif score >= 500:
        return {'tier':'yellow','payout_speed':'3-5hr_delay','premium_modifier':-0.02}
    elif score >= 300:
        return {'tier':'red','payout_speed':'24hr_delay','premium_modifier':0.10}
    else:
        return {'tier':'black','payout_speed':'blocked','premium_modifier':0.10}

def update_kavach_score(current_score, event):
    change = SCORE_CHANGES.get(event, 0)
    new_score = max(300, min(900, current_score + change))
    return {'old_score':current_score,'event':event,'change':change,
            'new_score':new_score,'tier':get_score_tier(new_score)['tier']}

def calculate_premium(worker):
    base = 49
    rm   = 1.0
    tier = worker.get('city_tier', 1)
    if worker['risk'] == 'high': rm += 0.30
    elif worker['risk'] == 'medium': rm += 0.15
    pc = worker['past_claims']
    if pc > 5: rm += 0.25
    elif pc > 3: rm += 0.15
    elif pc > 1: rm += 0.05
    m = worker['months_active']
    if m < 3: rm += 0.10
    elif m < 6: rm += 0.05
    if tier == 2: rm -= 0.05
    if worker['age'] < 21: rm += 0.10
    elif worker['age'] > 40: rm += 0.05
    if pc > 0:
        h = worker['past_correct_claims'] / pc
        if h >= 0.90: rm -= 0.10
        elif h >= 0.75: rm -= 0.05
    sde = worker['social_disruption_exposure']
    if sde == 'high': rm += 0.10
    elif sde == 'medium': rm += 0.05
    risk = worker['risk']
    t = worker.get('city_tier', 1)
    if t == 1:
        ed = 20 if risk=='high' else (35 if risk=='medium' else 50)
    else:
        ed = 15 if risk=='high' else (25 if risk=='medium' else 38)
    if ed > 50: rm += 0.08
    elif ed > 35: rm += 0.05
    elif ed > 20: rm += 0.02
    ks = worker['kavachScore']
    if ks >= 750: rm -= 0.08
    elif ks >= 500: rm -= 0.02
    else: rm += 0.10
    rm = max(rm, 0.80)
    inc = worker.get('internal_income', 2500)
    if inc < 2000: cr = 0.75
    elif inc < 3500: cr = 0.65
    else: cr = 0.60
    premium  = round(base * rm)
    coverage = round(inc * cr)
    top_up = worker.get('premium_top_up_factor', 1.0)
    if top_up > 1.0:
        premium  = round(premium * top_up)
        coverage = round(coverage * top_up * 0.80)
    if worker.get('has_referral', False):
        premium = round(premium * 0.90)
    return {'risk':risk,'risk_multiplier':round(rm,2),
            'premium':premium,'coverage':coverage,'coverage_ratio':cr}

def detect_fraud(claim, all_claims_df):
    flags = []
    try:
        day  = datetime.strptime(str(claim['created_at']),'%Y-%m-%d').strftime('%A')[:3]
        days = [d.strip() for d in str(claim['typical_workdays']).split(',')]
        if day not in days: flags.append('work_intent_mismatch')
    except Exception: pass
    try:
        avg  = float(claim.get('avg_daily_distance', 0))
        dist = float(claim['distance'])
        if avg > 0 and (dist/avg) > 0.40: flags.append('distance_anomaly')
    except Exception: pass
    try:
        same = all_claims_df[(all_claims_df['zone']==claim['zone'])&
                             (all_claims_df['created_at']==claim['created_at'])]
        if len(same) < 3: flags.append('isolated_claim')
    except Exception: pass
    try:
        if not claim['self_declaration']: flags.append('missed_self_declaration')
    except Exception: pass
    try:
        if float(claim['kavachScore']) < 500: flags.append('low_kavach_score')
    except Exception: pass
    try:
        m = float(claim['months_active'])
        c = float(claim['past_claims'])
        if m > 0 and (c/m) > 0.5: flags.append('high_claim_frequency')
    except Exception: pass
    try:
        c = float(claim['past_claims'])
        r = float(claim['past_correct_claims'])
        if c > 0 and (r/c) < 0.50: flags.append('poor_honesty_ratio')
    except Exception: pass
    try:
        if claim['severity'] == 'Severe':
            sv = all_claims_df[(all_claims_df['zone']==claim['zone'])&
                              (all_claims_df['severity']=='Severe')]
            if len(sv) < 2: flags.append('severity_inflation')
    except Exception: pass
    try:
        if float(claim.get('submission_delay_hours',0)) > 24:
            flags.append('late_claim_submission')
    except Exception: pass
    try:
        if 'customer_id' in all_claims_df.columns:
            dup = all_claims_df[
                (all_claims_df['customer_id']==claim['customer_id'])&
                (all_claims_df['created_at']==claim['created_at'])&
                (all_claims_df['category']==claim['category'])]
            if len(dup) > 1: flags.append('duplicate_claim')
    except Exception: pass
    try:
        wt = ['RAI','FLD','STM','AQI','HTV','FOG','WND']
        if claim['category'] in wt and bool(claim.get('fraud_flag',False)) is True:
            flags.append('weather_not_confirmed')
    except Exception: pass
    try:
        cov = float(claim.get('coverage', 999999))
        pay = float(claim['payout_amount'])
        if pay > cov: flags.append('payout_mismatch')
    except Exception: pass
    try:
        if float(claim['months_active']) < 2 and claim['severity'] == 'Severe':
            flags.append('new_worker_high_claim')
    except Exception: pass
    fc = len(flags)
    ks = float(claim.get('kavachScore', 750))
    if ks < 300:
        return {'flags':flags,'flag_count':fc,'auto_approve':False,
                'decision':'rejected','reason':'KavachScore below 300.'}
    elif ks < 500:
        return {'flags':flags,'flag_count':fc,'auto_approve':False,
                'decision':'manual_review','reason':'KavachScore below 500.'}
    elif fc == 0:
        return {'flags':flags,'flag_count':0,'auto_approve':True,
                'decision':'clean','reason':'All layers passed.'}
    elif fc == 1:
        return {'flags':flags,'flag_count':1,'auto_approve':True,
                'decision':'clean','reason':f'1 minor flag ({flags[0]}).'}
    elif fc == 2:
        return {'flags':flags,'flag_count':fc,'auto_approve':False,
                'decision':'flagged','reason':f'2 flags: {flags}.'}
    else:
        return {'flags':flags,'flag_count':fc,'auto_approve':False,
                'decision':'flagged','reason':f'{fc} flags: {flags}.'}
