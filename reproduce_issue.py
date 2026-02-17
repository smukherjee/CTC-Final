import requests
import json

url = "http://localhost:8000/api/lr/3"

# Mimic the payload sent by frontend
payload = {
    "id": 3,
    "lr_number": "LR-123456789",
    "date": "2026-02-17",
    "consignor_id": "C001",
    "consignee_id": "C002",
    "from": "SRICITY",           # Frontend uses 'from'
    "to": "CHENNAI",             # Frontend uses 'to'
    "origin": None,              # Likely what happens if not mapped
    "destination": None,
    "through_id": 12,
    "goods_items": [
        {
            "id": "1",
            "articles_count": 10,
            "description": "Test Item",
            "weight_qtl": 10,
            "weight_kg": 0,
            "rate_per_qtl": 100,
            "freight_rs": 1000,
            "freight_p": 0
        }
    ],
    "surcharge": 0,
    "hamali_charges": 0,
    "st_charges": 0,
    "weight": 1000,
    "freight_amount": 1000,
    "value_rs": 1000,
    "total": 1000,
    "articles_count": 10,
    "status": "DRAFT",
    # Extra fields usually ignored but let's see
    "vehicle_number": "MH01AB1234" 
}

try:
    print(f"Sending PUT to {url}...")
    headers = {'Content-Type': 'application/json'}
    response = requests.put(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
