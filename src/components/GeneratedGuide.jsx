function GeneratedGuide({ guide }) {
  if (!guide) return null

  return (
    <div className="card">
      <h2 className="text-2xl font-serif font-semibold text-museum-800 mb-8">
        Docent Presentation Guide
      </h2>

      {/* Overview */}
      {guide.overview && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              1
            </span>
            Overview
          </h3>
          <p className="text-museum-600 leading-relaxed pl-11">
            {guide.overview}
          </p>
        </section>
      )}

      {/* Visual Analysis */}
      {guide.visualAnalysis && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              2
            </span>
            Visual Analysis
          </h3>
          <p className="text-museum-600 leading-relaxed pl-11">
            {guide.visualAnalysis}
          </p>
        </section>
      )}

      {/* Talking Points */}
      {guide.talkingPoints && guide.talkingPoints.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              3
            </span>
            Talking Points
          </h3>
          <ul className="pl-11 space-y-3">
            {guide.talkingPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-museum-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span className="text-museum-600">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Fun Facts */}
      {guide.funFacts && guide.funFacts.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              4
            </span>
            Fun Facts
          </h3>
          <ul className="pl-11 space-y-3">
            {guide.funFacts.map((fact, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-museum-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span className="text-museum-600">{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Historical Context */}
      {guide.historicalContext && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              5
            </span>
            Historical Context
          </h3>
          <p className="text-museum-600 leading-relaxed pl-11">
            {guide.historicalContext}
          </p>
        </section>
      )}

      {/* Discussion Questions */}
      {guide.discussionQuestions && guide.discussionQuestions.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              6
            </span>
            Discussion Questions
          </h3>
          <ul className="pl-11 space-y-3">
            {guide.discussionQuestions.map((question, index) => (
              <li key={index} className="flex items-start">
                <span className="text-museum-500 font-medium mr-2">Q{index + 1}.</span>
                <span className="text-museum-600">{question}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Presentation Flow */}
      {guide.presentationFlow && (
        <section className="mb-4">
          <h3 className="text-lg font-semibold text-museum-700 mb-3 flex items-center">
            <span className="w-8 h-8 bg-museum-100 rounded-full flex items-center justify-center mr-3 text-sm">
              7
            </span>
            Suggested Presentation Flow
          </h3>
          <div className="pl-11 bg-museum-50 rounded-lg p-4 space-y-4">
            {guide.presentationFlow.split('\n').filter(s => s.trim()).map((step, index) => {
              // Match "Title (time): description" pattern
              const match = step.match(/^(?:-\s*)?(?:\*\*)?(.+?\([^)]+\))(?:\*\*)?:\s*(.*)$/)
              if (match) {
                return (
                  <div key={index}>
                    <div className="font-semibold text-museum-700">{match[1]}</div>
                    <div className="text-museum-600 mt-1">{match[2]}</div>
                  </div>
                )
              }
              return (
                <div key={index} className="text-museum-600">{step}</div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default GeneratedGuide
