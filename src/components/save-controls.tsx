"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Save, RotateCcw } from "lucide-react"
import { StorageService, type ArticleData } from "@/lib/storage"
import { DataExportService } from "@/lib/dataExport"

interface SaveControlsProps {
  articles: ArticleData[]
  onArticlesLoaded: (articles: ArticleData[]) => void
}

export function SaveControls({ articles, onArticlesLoaded }: SaveControlsProps) {
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Load last save time on mount
  useEffect(() => {
    const lastSave = StorageService.getLastSaveTime()
    setLastSaveTime(lastSave)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (articles.length > 0) {
      const timer = setTimeout(() => {
        setIsAutoSaving(true)
        StorageService.saveArticles(articles)
        setLastSaveTime(new Date().toISOString())
        setIsAutoSaving(false)
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [articles])

  const handleManualSave = () => {
    StorageService.saveArticles(articles)
    setLastSaveTime(new Date().toISOString())
    setSuccessMessage("Dati salvati con successo!")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `cremai-listino-${timestamp}.json`
    StorageService.exportToJSON(articles, filename)
    setSuccessMessage("Esportazione completata!")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleExportCSV = () => {
    DataExportService.exportToCSV(articles)
    setSuccessMessage("CSV esportato con successo!")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleExportBackup = () => {
    DataExportService.createComprehensiveBackup(articles)
    setSuccessMessage("Backup creato con successo!")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await StorageService.importFromJSON(file)
      
      if (result.success) {
        onArticlesLoaded(result.articles)
        setSuccessMessage(result.message)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setSuccessMessage(result.message)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      setSuccessMessage("Errore durante l'importazione")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }

    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {isAutoSaving && (
        <Alert>
          <AlertDescription>Salvataggio automatico in corso...</AlertDescription>
        </Alert>
      )}

      {showSuccess && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Save/Load Controls */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Gestione Dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleManualSave}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={articles.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Salva Manualmente
            </Button>

            <Button 
              onClick={handleExportJSON}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={articles.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Esporta JSON
            </Button>

            <Button 
              onClick={handleExportCSV}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={articles.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Esporta CSV
            </Button>

            <Button 
              onClick={handleExportBackup}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={articles.length === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Crea Backup
            </Button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Importa da file JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {lastSaveTime && (
            <div className="text-sm text-gray-600">
              Ultimo salvataggio: {new Date(lastSaveTime).toLocaleString('it-IT')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Statistics */}
      {articles.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Statistiche Esportazione</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const stats = DataExportService.getExportStats(articles)
              return (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Totale articoli: <span className="font-semibold">{stats.totalArticles}</span></p>
                  <p>Categorie: <span className="font-semibold">{stats.categories.join(', ')}</span></p>
                  <p>Prezzo medio: <span className="font-semibold">€ {stats.averagePrice.toFixed(2)}</span></p>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
