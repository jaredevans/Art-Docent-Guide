function SubmissionPreview({ images, artworkInfo }) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-museum-800 mb-6">
        Submitted Artwork
      </h2>

      {/* Images Gallery */}
      <div className="flex flex-wrap gap-4 mb-8">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden ${
              index === 0 ? 'ring-2 ring-museum-600 ring-offset-2' : ''
            }`}
          >
            <img
              src={image.preview}
              alt={`Artwork ${index + 1}`}
              className="h-[500px] w-auto object-contain"
            />
            {index === 0 && (
              <span className="absolute top-3 left-3 bg-museum-800 text-white text-sm px-3 py-1 rounded-full">
                Primary Image
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Artwork Details */}
      {artworkInfo && (
        <div className="border-t border-museum-200 pt-6">
          <h3 className="text-lg font-semibold text-museum-800 mb-4">
            Artwork Information
          </h3>
          <p className="text-museum-600 whitespace-pre-wrap">{artworkInfo}</p>
        </div>
      )}
    </div>
  )
}

export default SubmissionPreview
