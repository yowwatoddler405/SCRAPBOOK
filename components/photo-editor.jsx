"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PhotoEditor({ imageUrl, onSave, onClose }) {
  const [brightness, setBrightness] = useState([100])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])
  const [blur, setBlur] = useState([0])
  const [rotation, setRotation] = useState([0])
  const [selectedFilter, setSelectedFilter] = useState(null)

  const filters = {
    vintage: "sepia(0.5) contrast(1.2) brightness(1.1)",
    blackwhite: "grayscale(1) contrast(1.1)",
    warm: "sepia(0.3) saturate(1.4) brightness(1.1)",
    cool: "hue-rotate(180deg) saturate(1.2)",
    dramatic: "contrast(1.5) brightness(0.9) saturate(1.3)",
  }

  const applyFilters = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Apply filters
      let filterString = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%) blur(${blur[0]}px)`

      if (selectedFilter) {
        filterString += ` ${filters[selectedFilter]}`
      }

      ctx.filter = filterString

      // Apply rotation
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation[0] * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      ctx.restore()

      const editedImageUrl = canvas.toDataURL("image/jpeg", 0.9)
      onSave(editedImageUrl)
    }

    img.crossOrigin = "anonymous"
    img.src = imageUrl
  }

  const resetAll = () => {
    setBrightness([100])
    setContrast([100])
    setSaturation([100])
    setBlur([0])
    setRotation([0])
    setSelectedFilter(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[700px] max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎨 Edit Foto</span>
            <Button variant="ghost" onClick={onClose} className="text-xl">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-w-[400px] max-h-[300px] object-contain rounded shadow-lg"
                style={{
                  filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%) blur(${blur[0]}px) ${selectedFilter ? filters[selectedFilter] : ""}`,
                  transform: `rotate(${rotation[0]}deg)`,
                }}
              />
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Dasar</TabsTrigger>
                <TabsTrigger value="filters">Filter</TabsTrigger>
                <TabsTrigger value="transform">Transform</TabsTrigger>
                <TabsTrigger value="advanced">Lanjutan</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">☀️ Kecerahan</label>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={200}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{brightness[0]}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">🔆 Kontras</label>
                  <Slider value={contrast} onValueChange={setContrast} max={200} min={0} step={1} className="mt-2" />
                  <span className="text-xs text-gray-500">{contrast[0]}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">🎨 Saturasi</label>
                  <Slider
                    value={saturation}
                    onValueChange={setSaturation}
                    max={200}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-xs text-gray-500">{saturation[0]}%</span>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedFilter === "vintage" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(selectedFilter === "vintage" ? null : "vintage")}
                    className="flex items-center gap-2"
                  >
                    📸 Vintage
                  </Button>
                  <Button
                    variant={selectedFilter === "blackwhite" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(selectedFilter === "blackwhite" ? null : "blackwhite")}
                    className="flex items-center gap-2"
                  >
                    ⚫ B&W
                  </Button>
                  <Button
                    variant={selectedFilter === "warm" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(selectedFilter === "warm" ? null : "warm")}
                    className="flex items-center gap-2"
                  >
                    🔥 Warm
                  </Button>
                  <Button
                    variant={selectedFilter === "cool" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(selectedFilter === "cool" ? null : "cool")}
                    className="flex items-center gap-2"
                  >
                    ❄️ Cool
                  </Button>
                  <Button
                    variant={selectedFilter === "dramatic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(selectedFilter === "dramatic" ? null : "dramatic")}
                    className="flex items-center gap-2"
                  >
                    ⚡ Dramatic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFilter(null)}
                    className="flex items-center gap-2"
                  >
                    🚫 Hapus Filter
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="transform" className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">🔄 Rotasi</label>
                  <Slider value={rotation} onValueChange={setRotation} max={360} min={-360} step={1} className="mt-2" />
                  <span className="text-xs text-gray-500">{rotation[0]}°</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRotation([rotation[0] - 90])}>
                    ↺ 90°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation([rotation[0] + 90])}>
                    ↻ 90°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation([180])}>
                    180°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation([0])}>
                    Reset
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">🌫️ Blur</label>
                  <Slider value={blur} onValueChange={setBlur} max={10} min={0} step={0.1} className="mt-2" />
                  <span className="text-xs text-gray-500">{blur[0]}px</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={resetAll}>
                    🔄 Reset Semua
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBrightness([120])
                      setContrast([110])
                      setSaturation([90])
                    }}
                  >
                    ✨ Auto Enhance
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                ❌ Batal
              </Button>
              <Button onClick={applyFilters} className="bg-green-600 hover:bg-green-700">
                ✅ Simpan Perubahan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
