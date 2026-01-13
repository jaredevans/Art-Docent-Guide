import { jsPDF } from 'jspdf'

const MARGIN = 20
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)

export async function generatePDF(images, artworkInfo, guide) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  let yPosition = MARGIN

  // Helper function to add a new page if needed
  const checkPageBreak = (neededHeight) => {
    if (yPosition + neededHeight > PAGE_HEIGHT - MARGIN) {
      pdf.addPage()
      yPosition = MARGIN
      return true
    }
    return false
  }

  // Helper function to add wrapped text
  const addWrappedText = (text, fontSize, isBold = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    const lines = pdf.splitTextToSize(text, CONTENT_WIDTH)
    const lineHeight = fontSize * 0.4

    for (const line of lines) {
      checkPageBreak(lineHeight + 2)
      pdf.text(line, MARGIN, yPosition)
      yPosition += lineHeight + 1
    }
    yPosition += 3
  }

  // Helper function to add a section header
  const addSectionHeader = (number, title) => {
    yPosition += 8 // Add whitespace above section
    checkPageBreak(15)
    pdf.setFillColor(245, 245, 244)
    pdf.circle(MARGIN + 4, yPosition - 2, 4, 'F')
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(68, 64, 60)
    pdf.text(String(number), MARGIN + 2.5, yPosition)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 37, 36)
    pdf.text(title, MARGIN + 12, yPosition)
    yPosition += 8
    pdf.setTextColor(87, 83, 78)
    pdf.setFont('helvetica', 'normal')
  }

  // Helper function to add bullet points
  const addBulletList = (items, fontSize = 11) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', 'normal')
    const lineHeight = fontSize * 0.4

    for (const item of items) {
      const lines = pdf.splitTextToSize(item, CONTENT_WIDTH - 8)
      checkPageBreak((lines.length * (lineHeight + 1)) + 4)

      pdf.setFillColor(168, 162, 158)
      pdf.circle(MARGIN + 2, yPosition - 1, 1, 'F')

      for (let i = 0; i < lines.length; i++) {
        pdf.text(lines[i], MARGIN + 6, yPosition)
        yPosition += lineHeight + 1
      }
      yPosition += 2
    }
    yPosition += 3
  }

  // Title
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(28, 25, 23)
  pdf.text('Docent Presentation Guide', MARGIN, yPosition)
  yPosition += 15

  // Add images - all in a single row across page width, max 500px (130mm) height
  if (images && images.length > 0) {
    try {
      const GAP = 4 // Gap between images in mm
      const MAX_HEIGHT = 130 // 500px ≈ 130mm
      const numImages = images.length
      const totalGapWidth = (numImages - 1) * GAP
      const availableWidth = CONTENT_WIDTH - totalGapWidth
      const widthPerImage = availableWidth / numImages

      // Get dimensions for all images and calculate heights
      const imageDimensions = await Promise.all(
        images.map(async (img) => {
          const dims = await getImageDimensions(img.preview)
          let width = widthPerImage
          let height = (dims.height / dims.width) * width

          // Cap height at MAX_HEIGHT and adjust width proportionally
          if (height > MAX_HEIGHT) {
            height = MAX_HEIGHT
            width = (dims.width / dims.height) * height
          }

          return { width, height, preview: img.preview }
        })
      )

      // Use the maximum height among all images for the row
      const rowHeight = Math.max(...imageDimensions.map(d => d.height))

      checkPageBreak(rowHeight + 15)

      // Primary image label
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFillColor(41, 37, 36)
      pdf.roundedRect(MARGIN, yPosition - 5, 25, 6, 1, 1, 'F')
      pdf.text('Primary', MARGIN + 3, yPosition - 1)
      yPosition += 3

      // Draw all images in a row
      let xPosition = MARGIN
      for (const imgData of imageDimensions) {
        pdf.addImage(imgData.preview, 'JPEG', xPosition, yPosition, imgData.width, imgData.height)
        xPosition += imgData.width + GAP
      }

      yPosition += rowHeight + 10
    } catch (e) {
      console.error('Error adding images to PDF:', e)
    }
  }

  // Guide sections
  if (guide) {
    // 1. Overview
    if (guide.overview) {
      addSectionHeader(1, 'Overview')
      addWrappedText(guide.overview, 11)
    }

    // 2. Visual Analysis
    if (guide.visualAnalysis) {
      addSectionHeader(2, 'Visual Analysis')
      addWrappedText(guide.visualAnalysis, 11)
    }

    // 3. Talking Points
    if (guide.talkingPoints && guide.talkingPoints.length > 0) {
      addSectionHeader(3, 'Talking Points')
      addBulletList(guide.talkingPoints)
    }

    // 4. Fun Facts
    if (guide.funFacts && guide.funFacts.length > 0) {
      addSectionHeader(4, 'Fun Facts')
      addBulletList(guide.funFacts)
    }

    // 5. Historical Context
    if (guide.historicalContext) {
      addSectionHeader(5, 'Historical Context')
      addWrappedText(guide.historicalContext, 11)
    }

    // 6. Discussion Questions
    if (guide.discussionQuestions && guide.discussionQuestions.length > 0) {
      addSectionHeader(6, 'Discussion Questions')
      guide.discussionQuestions.forEach((question, index) => {
        checkPageBreak(15)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(120, 113, 108)
        pdf.text(`Q${index + 1}.`, MARGIN, yPosition)
        pdf.setTextColor(87, 83, 78)
        const lines = pdf.splitTextToSize(question, CONTENT_WIDTH - 12)
        for (const line of lines) {
          pdf.text(line, MARGIN + 10, yPosition)
          yPosition += 5
        }
        yPosition += 3
      })
      yPosition += 3
    }

    // 7. Presentation Flow
    if (guide.presentationFlow) {
      addSectionHeader(7, 'Suggested Presentation Flow')

      // Split by newlines to get individual steps
      const steps = guide.presentationFlow.split('\n').filter(s => s.trim())

      // Parse all steps first
      const parsedSteps = steps.map(step => {
        const match = step.match(/^(?:-\s*)?(?:\*\*)?(.+?\([^)]+\))(?:\*\*)?:\s*(.*)$/)
        if (match) {
          return { title: match[1], description: match[2] }
        }
        return { title: '', description: step.replace(/^-\s*/, '') }
      })

      // Render each step (no background - cleaner look)
      for (let i = 0; i < parsedSteps.length; i++) {
        const { title, description } = parsedSteps[i]

        // Check if we need a new page for this step
        let stepHeight = 0
        if (title) stepHeight += 6
        if (description.trim()) {
          const lines = pdf.splitTextToSize(description.trim(), CONTENT_WIDTH - 10)
          stepHeight += lines.length * 5
        }
        checkPageBreak(stepHeight + 5)

        // Render title in bold if exists
        if (title) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(11)
          pdf.setTextColor(41, 37, 36)
          pdf.text(title, MARGIN, yPosition)
          yPosition += 6
        }

        // Render description
        if (description.trim()) {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.setTextColor(68, 64, 60)
          const lines = pdf.splitTextToSize(description.trim(), CONTENT_WIDTH - 10)
          for (const line of lines) {
            pdf.text(line, MARGIN, yPosition)
            yPosition += 5
          }
        }

        // Space between steps (not after the last one)
        if (i < parsedSteps.length - 1) {
          yPosition += 5
        }
      }
    }
  }

  // Artwork Information section (at the end)
  if (artworkInfo) {
    yPosition += 10
    pdf.setDrawColor(214, 211, 209)
    pdf.line(MARGIN, yPosition, PAGE_WIDTH - MARGIN, yPosition)
    yPosition += 10

    checkPageBreak(20)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 37, 36)
    pdf.text('Artwork Information', MARGIN, yPosition)
    yPosition += 8

    pdf.setTextColor(87, 83, 78)
    addWrappedText(artworkInfo, 11)
  }

  // Footer on last page
  pdf.setFontSize(9)
  pdf.setTextColor(168, 162, 158)
  pdf.text('Generated by Art Docent Guide', MARGIN, PAGE_HEIGHT - 10)

  // Save the PDF
  const fileName = artworkInfo
    ? `docent-guide-${Date.now()}.pdf`
    : `docent-guide-${Date.now()}.pdf`
  pdf.save(fileName)
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = dataUrl
  })
}
