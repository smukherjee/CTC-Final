import axios from 'axios';

export interface FormOptions {
  lr_statuses: string[];
  hirememo_rate_types: string[];
  hirememo_ack_statuses: string[];
  defaults: {
    lr_status?: string;
    hirememo_ack_status?: string;
    hirememo_rate_type?: string;
  };
}

export const EMPTY_FORM_OPTIONS: FormOptions = {
  lr_statuses: [],
  hirememo_rate_types: [],
  hirememo_ack_statuses: [],
  defaults: {},
};

export async function fetchFormOptions(): Promise<FormOptions> {
  const res = await axios.get('/api/config/form-options');
  return { ...EMPTY_FORM_OPTIONS, ...(res.data || {}) };
}
