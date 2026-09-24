/*
 * The two contact rules the supplier form enforces, in one place.
 *
 * They are needed twice: once at the form, to tell somebody typing that the
 * address is wrong, and once at the storage guard, to reject a record that was
 * written by something other than this app. Two copies would eventually
 * disagree, and the pair that disagrees quietly is the worse one — the form
 * would refuse an address the store accepts, so a stored record could be
 * unopenable in the editor that is meant to fix it.
 */

/*
 * Deliberately loose. A local part, an at sign, a domain with a dot and a
 * two-letter tail is as much as an address can be checked for without sending
 * mail to it, and anything stricter starts rejecting real addresses.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobile and landline numbers alike are ten digits after the code. */
export const MIN_PHONE_DIGITS = 10;

export function isEmailShaped(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/*
 * Counts digits and ignores everything else, so "+91 98765 43210" passes on its
 * ten national digits. Spacing and country-code style are the user's business.
 */
export function isPhoneShaped(value: string): boolean {
  return value.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
}
