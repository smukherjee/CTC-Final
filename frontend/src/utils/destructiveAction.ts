interface ConfirmDestructiveActionParams {
  action: string;
  subject?: string;
}

export function confirmDestructiveAction({
  action,
  subject,
}: ConfirmDestructiveActionParams): boolean {
  const target = subject ? ` "${subject}"` : '';
  return window.confirm(`${action}${target}?\n\nThis action cannot be undone.`);
}
