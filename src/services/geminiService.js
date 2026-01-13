export async function generateGuide(primaryImage, artworkText) {
  const response = await fetch(`${import.meta.env.BASE_URL}api/generate-guide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      primaryImage: primaryImage.preview,
      artworkText: artworkText || '',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to generate guide')
  }

  return response.json()
}
