from fastapi import APIRouter
from ..core.constants import (
    DEFAULTS,
    HIREMEMO_ACK_STATUSES,
    HIREMEMO_RATE_TYPES,
    LR_STATUSES,
)

router = APIRouter(prefix="/config", tags=["config"])


@router.get("/form-options")
def get_form_options():
    return {
        "lr_statuses": LR_STATUSES,
        "hirememo_rate_types": HIREMEMO_RATE_TYPES,
        "hirememo_ack_statuses": HIREMEMO_ACK_STATUSES,
        "defaults": DEFAULTS,
    }
