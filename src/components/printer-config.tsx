"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { PrinterConfigService, type PrinterConfig } from "@/lib/printerConfig"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PrinterConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: PrinterConfig) => void
}

export function PrinterConfigModal({ isOpen, onClose, onSave }: PrinterConfigModalProps) {
  const [config, setConfig] = useState<PrinterConfig>(PrinterConfigService.getConfig())

  const handleSave = () => {
    PrinterConfigService.saveConfig(config)
    onSave(config)
    onClose()
  }

  const handleReset = () => {
    PrinterConfigService.resetConfig()
    setConfig(PrinterConfigService.getConfig())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurazione Stampa</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impostazioni di Stampa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printer-name">Nome Stampante</Label>
                <Input
                  id="printer-name"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Es. Stampante Ufficio"
                />
              </div>

              <div>
                <Label htmlFor="paper-size">Formato Carta</Label>
                <Select
                  value={config.paperSize}
                  onValueChange={(value) => setConfig({ ...config, paperSize: value as any })}
                >
                  <SelectTrigger id="paper-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5×11")</SelectItem>
                    <SelectItem value="Legal">Legal (8.5×14")</SelectItem>
                    <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orientation">Orientamento</Label>
                <Select
                  value={config.orientation}
                  onValueChange={(value) => setConfig({ ...config, orientation: value as any })}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Verticale</SelectItem>
                    <SelectItem value="landscape">Orizzontale</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scale">Scala (%)</Label>
                <Input
                  id="scale"
                  type="number"
                  min="50"
                  max="200"
                  value={config.scale}
                  onChange={(e) => setConfig({ ...config, scale: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label htmlFor="margin-top">Margine Superiore (mm)</Label>
                <Input
                  id="margin-top"
                  type="number"
                  min="0"
                  max="50"
                  value={config.margins.top}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    margins: { ...config.margins, top: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="margin-right">Margine Destro (mm)</Label>
                <Input
                  id="margin-right"
                  type="number"
                  min="0"
                  max="50"
                  value={config.margins.right}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    margins: { ...config.margins, right: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="margin-bottom">Margine Inferiore (mm)</Label>
                <Input
                  id="margin-bottom"
                  type="number"
                  min="0"
                  max="50"
                  value={config.margins.bottom}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    margins: { ...config.margins, bottom: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label htmlFor="margin-left">Margine Sinistro (mm)</Label>
                <Input
                  id="margin-left"
                  type="number"
                  min="0"
                  max="50"
                  value={config.margins.left}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    margins: { ...config.margins, left: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-headers">Mostra Intestazione</Label>
                <Switch
                  id="show-headers"
                  checked={config.showHeaders}
                  onCheckedChange={(checked) => setConfig({ ...config, showHeaders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-footers">Mostra Piè di Pagina</Label>
                <Switch
                  id="show-footers"
                  checked={config.showFooters}
                  onCheckedChange={(checked) => setConfig({ ...config, showFooters: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-date">Includi Data</Label>
                <Switch
                  id="include-date"
                  checked={config.includeDate}
                  onCheckedChange={(checked) => setConfig({ ...config, includeDate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-page-numbers">Includi Numeri di Pagina</Label>
                <Switch
                  id="include-page-numbers"
                  checked={config.includePageNumbers}
                  onCheckedChange={(checked) => setConfig({ ...config, includePageNumbers: checked })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Salva Configurazione
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Ripristina Predefiniti
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export function PrinterConfigButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        Configura Stampa
      </Button>
      <PrinterConfigModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={() => {
          // Config saved automatically
        }}
      />
    </>
  )
}
