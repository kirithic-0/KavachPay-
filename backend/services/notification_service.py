from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

NOTIF_STYLES = {
    'payout':   {'color': '#059669', 'bg': '#ECFDF5', 'border': '#A7F3D0'},
    'alert':    {'color': '#DC2626', 'bg': '#FEF2F2', 'border': '#FECACA'},
    'score':    {'color': '#7C3AED', 'bg': '#F5F3FF', 'border': '#DDD6FE'},
    'policy':   {'color': '#2563EB', 'bg': '#EFF6FF', 'border': '#BFDBFE'},
    'loan':     {'color': '#D97706', 'bg': '#FFFBEB', 'border': '#FDE68A'},
    'zone':     {'color': '#0891B2', 'bg': '#ECFEFF', 'border': '#A5F3FC'},
    'referral': {'color': '#16A34A', 'bg': '#F0FDF4', 'border': '#BBF7D0'},
    'success':  {'color': '#059669', 'bg': '#ECFDF5', 'border': '#A7F3D0'}, # Alias for payout-like success
    'warning':  {'color': '#D97706', 'bg': '#FFFBEB', 'border': '#FDE68A'}, # Alias for info-like warning
}

def create_notification(uid: str, notif_type: str, title: str, msg: str, detail: str = ''):
    """
    Standardize notification creation across all flows.
    """
    now = datetime.utcnow()
    style = NOTIF_STYLES.get(notif_type, NOTIF_STYLES['alert'])
    notif_id = f"notif_{int(now.timestamp() * 1000)}"

    db.collection('workers').document(uid)\
      .collection('notifications').document(notif_id).set({
        'id': notif_id,
        'type': notif_type,
        'title': title,
        'msg': msg,
        'detail': detail,
        'read': False,
        'time': now.strftime('Today, %I:%M %p'),
        'timestamp': firestore.SERVER_TIMESTAMP,
        'color': style['color'],
        'bg': style['bg'],
        'border': style['border'],
    })
    return notif_id
