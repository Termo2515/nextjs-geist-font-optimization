"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generatePDF, printTable, type ArticleData } from "@/lib/pdfExport"
import { PrintService } from "@/lib/printService"
import { PrinterConfigButton } from "@/components/printer-config"

const formSchema = z.object({
  categoria: z.enum(["EDILIZIA", "TERMOIDRAULICA", "ATTREZZATURA", "ALTRO"], {
    required_error: "Categoria è obbligatoria.",
  }),
  codArt: z.string().optional(),
  descrizione: z.string().min(1, {
    message: "Descrizione è obbligatoria.",
  }),
  um: z.enum(["PZ", "MQ", "MC", "KG", "MT"], {
    required_error: "Unità di Misura è obbligatoria.",
  }),
  prezzo: z.number({
    required_error: "Prezzo è obbligatorio.",
    invalid_type_error: "Prezzo deve essere un numero.",
  }).min(0, {
    message: "Prezzo deve essere maggiore o uguale a 0.",
  }),
  note: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreamiPage() {
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedArticle, setSelectedArticle] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoria: "EDILIZIA",
      codArt: "",
      descrizione: "",
      um: "PZ",
      prezzo: 0,
      note: "",
    },
  })

  const onSubmit = (values: FormData) => {
    const newArticle: ArticleData = {
      id: Date.now().toString(),
      categoria: values.categoria,
      codArt: values.codArt || "",
      descrizione: values.descrizione,
      um: values.um,
      prezzo: values.prezzo,
      note: values.note || "",
      dataInserimento: new Date().toLocaleDateString('it-IT'),
    }

    setArticles(prev => [...prev, newArticle])
    form.reset()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDeleteLast = () => {
    if (articles.length > 0) {
      setArticles(prev => prev.slice(0, -1))
    }
  }

  const handlePrintAll = () => {
    PrintService.printPriceList(searchTerm ? filteredArticles : articles, 'all')
  }

  const handlePrintByCategory = () => {
    if (selectedCategory) {
      PrintService.printPriceList(searchTerm ? filteredArticles : articles, 'category', selectedCategory)
    }
  }

  const handlePrintSingle = () => {
    if (selectedArticle) {
      PrintService.printPriceList(searchTerm ? filteredArticles : articles, 'single', selectedArticle)
    }
  }

  const handleExportPDF = () => {
    generatePDF(searchTerm ? filteredArticles : articles, 'all')
  }

  const handleExportPDFByCategory = () => {
    if (selectedCategory) {
      generatePDF(searchTerm ? filteredArticles : articles, 'category', selectedCategory)
    }
  }

  const handleExportPDFSingle = () => {
    if (selectedArticle) {
      generatePDF(searchTerm ? filteredArticles : articles, 'single', selectedArticle)
    }
  }

  const getArticlesByCategory = () => {
    const grouped = articles.reduce((acc, article) => {
      if (!acc[article.categoria]) {
        acc[article.categoria] = []
      }
      acc[article.categoria].push(article)
      return acc
    }, {} as Record<string, ArticleData[]>)
    
    return grouped
  }

  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    return article.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
           article.codArt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const groupedArticles = getArticlesByCategory()
  const filteredGroupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.categoria]) {
      acc[article.categoria] = []
    }
    acc[article.categoria].push(article)
    return acc
  }, {} as Record<string, ArticleData[]>)

  const categories = Object.keys(groupedArticles)
  const filteredCategories = Object.keys(filteredGroupedArticles)
  const uniqueCategories = ["EDILIZIA", "TERMOIDRAULICA", "ATTREZZATURA", "ALTRO"]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TERMOEXPERT SRLU</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sistema CREAMI</h2>
          <p className="text-gray-600">Gestione Listino Prezzi Professionale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Inserimento Nuovo Articolo</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EDILIZIA">EDILIZIA</SelectItem>
                            <SelectItem value="TERMOIDRAULICA">TERMOIDRAULICA</SelectItem>
                            <SelectItem value="ATTREZZATURA">ATTREZZATURA</SelectItem>
                            <SelectItem value="ALTRO">ALTRO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codArt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice Articolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Inserisci codice articolo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descrizione"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrizione *</FormLabel>
                        <FormControl>
                          <Input placeholder="Inserisci descrizione" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="um"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unità di Misura *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona U.M." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="PZ">PZ</SelectItem>
                          <SelectItem value="MQ">MQ</SelectItem>
                          <SelectItem value="MC">MC</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prezzo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo (€) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Inserisci note aggiuntive (opzionale)" 
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      INSERISCI
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDeleteLast}
                      disabled={articles.length === 0}
                      className="flex-1"
                    >
                      INDIETRO
                    </Button>
                  </div>
                </form>
              </Form>

              {showSuccess && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  Articolo inserito con successo!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Azioni Listino</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Print Actions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Stampa</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={handlePrintAll} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={articles.length === 0}
                  >
                    Stampa Listino Completo
                  </Button>
                  
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handlePrintByCategory}
                      disabled={!selectedCategory || !categories.includes(selectedCategory)}
                      variant="outline"
                    >
                      Stampa Categoria
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleziona articolo" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map(article => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.codArt} - {article.descrizione}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handlePrintSingle}
                      disabled={!selectedArticle}
                      variant="outline"
                    >
                      Stampa Singolo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Export PDF Actions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Esporta PDF</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={handleExportPDF} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={articles.length === 0}
                  >
                    Esporta in PDF - Listino Completo
                  </Button>
                  
                  <Button 
                    onClick={handleExportPDFByCategory}
                    disabled={!selectedCategory || !categories.includes(selectedCategory)}
                    variant="outline"
                    className="w-full"
                  >
                    Esporta PDF - Categoria Selezionata
                  </Button>

                  <Button 
                    onClick={handleExportPDFSingle}
                    disabled={!selectedArticle}
                    variant="outline"
                    className="w-full"
                  >
                    Esporta PDF - Articolo Singolo
                  </Button>
                </div>
              </div>

              {/* Statistics */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Statistiche</h3>
                <div className="text-sm text-gray-600">
                  <p>Totale articoli: <span className="font-semibold">{articles.length}</span></p>
                  {categories.map(cat => (
                    <p key={cat}>
                      {cat}: <span className="font-semibold">{groupedArticles[cat].length}</span>
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        {articles.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Ricerca Articoli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Cerca per descrizione o codice articolo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="whitespace-nowrap"
                  >
                    Pulisci
                  </Button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mb-4">
                  {filteredArticles.length} risultati trovati
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Articles Table */}
        {filteredArticles.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {searchTerm ? "RISULTATI RICERCA" : "LISTINO PREZZI"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Cod. Art.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Descrizione</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Categoria</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">U.M.</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Prezzo</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Note</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchTerm ? (
                      filteredArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{article.codArt}</td>
                          <td className="border border-gray-300 px-4 py-2">{article.descrizione}</td>
                          <td className="border border-gray-300 px-4 py-2">{article.categoria}</td>
                          <td className="border border-gray-300 px-4 py-2">{article.um}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            € {article.prezzo.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{article.note}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                            {article.dataInserimento}
                          </td>
                        </tr>
                      ))
                    ) : (
                      Object.entries(filteredGroupedArticles).map(([categoria, articoli]) => (
                        <React.Fragment key={categoria}>
                          <tr className="bg-blue-50">
                            <td colSpan={7} className="border border-gray-300 px-4 py-2 font-semibold text-blue-800">
                              {categoria}
                            </td>
                          </tr>
                          {articoli.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">{article.codArt}</td>
                              <td className="border border-gray-300 px-4 py-2">{article.descrizione}</td>
                              <td className="border border-gray-300 px-4 py-2">{article.categoria}</td>
                              <td className="border border-gray-300 px-4 py-2">{article.um}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                                € {article.prezzo.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{article.note}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                {article.dataInserimento}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredArticles.length === 0 && searchTerm && (
          <Card className="mt-8 shadow-lg">
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Nessun risultato trovato per "{searchTerm}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
