export function validateDisplayName(value: string) {
  const name = value.trim();
  if (name.length < 2) return "Use at least 2 characters for your name.";
  if (name.length > 80) return "Keep your name to 80 characters or fewer.";
  return null;
}

export function validatePasswordChange({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (!currentPassword) return "Enter your current password.";
  if (newPassword.length < 12) return "Use at least 12 characters for the new password.";
  if (newPassword.length > 128) return "Keep the new password to 128 characters or fewer.";
  if (newPassword !== confirmPassword) return "The new passwords do not match.";
  if (newPassword === currentPassword) return "Choose a new password that is different.";
  return null;
}
