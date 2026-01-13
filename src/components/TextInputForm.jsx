function TextInputForm({ artworkInfo, setArtworkInfo }) {
  const handleChange = (e) => {
    setArtworkInfo(e.target.value)
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-museum-800 mb-4">
        Artwork Information
      </h2>
      <p className="text-museum-500 text-sm mb-6">
        Describe the artwork and include any details you'd like incorporated into the presentation guide.
      </p>

      <div>
        <textarea
          id="artworkInfo"
          value={artworkInfo}
          onChange={handleChange}
          placeholder="e.g., Starry Night by Vincent van Gogh, 1889, oil on canvas. Painted during his stay at the Saint-Paul-de-Mausole asylum. I'd like to emphasize the swirling sky technique and contrast with the peaceful village below..."
          rows={6}
          className="input-field resize-none"
        />
      </div>
    </div>
  )
}

export default TextInputForm
