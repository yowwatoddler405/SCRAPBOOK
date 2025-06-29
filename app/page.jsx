"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Camera, Type, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialPages = [
  {
    id: 1,
    photos: [
      {
        id: "1",
        src: "/placeholder.svg?height=200&width=300",
        x: 50,
        y: 80,
        width: 300,
        height: 200,
        rotation: -2,
      },
    ],
    texts: [
      {
        id: "1",
        content: "Kenangan Indah",
        x: 100,
        y: 320,
        fontSize: 24,
        color: "#8B4513",
        fontFamily: "cursive",
      },
    ],
    stickers: [
      { id: "1", emoji: "❤️", x: 380, y: 100, size: 30 },
      { id: "2", emoji: "⭐", x: 420, y: 250, size: 25 },
    ],
    background: "bg-amber-50",
  },
  {
    id: 2,
    photos: [
      {
        id: "2",
        src: "/placeholder.svg?height=180&width=250",
        x: 80,
        y: 60,
        width: 250,
        height: 180,
        rotation: 3,
      },
      {
        id: "3",
        src: "/placeholder.svg?height=150&width=200",
        x: 350,
        y: 200,
        width: 200,
        height: 150,
        rotation: -1,
      },
    ],
    texts: [
      {
        id: "2",
        content: "Petualangan Seru",
        x: 120,
        y: 280,
        fontSize: 20,
        color: "#2563eb",
        fontFamily: "serif",
      },
    ],
    stickers: [
      { id: "3", emoji: "🌟", x: 300, y: 120, size: 28 },
      { id: "4", emoji: "🎈", x: 500, y: 80, size: 32 },
    ],
    background: "bg-blue-50",
  },
]

export default function ScrapbookApp() {
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState(initialPages)
  const [isFlipping, setIsFlipping] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)
  const [newText, setNewText] = useState("")
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const flipToNext = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsFlipping(false)
      }, 600)
    }
  }

  const flipToPrev = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setIsFlipping(false)
      }, 600)
    }
  }

  const addPhoto = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now().toString(),
            src: e.target?.result,
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 50,
            width: 200,
            height: 150,
            rotation: (Math.random() - 0.5) * 10,
          }

          const updatedPages = [...pages]
          updatedPages[currentPage].photos.push(newPhoto)
          setPages(updatedPages)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const addText = () => {
    if (newText.trim()) {
      const newTextItem = {
        id: Date.now().toString(),
        content: newText,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        fontSize: 18,
        color: "#374151",
        fontFamily: "sans-serif",
      }

      const updatedPages = [...pages]
      updatedPages[currentPage].texts.push(newTextItem)
      setPages(updatedPages)
      setNewText("")
    }
  }

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      size: 30,
    }

    const updatedPages = [...pages]
    updatedPages[currentPage].stickers.push(newSticker)
    setPages(updatedPages)
  }

  const handleMouseDown = (e, item, type) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setDraggedItem({ ...item, type })
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e) => {
    if (draggedItem) {
      const pageRect = document.querySelector(".scrapbook-page").getBoundingClientRect()
      const newX = e.clientX - pageRect.left - dragOffset.x
      const newY = e.clientY - pageRect.top - dragOffset.y

      const updatedPages = [...pages]
      const currentPageData = updatedPages[currentPage]

      if (draggedItem.type === "photo") {
        const photoIndex = currentPageData.photos.findIndex((p) => p.id === draggedItem.id)
        if (photoIndex !== -1) {
          currentPageData.photos[photoIndex] = {
            ...currentPageData.photos[photoIndex],
            x: Math.max(0, Math.min(newX, 600 - draggedItem.width)),
            y: Math.max(0, Math.min(newY, 400 - draggedItem.height)),
          }
        }
      } else if (draggedItem.type === "text") {
        const textIndex = currentPageData.texts.findIndex((t) => t.id === draggedItem.id)
        if (textIndex !== -1) {
          currentPageData.texts[textIndex] = {
            ...currentPageData.texts[textIndex],
            x: Math.max(0, Math.min(newX, 550)),
            y: Math.max(0, Math.min(newY, 380)),
          }
        }
      } else if (draggedItem.type === "sticker") {
        const stickerIndex = currentPageData.stickers.findIndex((s) => s.id === draggedItem.id)
        if (stickerIndex !== -1) {
          currentPageData.stickers[stickerIndex] = {
            ...currentPageData.stickers[stickerIndex],
            x: Math.max(0, Math.min(newX, 570)),
            y: Math.max(0, Math.min(newY, 370)),
          }
        }
      }

      setPages(updatedPages)
    }
  }

  const handleMouseUp = () => {
    setDraggedItem(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const currentPageData = pages[currentPage]

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-red-100 p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">📖 Scrapbook Digital</h1>
          <p className="text-amber-600">Kumpulkan kenangan indah Anda</p>
        </div>

        {/* Tools */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <Button
            onClick={addPhoto}
            variant={selectedTool === "photo" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            Tambah Foto
          </Button>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Tulis teks..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-40"
              onKeyPress={(e) => e.key === "Enter" && addText()}
            />
            <Button onClick={addText} variant="outline">
              <Type size={16} />
            </Button>
          </div>

          <div className="flex gap-1 flex-wrap">
            {["❤️", "⭐", "🌟", "🎈", "🌸", "🦋", "🎉", "🌈"].map((emoji) => (
              <Button key={emoji} onClick={() => addSticker(emoji)} variant="outline" size="sm" className="text-lg">
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Scrapbook */}
        <div className="flex justify-center items-center">
          <div className="relative">
            {/* Book Shadow */}
            <div className="absolute inset-0 bg-black/20 blur-xl transform translate-y-4 translate-x-2 rounded-lg"></div>

            {/* Book Cover */}
            <div className="relative bg-gradient-to-br from-amber-800 to-amber-900 p-8 rounded-lg shadow-2xl">
              {/* Book Binding */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-amber-900 to-amber-800 rounded-l-lg">
                <div className="h-full flex flex-col justify-evenly items-center">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 h-4 bg-amber-700 rounded"></div>
                  ))}
                </div>
              </div>

              {/* Page Container */}
              <div className="ml-4 relative">
                <div
                  className={`scrapbook-page w-[600px] h-[400px] ${currentPageData.background} rounded-r-lg shadow-inner relative overflow-hidden transition-transform duration-600 ${
                    isFlipping ? "transform rotateY-180" : ""
                  }`}
                  style={{
                    backgroundImage: `
                      linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px),
                      linear-gradient(rgba(0,0,0,0.05) 0px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                >
                  {/* Page Content */}
                  <div className="absolute inset-4">
                    {/* Photos */}
                    {currentPageData.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="absolute cursor-move shadow-lg hover:shadow-xl transition-shadow"
                        style={{
                          left: photo.x,
                          top: photo.y,
                          width: photo.width,
                          height: photo.height,
                          transform: `rotate(${photo.rotation}deg)`,
                          zIndex: draggedItem?.id === photo.id ? 50 : 10,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, photo, "photo")}
                      >
                        <img
                          src={photo.src || "/placeholder.svg"}
                          alt="Scrapbook photo"
                          className="w-full h-full object-cover rounded border-4 border-white shadow-md"
                          draggable={false}
                        />
                        {/* Photo corners */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-600 transform rotate-45"></div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-600 transform rotate-45"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-600 transform rotate-45"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-600 transform rotate-45"></div>
                      </div>
                    ))}

                    {/* Texts */}
                    {currentPageData.texts.map((text) => (
                      <div
                        key={text.id}
                        className="absolute cursor-move hover:bg-black/5 p-1 rounded transition-colors"
                        style={{
                          left: text.x,
                          top: text.y,
                          fontSize: text.fontSize,
                          color: text.color,
                          fontFamily: text.fontFamily,
                          zIndex: draggedItem?.id === text.id ? 50 : 20,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, text, "text")}
                      >
                        {text.content}
                      </div>
                    ))}

                    {/* Stickers */}
                    {currentPageData.stickers.map((sticker) => (
                      <div
                        key={sticker.id}
                        className="absolute cursor-move hover:scale-110 transition-transform"
                        style={{
                          left: sticker.x,
                          top: sticker.y,
                          fontSize: sticker.size,
                          zIndex: draggedItem?.id === sticker.id ? 50 : 30,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, sticker, "sticker")}
                      >
                        {sticker.emoji}
                      </div>
                    ))}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-2 right-4 text-xs text-gray-500 font-serif">
                    Halaman {currentPage + 1}
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-2 right-2 text-amber-400 opacity-30">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M0,0 L20,0 L20,20 Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              onClick={flipToPrev}
              disabled={currentPage === 0 || isFlipping}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full w-12 h-12 bg-amber-600 hover:bg-amber-700"
              variant="secondary"
            >
              <ChevronLeft size={20} />
            </Button>

            <Button
              onClick={flipToNext}
              disabled={currentPage === pages.length - 1 || isFlipping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-12 h-12 bg-amber-600 hover:bg-amber-700"
              variant="secondary"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => !isFlipping && setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPage ? "bg-amber-600" : "bg-amber-300"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => {
              const newPage = {
                id: pages.length + 1,
                photos: [],
                texts: [],
                stickers: [],
                background: "bg-white",
              }
              setPages([...pages, newPage])
            }}
          >
            ➕ Tambah Halaman
          </Button>

          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" variant="outline">
            <Download size={16} />
            Ekspor Scrapbook
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-600 bg-white/50 p-4 rounded-lg">
          <p className="mb-2">
            🎨 <strong>Cara Menggunakan:</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>• Klik "Tambah Foto" untuk upload gambar</div>
            <div>• Tulis teks dan tekan Enter atau klik ikon Type</div>
            <div>• Klik emoji untuk menambah sticker</div>
            <div>• Drag & drop untuk memindahkan elemen</div>
            <div>• Gunakan panah untuk berpindah halaman</div>
            <div>• Klik indikator bulat untuk loncat ke halaman</div>
          </div>
        </div>
      </div>
    </div>
  )
}
