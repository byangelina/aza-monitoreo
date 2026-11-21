// Validation is bounded before scanning. Avoid ambiguous quantified regexes on
// this unauthenticated endpoint; this preserves the existing simple email shape.
function isRecoveryEmail(value) {
  if (typeof value !== 'string' || value.length > 254 || /\s/u.test(value)) return false;
  const at = value.indexOf('@');
  if (at <= 0 || value.indexOf('@', at + 1) !== -1) return false;
  const dot = value.lastIndexOf('.');
  return dot > at + 1 && dot < value.length - 1;
}

module.exports = { isRecoveryEmail };
