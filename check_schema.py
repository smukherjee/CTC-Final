import sys
from sqlalchemy import create_engine, inspect
# Adjust the import path if needed or just use the db url directly if known
# Assuming standard localized request context or I can just try to import 'app.db'
import os

# Add parent dir to path to find app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.db import engine
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('hirememos')]
    print("Columns in hirememos:", columns)
    
    missing = ['hire_memo_no', 'vehicle_number', 'freight_rate', 'commission']
    not_found = [m for m in missing if m not in columns]
    
    if not_found:
        print("MISSING COLUMNS:", not_found)
    else:
        print("ALL COLUMNS PRESENT")
        
    # Check LRs too
    lr_cols = [c['name'] for c in inspector.get_columns('lrs')]
    print("Columns in lrs:", lr_cols)
    if 'vehicle_id' not in lr_cols:
        print("MISSING vehicle_id in LRs")

except Exception as e:
    print("Error:", e)
