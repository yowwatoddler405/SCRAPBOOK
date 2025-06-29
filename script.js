// Scrapbook App - Vanilla JavaScript
class ScrapbookApp {
  constructor() {
    this.currentPageIndex = 0
    this.pages = [
      {
        id: 1,
        photos: [],
        texts: [],
        stickers: [],
        theme: "vintage",
      },
      {
        id: 2,
        photos: [],
        texts: [],
        stickers: [],
        theme: "modern",
      },
    ]

    this.draggedElement = null
    this.dragOffset = { x: 0, y: 0 }
    this.isFlipping = false
    this.editingPhotoId = null

    // Responsive properties
    this.isMobile = window.innerWidth <= 768
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024
    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0

    this.init()
  }

  init() {
    this.setupResponsive()
    this.bindEvents()
    this.renderCurrentPage()
    this.updatePageIndicators()
    this.updateNavigationButtons()
    this.addSampleContent()
  }

  setupResponsive() {
    // Update responsive properties on resize
    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 768
      this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024
      this.updateResponsiveElements()
    })

    // Handle orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.updateResponsiveElements()
      }, 100)
    })

    // Initial responsive setup
    this.updateResponsiveElements()
  }

  updateResponsiveElements() {
    const pageElement = document.getElementById("currentPage")

    // Adjust page size based on screen size
    if (this.isMobile) {
      pageElement.style.width = window.innerWidth < 480 ? "280px" : "400px"
      pageElement.style.height = window.innerWidth < 480 ? "200px" : "280px"
    } else if (this.isTablet) {
      pageElement.style.width = "500px"
      pageElement.style.height = "350px"
    } else {
      pageElement.style.width = "600px"
      pageElement.style.height = "400px"
    }

    // Update existing elements positions if needed
    this.constrainElementsToPage()
  }

  constrainElementsToPage() {
    const pageElement = document.getElementById("currentPage")
    const pageRect = pageElement.getBoundingClientRect()

    // Constrain all elements to new page bounds
    const elements = pageElement.querySelectorAll("[data-type]")
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const maxX = pageRect.width - rect.width
      const maxY = pageRect.height - rect.height

      const currentX = Number.parseInt(element.style.left) || 0
      const currentY = Number.parseInt(element.style.top) || 0

      const constrainedX = Math.max(0, Math.min(currentX, maxX))
      const constrainedY = Math.max(0, Math.min(currentY, maxY))

      if (currentX !== constrainedX || currentY !== constrainedY) {
        element.style.left = `${constrainedX}px`
        element.style.top = `${constrainedY}px`

        // Update data
        this.updateElementPosition(element.dataset.id, element.dataset.type, constrainedX, constrainedY)
      }
    })
  }

  bindEvents() {
    // Tool buttons
    document.getElementById("addPhotoBtn").addEventListener("click", () => this.openFileDialog())
    document.getElementById("addTextBtn").addEventListener("click", () => this.addText())
    document.getElementById("textInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addText()
    })

    // Sticker buttons
    document.querySelectorAll(".sticker-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const emoji = e.target.dataset.emoji
        this.addSticker(emoji)
      })
    })

    // Navigation
    document.getElementById("prevBtn").addEventListener("click", () => this.previousPage())
    document.getElementById("nextBtn").addEventListener("click", () => this.nextPage())

    // Page indicators
    document.getElementById("pageIndicators").addEventListener("click", (e) => {
      if (e.target.classList.contains("indicator")) {
        const pageIndex = Number.parseInt(e.target.dataset.page)
        this.goToPage(pageIndex)
      }
    })

    // Action buttons
    document.getElementById("addPageBtn").addEventListener("click", () => this.addPage())
    document.getElementById("exportBtn").addEventListener("click", () => this.openPdfExportModal())
    document.getElementById("templateBtn").addEventListener("click", () => this.openTemplateModal())

    // File input
    document.getElementById("fileInput").addEventListener("change", (e) => this.handleFileUpload(e))

    // Touch and mouse events
    if (this.isTouch) {
      this.bindTouchEvents()
    } else {
      this.bindMouseEvents()
    }

    // Template modal
    document.getElementById("closeTemplateModal").addEventListener("click", () => this.closeTemplateModal())
    document.querySelector(".template-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".template-card")
      if (card) {
        const theme = card.dataset.theme
        this.applyTemplate(theme)
      }
    })

    // Photo editor
    this.bindPhotoEditorEvents()

    // Modal close on outside click
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeAllModals()
      }
    })

    // Keyboard navigation
    this.bindKeyboardEvents()
  }

  bindTouchEvents() {
    let touchStarted = false

    document.addEventListener(
      "touchstart",
      (e) => {
        const element = e.target.closest("[data-type]")
        if (!element) return

        touchStarted = true
        const touch = e.touches[0]
        const rect = element.getBoundingClientRect()

        this.draggedElement = element
        this.dragOffset = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        }

        element.classList.add("dragging")

        // Prevent scrolling while dragging
        e.preventDefault()
      },
      { passive: false },
    )

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!this.draggedElement || !touchStarted) return

        e.preventDefault()

        const touch = e.touches[0]
        const pageRect = document.getElementById("currentPage").getBoundingClientRect()
        const newX = touch.clientX - pageRect.left - this.dragOffset.x
        const newY = touch.clientY - pageRect.top - this.dragOffset.y

        // Get current page dimensions
        const pageWidth = pageRect.width
        const pageHeight = pageRect.height
        const elementRect = this.draggedElement.getBoundingClientRect()

        const maxX = pageWidth - elementRect.width
        const maxY = pageHeight - elementRect.height

        const constrainedX = Math.max(0, Math.min(newX, maxX))
        const constrainedY = Math.max(0, Math.min(newY, maxY))

        this.draggedElement.style.left = `${constrainedX}px`
        this.draggedElement.style.top = `${constrainedY}px`

        this.updateElementPosition(
          this.draggedElement.dataset.id,
          this.draggedElement.dataset.type,
          constrainedX,
          constrainedY,
        )
      },
      { passive: false },
    )

    document.addEventListener("touchend", (e) => {
      if (this.draggedElement && touchStarted) {
        this.draggedElement.classList.remove("dragging")
        this.draggedElement = null
        touchStarted = false
      }
    })
  }

  bindMouseEvents() {
    document.addEventListener("mousedown", (e) => this.handleMouseDown(e))
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    document.addEventListener("mouseup", (e) => this.handleMouseUp(e))
  }

  bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      // Only handle if not typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          this.previousPage()
          break
        case "ArrowRight":
          e.preventDefault()
          this.nextPage()
          break
        case "Escape":
          e.preventDefault()
          this.closeAllModals()
          break
        case "Enter":
          if (e.target.classList.contains("indicator")) {
            e.preventDefault()
            e.target.click()
          }
          break
      }
    })
  }

  openFileDialog() {
    document.getElementById("fileInput").click()
  }

  handleFileUpload(event) {
    const file = event.target.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.addPhoto(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Update photo creation for responsive sizing
  addPhoto(src) {
    // Adjust photo size based on screen size
    let photoWidth = 200
    let photoHeight = 150

    if (this.isMobile) {
      photoWidth = window.innerWidth < 480 ? 120 : 160
      photoHeight = window.innerWidth < 480 ? 90 : 120
    } else if (this.isTablet) {
      photoWidth = 180
      photoHeight = 135
    }

    const photo = {
      id: Date.now().toString(),
      src: src,
      x: Math.random() * (this.getPageWidth() - photoWidth - 20) + 10,
      y: Math.random() * (this.getPageHeight() - photoHeight - 20) + 10,
      width: photoWidth,
      height: photoHeight,
      rotation: (Math.random() - 0.5) * 10,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filter: "none",
    }

    this.pages[this.currentPageIndex].photos.push(photo)
    this.renderCurrentPage()
  }

  // Update text creation for responsive sizing
  addText() {
    const textInput = document.getElementById("textInput")
    const text = textInput.value.trim()

    if (text) {
      // Adjust font size based on screen size
      let fontSize = 18
      if (this.isMobile) {
        fontSize = window.innerWidth < 480 ? 14 : 16
      }

      const textElement = {
        id: Date.now().toString(),
        content: text,
        x: Math.random() * (this.getPageWidth() - 200) + 10,
        y: Math.random() * (this.getPageHeight() - 50) + 10,
        fontSize: fontSize,
        color: "#374151",
        fontFamily: "Dancing Script",
      }

      this.pages[this.currentPageIndex].texts.push(textElement)
      textInput.value = ""
      this.renderCurrentPage()
    }
  }

  // Update sticker creation for responsive sizing
  addSticker(emoji) {
    // Adjust sticker size based on screen size
    let stickerSize = 30
    if (this.isMobile) {
      stickerSize = window.innerWidth < 480 ? 20 : 25
    }

    const sticker = {
      id: Date.now().toString(),
      emoji: emoji,
      x: Math.random() * (this.getPageWidth() - 50) + 10,
      y: Math.random() * (this.getPageHeight() - 50) + 10,
      size: stickerSize,
    }

    this.pages[this.currentPageIndex].stickers.push(sticker)
    this.renderCurrentPage()
  }

  renderCurrentPage() {
    const page = this.pages[this.currentPageIndex]
    const pageElement = document.getElementById("currentPage")

    // Clear existing content except page number and corner
    const pageNumber = pageElement.querySelector(".page-number")
    const corner = pageElement.querySelector(".decorative-corner")
    pageElement.innerHTML = ""
    pageElement.appendChild(pageNumber)
    pageElement.appendChild(corner)

    // Update page number
    pageNumber.textContent = `Halaman ${this.currentPageIndex + 1}`

    // Apply theme
    pageElement.className = `scrapbook-page theme-${page.theme}`

    // Render photos
    page.photos.forEach((photo) => {
      const photoElement = this.createPhotoElement(photo)
      pageElement.appendChild(photoElement)
    })

    // Render texts
    page.texts.forEach((text) => {
      const textElement = this.createTextElement(text)
      pageElement.appendChild(textElement)
    })

    // Render stickers
    page.stickers.forEach((sticker) => {
      const stickerElement = this.createStickerElement(sticker)
      pageElement.appendChild(stickerElement)
    })
  }

  createPhotoElement(photo) {
    const photoDiv = document.createElement("div")
    photoDiv.className = "scrapbook-photo"
    photoDiv.dataset.id = photo.id
    photoDiv.dataset.type = "photo"
    photoDiv.style.left = `${photo.x}px`
    photoDiv.style.top = `${photo.y}px`
    photoDiv.style.width = `${photo.width}px`
    photoDiv.style.height = `${photo.height}px`
    photoDiv.style.transform = `rotate(${photo.rotation}deg)`

    const img = document.createElement("img")
    img.src = photo.src
    img.alt = "Scrapbook photo"
    img.style.filter = this.getPhotoFilter(photo)

    // Add photo corners
    const corners = ["top-left", "top-right", "bottom-left", "bottom-right"]
    corners.forEach((corner) => {
      const cornerDiv = document.createElement("div")
      cornerDiv.className = `photo-corner ${corner}`
      photoDiv.appendChild(cornerDiv)
    })

    photoDiv.appendChild(img)

    // Double click to edit
    photoDiv.addEventListener("dblclick", () => {
      this.openPhotoEditor(photo.id)
    })

    return photoDiv
  }

  createTextElement(text) {
    const textDiv = document.createElement("div")
    textDiv.className = "scrapbook-text"
    textDiv.dataset.id = text.id
    textDiv.dataset.type = "text"
    textDiv.style.left = `${text.x}px`
    textDiv.style.top = `${text.y}px`
    textDiv.style.fontSize = `${text.fontSize}px`
    textDiv.style.color = text.color
    textDiv.style.fontFamily = text.fontFamily
    textDiv.textContent = text.content

    return textDiv
  }

  createStickerElement(sticker) {
    const stickerDiv = document.createElement("div")
    stickerDiv.className = "scrapbook-sticker"
    stickerDiv.dataset.id = sticker.id
    stickerDiv.dataset.type = "sticker"
    stickerDiv.style.left = `${sticker.x}px`
    stickerDiv.style.top = `${sticker.y}px`
    stickerDiv.style.fontSize = `${sticker.size}px`
    stickerDiv.textContent = sticker.emoji

    return stickerDiv
  }

  getPhotoFilter(photo) {
    let filter = `brightness(${photo.brightness}%) contrast(${photo.contrast}%) saturate(${photo.saturation}%)`

    switch (photo.filter) {
      case "vintage":
        filter += " sepia(0.5) contrast(1.2) brightness(1.1)"
        break
      case "bw":
        filter += " grayscale(1) contrast(1.1)"
        break
      case "warm":
        filter += " sepia(0.3) saturate(1.4) brightness(1.1)"
        break
      case "cool":
        filter += " hue-rotate(180deg) saturate(1.2)"
        break
    }

    return filter
  }

  handleMouseDown(event) {
    const element = event.target.closest("[data-type]")
    if (!element) return

    event.preventDefault()

    const rect = element.getBoundingClientRect()
    const pageRect = document.getElementById("currentPage").getBoundingClientRect()

    this.draggedElement = element
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    element.classList.add("dragging")
    document.body.style.cursor = "grabbing"
  }

  // Helper methods for responsive dimensions
  getPageWidth() {
    const pageElement = document.getElementById("currentPage")
    return pageElement.offsetWidth || 600
  }

  getPageHeight() {
    const pageElement = document.getElementById("currentPage")
    return pageElement.offsetHeight || 400
  }

  // Update mouse handling for better responsive support
  handleMouseMove(event) {
    if (!this.draggedElement) return

    event.preventDefault()

    const pageRect = document.getElementById("currentPage").getBoundingClientRect()
    const newX = event.clientX - pageRect.left - this.dragOffset.x
    const newY = event.clientY - pageRect.top - this.dragOffset.y

    // Use actual page dimensions
    const pageWidth = pageRect.width
    const pageHeight = pageRect.height
    const elementRect = this.draggedElement.getBoundingClientRect()

    const maxX = pageWidth - elementRect.width
    const maxY = pageHeight - elementRect.height

    const constrainedX = Math.max(0, Math.min(newX, maxX))
    const constrainedY = Math.max(0, Math.min(newY, maxY))

    this.draggedElement.style.left = `${constrainedX}px`
    this.draggedElement.style.top = `${constrainedY}px`

    this.updateElementPosition(
      this.draggedElement.dataset.id,
      this.draggedElement.dataset.type,
      constrainedX,
      constrainedY,
    )
  }

  handleMouseUp(event) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove("dragging")
      this.draggedElement = null
      document.body.style.cursor = "default"
    }
  }

  updateElementPosition(id, type, x, y) {
    const page = this.pages[this.currentPageIndex]
    let collection

    switch (type) {
      case "photo":
        collection = page.photos
        break
      case "text":
        collection = page.texts
        break
      case "sticker":
        collection = page.stickers
        break
    }

    const element = collection.find((item) => item.id === id)
    if (element) {
      element.x = x
      element.y = y
    }
  }

  previousPage() {
    if (this.currentPageIndex > 0 && !this.isFlipping) {
      this.flipPage(this.currentPageIndex - 1)
    }
  }

  nextPage() {
    if (this.currentPageIndex < this.pages.length - 1 && !this.isFlipping) {
      this.flipPage(this.currentPageIndex + 1)
    }
  }

  goToPage(pageIndex) {
    if (pageIndex !== this.currentPageIndex && !this.isFlipping) {
      this.flipPage(pageIndex)
    }
  }

  flipPage(newPageIndex) {
    this.isFlipping = true
    const pageElement = document.getElementById("currentPage")

    pageElement.classList.add("flipping")

    setTimeout(() => {
      this.currentPageIndex = newPageIndex
      this.renderCurrentPage()
      this.updatePageIndicators()
      this.updateNavigationButtons()

      pageElement.classList.remove("flipping")
      this.isFlipping = false
    }, 300)
  }

  updatePageIndicators() {
    const indicators = document.querySelectorAll(".indicator")
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === this.currentPageIndex)
    })
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    prevBtn.disabled = this.currentPageIndex === 0
    nextBtn.disabled = this.currentPageIndex === this.pages.length - 1
  }

  addPage() {
    const newPage = {
      id: this.pages.length + 1,
      photos: [],
      texts: [],
      stickers: [],
      theme: "vintage",
    }

    this.pages.push(newPage)
    this.addPageIndicator()
    this.updateNavigationButtons()

    // Go to new page
    this.goToPage(this.pages.length - 1)
  }

  addPageIndicator() {
    const indicatorsContainer = document.getElementById("pageIndicators")
    const indicator = document.createElement("button")
    indicator.className = "indicator"
    indicator.dataset.page = this.pages.length - 1
    indicatorsContainer.appendChild(indicator)
  }

  openTemplateModal() {
    document.getElementById("templateModal").classList.add("active")
  }

  closeTemplateModal() {
    document.getElementById("templateModal").classList.remove("active")
  }

  applyTemplate(theme) {
    this.pages[this.currentPageIndex].theme = theme

    // Add theme-specific content
    const themeContent = this.getThemeContent(theme)

    // Add sample text
    if (themeContent.text) {
      const textElement = {
        id: Date.now().toString(),
        content: themeContent.text,
        x: 100,
        y: 50,
        fontSize: 24,
        color: themeContent.textColor,
        fontFamily: themeContent.fontFamily,
      }
      this.pages[this.currentPageIndex].texts.push(textElement)
    }

    // Add theme stickers
    themeContent.stickers.forEach((emoji, index) => {
      const sticker = {
        id: `${Date.now()}-${index}`,
        emoji: emoji,
        x: 100 + index * 80,
        y: 150 + index * 30,
        size: 30,
      }
      this.pages[this.currentPageIndex].stickers.push(sticker)
    })

    this.renderCurrentPage()
    this.closeTemplateModal()
  }

  getThemeContent(theme) {
    const themes = {
      vintage: {
        text: "Kenangan Indah",
        textColor: "#8B4513",
        fontFamily: "Playfair Display",
        stickers: ["🌸", "🍂", "📜"],
      },
      modern: {
        text: "Modern Life",
        textColor: "#374151",
        fontFamily: "Inter",
        stickers: ["⭐", "💫", "🔸"],
      },
      cute: {
        text: "Sweet Memories",
        textColor: "#EC4899",
        fontFamily: "Dancing Script",
        stickers: ["🌸", "🦋", "💕"],
      },
      nature: {
        text: "Natural Beauty",
        textColor: "#059669",
        fontFamily: "Playfair Display",
        stickers: ["🌿", "🌱", "🍃"],
      },
    }

    return themes[theme] || themes.vintage
  }

  openPhotoEditor(photoId) {
    this.editingPhotoId = photoId
    const photo = this.pages[this.currentPageIndex].photos.find((p) => p.id === photoId)

    if (photo) {
      // Set preview image
      document.getElementById("editingPhoto").src = photo.src

      // Set current values
      document.getElementById("brightnessSlider").value = photo.brightness
      document.getElementById("contrastSlider").value = photo.contrast
      document.getElementById("saturationSlider").value = photo.saturation

      document.getElementById("brightnessValue").textContent = `${photo.brightness}%`
      document.getElementById("contrastValue").textContent = `${photo.contrast}%`
      document.getElementById("saturationValue").textContent = `${photo.saturation}%`

      // Set active filter
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filter === photo.filter)
      })

      document.getElementById("photoEditorModal").classList.add("active")
      this.updatePhotoPreview()
    }
  }

  closePhotoEditor() {
    document.getElementById("photoEditorModal").classList.remove("active")
    this.editingPhotoId = null
  }

  updatePhotoPreview() {
    const img = document.getElementById("editingPhoto")
    const brightness = document.getElementById("brightnessSlider").value
    const contrast = document.getElementById("contrastSlider").value
    const saturation = document.getElementById("saturationSlider").value
    const activeFilter = document.querySelector(".filter-btn.active")

    let filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    if (activeFilter) {
      const filterType = activeFilter.dataset.filter
      switch (filterType) {
        case "vintage":
          filter += " sepia(0.5) contrast(1.2) brightness(1.1)"
          break
        case "bw":
          filter += " grayscale(1) contrast(1.1)"
          break
        case "warm":
          filter += " sepia(0.3) saturate(1.4) brightness(1.1)"
          break
        case "cool":
          filter += " hue-rotate(180deg) saturate(1.2)"
          break
      }
    }

    img.style.filter = filter
  }

  resetPhotoEditor() {
    document.getElementById("brightnessSlider").value = 100
    document.getElementById("contrastSlider").value = 100
    document.getElementById("saturationSlider").value = 100

    document.getElementById("brightnessValue").textContent = "100%"
    document.getElementById("contrastValue").textContent = "100%"
    document.getElementById("saturationValue").textContent = "100%"

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === "none")
    })

    this.updatePhotoPreview()
  }

  savePhotoEdits() {
    if (this.editingPhotoId) {
      const photo = this.pages[this.currentPageIndex].photos.find((p) => p.id === this.editingPhotoId)

      if (photo) {
        photo.brightness = Number.parseInt(document.getElementById("brightnessSlider").value)
        photo.contrast = Number.parseInt(document.getElementById("contrastSlider").value)
        photo.saturation = Number.parseInt(document.getElementById("saturationSlider").value)

        const activeFilter = document.querySelector(".filter-btn.active")
        photo.filter = activeFilter ? activeFilter.dataset.filter : "none"

        this.renderCurrentPage()
        this.closePhotoEditor()
      }
    }
  }

  openPdfExportModal() {
    document.getElementById("pdfExportModal").classList.add("active")

    // Set max page numbers
    const totalPages = this.pages.length
    document.getElementById("toPage").max = totalPages
    document.getElementById("toPage").value = totalPages

    // Bind PDF export events
    this.bindPdfExportEvents()
  }

  closePdfExportModal() {
    document.getElementById("pdfExportModal").classList.remove("active")
  }

  bindPdfExportEvents() {
    // Close modal
    document.getElementById("closePdfExport").addEventListener("click", () => this.closePdfExportModal())
    document.getElementById("cancelPdfExport").addEventListener("click", () => this.closePdfExportModal())

    // Export type change
    document.querySelectorAll('input[name="exportType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const rangeOptions = document.getElementById("rangeOptions")
        rangeOptions.style.display = e.target.value === "range" ? "block" : "none"
      })
    })

    // Start export
    document.getElementById("startPdfExport").addEventListener("click", () => this.startPdfExport())
  }

  async startPdfExport() {
    const exportType = document.querySelector('input[name="exportType"]:checked').value
    const orientation = document.getElementById("pdfOrientation").value
    const size = document.getElementById("pdfSize").value
    const quality = document.getElementById("pdfQuality").value

    let pagesToExport = []

    // Determine which pages to export
    switch (exportType) {
      case "all":
        pagesToExport = this.pages.map((_, index) => index)
        break
      case "current":
        pagesToExport = [this.currentPageIndex]
        break
      case "range":
        const fromPage = Number.parseInt(document.getElementById("fromPage").value) - 1
        const toPage = Number.parseInt(document.getElementById("toPage").value) - 1
        for (let i = fromPage; i <= toPage; i++) {
          if (i >= 0 && i < this.pages.length) {
            pagesToExport.push(i)
          }
        }
        break
    }

    if (pagesToExport.length === 0) {
      this.showNotification("❌ Tidak ada halaman untuk diekspor!")
      return
    }

    // Show progress
    document.getElementById("exportProgress").style.display = "block"
    document.getElementById("startPdfExport").disabled = true

    try {
      await this.generatePDF(pagesToExport, { orientation, size, quality })
      this.showNotification("✅ PDF berhasil dibuat!")
      this.closePdfExportModal()
    } catch (error) {
      console.error("PDF Export Error:", error)
      this.showNotification("❌ Gagal membuat PDF!")
    } finally {
      document.getElementById("exportProgress").style.display = "none"
      document.getElementById("startPdfExport").disabled = false
    }
  }

  async generatePDF(pageIndices, options) {
    const { jsPDF } = window.jspdf
    const html2canvas = window.html2canvas

    // PDF settings
    const pdfSettings = {
      orientation: options.orientation,
      unit: "mm",
      format: options.size,
    }

    const pdf = new jsPDF(pdfSettings)
    const originalPageIndex = this.currentPageIndex

    // Quality settings
    const qualitySettings = {
      high: { scale: 2, quality: 0.95 },
      medium: { scale: 1.5, quality: 0.85 },
      low: { scale: 1, quality: 0.75 },
    }

    const { scale, quality } = qualitySettings[options.quality]

    for (let i = 0; i < pageIndices.length; i++) {
      const pageIndex = pageIndices[i]

      // Update progress
      const progress = ((i + 1) / pageIndices.length) * 100
      document.getElementById("progressFill").style.width = `${progress}%`
      document.getElementById("progressText").textContent = `Memproses halaman ${i + 1} dari ${pageIndices.length}...`

      // Switch to the page we want to capture
      this.currentPageIndex = pageIndex
      this.renderCurrentPage()

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Capture the page
      const pageElement = document.getElementById("currentPage")

      try {
        const canvas = await html2canvas(pageElement, {
          scale: scale,
          quality: quality,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 600,
          height: 400,
        })

        const imgData = canvas.toDataURL("image/jpeg", quality)

        // Add new page if not first
        if (i > 0) {
          pdf.addPage()
        }

        // Calculate dimensions to fit page
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

        const finalWidth = imgWidth * ratio
        const finalHeight = imgHeight * ratio

        // Center the image
        const x = (pdfWidth - finalWidth) / 2
        const y = (pdfHeight - finalHeight) / 2

        pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight)

        // Add page number
        pdf.setFontSize(10)
        pdf.setTextColor(128, 128, 128)
        pdf.text(`Halaman ${pageIndex + 1}`, pdfWidth - 20, pdfHeight - 10)
      } catch (error) {
        console.error(`Error capturing page ${pageIndex + 1}:`, error)
        // Continue with next page
      }
    }

    // Restore original page
    this.currentPageIndex = originalPageIndex
    this.renderCurrentPage()

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `scrapbook-${timestamp}.pdf`

    // Save PDF
    pdf.save(filename)

    return filename
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
  }

  exportScrapbook() {
    const exportData = {
      title: "My Digital Scrapbook",
      created: new Date().toISOString(),
      pages: this.pages,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = "scrapbook-export.json"
    link.click()

    // Show success message
    this.showNotification("✅ Scrapbook berhasil diekspor!")
  }

  showNotification(message) {
    const notification = document.createElement("div")
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
        `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // Add method to handle viewport changes
  handleViewportChange() {
    // Update meta viewport for better mobile experience
    let viewport = document.querySelector("meta[name=viewport]")
    if (!viewport) {
      viewport = document.createElement("meta")
      viewport.name = "viewport"
      document.getElementsByTagName("head")[0].appendChild(viewport)
    }

    if (this.isMobile) {
      viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    } else {
      viewport.content = "width=device-width, initial-scale=1.0"
    }
  }

  // Update sample content for responsive
  addSampleContent() {
    // Adjust sample content size based on screen
    let photoWidth = 300
    let photoHeight = 200
    let fontSize = 24

    if (this.isMobile) {
      photoWidth = window.innerWidth < 480 ? 150 : 200
      photoHeight = window.innerWidth < 480 ? 100 : 133
      fontSize = window.innerWidth < 480 ? 16 : 20
    }

    const samplePhoto = {
      id: "sample-1",
      src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjMwMCB4IDIwMDwvdGV4dD48L3N2Zz4=",
      x: 20,
      y: 30,
      width: photoWidth,
      height: photoHeight,
      rotation: -2,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filter: "none",
    }

    const sampleText = {
      id: "sample-text-1",
      content: "Kenangan Indah",
      x: 30,
      y: this.getPageHeight() - 60,
      fontSize: fontSize,
      color: "#8B4513",
      fontFamily: "Dancing Script",
    }

    const sampleStickers = [
      {
        id: "sample-sticker-1",
        emoji: "❤️",
        x: this.getPageWidth() - 60,
        y: 30,
        size: this.isMobile ? 20 : 30,
      },
      {
        id: "sample-sticker-2",
        emoji: "⭐",
        x: this.getPageWidth() - 80,
        y: this.getPageHeight() - 80,
        size: this.isMobile ? 18 : 25,
      },
    ]

    this.pages[0].photos.push(samplePhoto)
    this.pages[0].texts.push(sampleText)
    this.pages[0].stickers.push(...sampleStickers)

    this.renderCurrentPage()
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ScrapbookApp()
})

// Utility functions
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function getRandomRotation() {
  return (Math.random() - 0.5) * 20 // -10 to 10 degrees
}

function getRandomPosition(maxWidth, maxHeight, elementWidth, elementHeight) {
  return {
    x: Math.random() * (maxWidth - elementWidth),
    y: Math.random() * (maxHeight - elementHeight),
  }
}

// Export for potential use in other scripts
window.ScrapbookApp = ScrapbookApp

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Add to home screen prompt
let deferredPrompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredPrompt = e

  // Show install button or banner
  const installBtn = document.createElement("button")
  installBtn.textContent = "📱 Install App"
  installBtn.className = "action-btn primary"
  installBtn.style.position = "fixed"
  installBtn.style.bottom = "20px"
  installBtn.style.right = "20px"
  installBtn.style.zIndex = "1000"

  installBtn.addEventListener("click", () => {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      }
      deferredPrompt = null
      installBtn.remove()
    })
  })

  document.body.appendChild(installBtn)

  // Auto hide after 10 seconds
  setTimeout(() => {
    if (installBtn.parentNode) {
      installBtn.remove()
    }
  }, 10000)
})

// Handle app installed
window.addEventListener("appinstalled", (evt) => {
  console.log("App was installed")
})
