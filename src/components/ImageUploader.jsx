import { useRef } from 'react'

const MAX_IMAGES = 3
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function ImageUploader({ images, setImages }) {
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }
    return null
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const remainingSlots = MAX_IMAGES - images.length

    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s).`)
      return
    }

    const newImages = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        newImages.push({
          file,
          preview: e.target.result,
          name: file.name
        })

        if (newImages.length === fileArray.length) {
          setImages((prev) => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-museum-800 mb-4">
        Upload Artwork Images
      </h2>
      <p className="text-museum-500 text-sm mb-6">
        Upload up to 3 images. The first image will be used as the primary image for AI analysis.
      </p>

      {/* Drop Zone */}
      {images.length < MAX_IMAGES && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-museum-300 rounded-lg p-10 text-center
                     cursor-pointer hover:border-museum-400 hover:bg-museum-50 transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="hidden"
          />
          <svg
            className="mx-auto h-12 w-12 text-museum-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-museum-600">
            Drag and drop images here, or click to browse
          </p>
          <p className="mt-2 text-museum-400 text-sm">
            JPEG, PNG, or WebP (max 10MB each)
          </p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative rounded-lg overflow-hidden ${
                index === 0 ? 'ring-2 ring-museum-600 ring-offset-2' : ''
              }`}
            >
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-museum-800 text-white text-xs px-2 py-1 rounded">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full
                           hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUploader
