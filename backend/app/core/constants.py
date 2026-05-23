"""Centralized application constants exposed to frontend via config APIs."""

LR_STATUSES = [
    "DRAFT",
    "DISPATCHED",
    "DELIVERED",
    "POD_UPLOADED",
    "POD_VERIFIED",
    "BILLED",
]

HIREMEMO_RATE_TYPES = ["FIXED", "PER_TON"]

HIREMEMO_ACK_STATUSES = ["PENDING", "RECEIVED", "CLOSED"]

DEFAULTS = {
    "lr_status": "DRAFT",
    "hirememo_ack_status": "PENDING",
    "hirememo_rate_type": "FIXED",
}
