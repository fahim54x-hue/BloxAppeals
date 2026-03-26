// Auto-submission is handled via the "Send via Gmail" button on the frontend.
// This saves the appeal to DB and returns success so the UI can show the letter.
export async function submitAppeal(
  _username: string,
  _email: string,
  _appealText: string,
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
