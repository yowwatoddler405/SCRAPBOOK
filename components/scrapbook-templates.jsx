"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ScrapbookTemplates({ onSelectTemplate, onClose }) {
  const templates = [
    {
      id: "vintage",
      name: "Vintage Classic",
      emoji: "📸",
      description: "Gaya klasik dengan warna hangat dan dekorasi vintage",
      background: "bg-amber-50",
      colors: ["#F5E6D3", "#E8D5B7", "#D4C4A8"],
      decorations: ["🌸", "🍂", "📜", "🕯️"],
      preview: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "modern",
      name: "Modern Minimalist",
      emoji: "✨",
      description: "Desain bersih dan modern dengan aksen geometris",
      background: "bg-gray-50",
      colors: ["#FFFFFF", "#F8F9FA", "#E9ECEF"],
      decorations: ["⭐", "💫", "🔸", "◆"],
      preview: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "cute",
      name: "Cute & Sweet",
      emoji: "🌸",
      description: "Tema manis dengan warna pastel dan dekorasi lucu",
      background: "bg-pink-50",
      colors: ["#FFE4E1", "#FFB6C1", "#FFC0CB"],
      decorations: ["🌸", "🦋", "💕", "🎀"],
      preview: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "nature",
      name: "Nature Fresh",
      emoji: "🌿",
      description: "Tema alam dengan warna hijau dan elemen natural",
      background: "bg-green-50",
      colors: ["#F0F8E8", "#E8F5E8", "#D4F1D4"],
      decorations: ["🌿", "🌱", "🍃", "🌻"],
      preview: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "travel",
      name: "Travel Adventure",
      emoji: "✈️",
      description: "Tema perjalanan dengan elemen petualangan",
      background: "bg-blue-50",
      colors: ["#E6F3FF", "#CCE7FF", "#B3DBFF"],
      decorations: ["✈️", "🗺️", "🧳", "📍"],
      preview: "/placeholder.svg?height=100&width=150",
    },
    {
      id: "birthday",
      name: "Birthday Party",
      emoji: "🎉",
      description: "Tema ulang tahun dengan dekorasi pesta",
      background: "bg-yellow-50",
      colors: ["#FFF9E6", "#FFF3CD", "#FFECB3"],
      decorations: ["🎉", "🎂", "🎈", "🎁"],
      preview: "/placeholder.svg?height=100&width=150",
    },
  ]

  const handleSelectTemplate = (template) => {
    const newPage = {
      id: Date.now(),
      photos: [],
      texts: [
        {
          id: Date.now().toString(),
          content: `${template.name} Template`,
          x: 50,
          y: 50,
          fontSize: 24,
          color: "#374151",
          fontFamily: "serif",
        },
      ],
      stickers: template.decorations.slice(0, 2).map((emoji, index) => ({
        id: `${Date.now()}-${index}`,
        emoji,
        x: 100 + index * 100,
        y: 100 + index * 50,
        size: 30,
      })),
      background: template.background,
      theme: template.id,
    }

    onSelectTemplate(newPage)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[800px] max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎨 Pilih Template Scrapbook</span>
            <Button variant="ghost" onClick={onClose} className="text-xl">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                      {/* Color Palette */}
                      <div className="flex gap-1 mb-3">
                        {template.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* Decorations Preview */}
                      <div className="flex gap-1 mb-3">
                        {template.decorations.map((emoji, index) => (
                          <span key={index} className="text-lg">
                            {emoji}
                          </span>
                        ))}
                      </div>

                      <Button onClick={() => handleSelectTemplate(template)} className="w-full" variant="outline">
                        Gunakan Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
