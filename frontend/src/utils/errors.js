// Maps raw DRF/backend validation wording to plain language a non-developer would
// understand. Matched case-insensitively against the whole message so it still works
// whether the string carries a trailing period or not.
const FRIENDLY_REPLACEMENTS = [
  [/^this field is required\.?$/i, 'Please fill in this field'],
  [/^this field may not be null\.?$/i, 'Please fill in this field'],
  [/^this field may not be blank\.?$/i, 'Please fill in this field'],
  [/^a valid integer is required\.?$/i, 'Please enter a valid whole number'],
  [/^a valid number is required\.?$/i, 'Please enter a valid number'],
  [/^enter a valid email address\.?$/i, 'Please enter a valid email address'],
  [/^no active account found with the given credentials\.?$/i, 'Incorrect username or password']
]

function humanize(message) {
  const match = FRIENDLY_REPLACEMENTS.find(([pattern]) => pattern.test(message))
  return match ? match[1] : message
}

// DRF nests validation errors arbitrarily deep (e.g. a workout's exercises -> sets ->
// reps), so this walks strings/arrays/objects looking for the first leaf string rather
// than assuming a flat shape.
function findFirstMessage(value) {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstMessage(item)
      if (found) return found
    }
    return null
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const found = findFirstMessage(value[key])
      if (found) return found
    }
    return null
  }

  return null
}

// Pulls a single human-readable message out of a parsed error response instead of
// falling back to a raw JSON dump - data is null when the body wasn't JSON at all
// (e.g. a server crash page), and {} stringifies to a useless "{}".
export function extractErrorMessage(data, fallback) {
  if (!data) return fallback

  if (typeof data.detail === 'string') {
    return humanize(data.detail)
  }

  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return humanize(data.non_field_errors[0])
  }

  const found = findFirstMessage(data)
  return found ? humanize(found) : fallback
}
