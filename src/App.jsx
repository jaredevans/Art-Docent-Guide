import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import TextInputForm from './components/TextInputForm'
import SubmissionPreview from './components/SubmissionPreview'
import GeneratedGuide from './components/GeneratedGuide'
import LoadingSpinner from './components/LoadingSpinner'
import { generateGuide } from './services/geminiService'
import { generatePDF } from './services/pdfService'

function App() {
  const [images, setImages] = useState([])
  const [artworkInfo, setArtworkInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [guide, setGuide] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateGuide(images[0], artworkInfo)
      setGuide(result.guide)
      setIsSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to generate guide. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setImages([])
    setArtworkInfo('')
    setGuide(null)
    setError(null)
    setIsSubmitted(false)
  }

  const handleSavePDF = async () => {
    try {
      await generatePDF(images, artworkInfo, guide)
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-museum-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-museum-900">
            Art Docent Guide Generator
          </h1>
          <p className="mt-2 text-museum-500">
            Upload artwork and generate comprehensive presentation guides for your tours
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {isLoading ? (
          <LoadingSpinner />
        ) : isSubmitted && guide ? (
          <div className="space-y-8">
            <SubmissionPreview
              images={images}
              artworkInfo={artworkInfo}
            />
            <GeneratedGuide guide={guide} />
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSavePDF}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save as PDF
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Generate Another Guide
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <ImageUploader
              images={images}
              setImages={setImages}
            />

            <TextInputForm
              artworkInfo={artworkInfo}
              setArtworkInfo={setArtworkInfo}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="btn-primary text-lg px-10"
                disabled={images.length === 0}
              >
                Generate Guide
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-museum-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-museum-400 text-sm">
          Powered by Google Gemini AI
        </div>
      </footer>
    </div>
  )
}

export default App
