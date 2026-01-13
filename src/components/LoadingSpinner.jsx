function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-museum-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-museum-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-museum-600 text-lg font-medium">
        Generating your presentation guide...
      </p>
      <p className="mt-2 text-museum-400 text-sm">
        This may take a moment while we analyze the artwork
      </p>
    </div>
  )
}

export default LoadingSpinner
