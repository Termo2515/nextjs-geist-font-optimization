export interface ArticleData {
  id: string
  categoria: string
  codArt: string
  descrizione: string
  um: string
  prezzo: number
  note: string
  dataInserimento: string
}

export const generatePDF = async (
  data: ArticleData[],
  type: 'all' | 'category' | 'single',
  filterValue?: string
) => {
  // Dinamically import jsPDF to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMOEXPERT SRLU', 105, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('LISTINO PREZZI', 105, 30, { align: 'center' })
  
  // Filter data based on type
  let filteredData = data
  let title = 'Listino Completo'
  
  if (type === 'category' && filterValue) {
    filteredData = data.filter(item => item.categoria === filterValue)
    title = `Categoria: ${filterValue}`
  } else if (type === 'single' && filterValue) {
    filteredData = data.filter(item => item.id === filterValue)
    title = 'Articolo Singolo'
  }
  
  doc.setFontSize(12)
  doc.text(title, 105, 40, { align: 'center' })
  
  // Table headers
  const headers = ['Cod. Art.', 'Descrizione', 'Categoria', 'U.M.', 'Prezzo €', 'Note']
  const startY = 55
  let currentY = startY
  
  // Draw headers
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  
  const colWidths = [25, 60, 35, 20, 25, 35]
  let currentX = 10
  
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY)
    currentX += colWidths[index]
  })
  
  // Draw header line
  doc.line(10, currentY + 2, 200, currentY + 2)
  currentY += 8
  
  // Draw data rows
  doc.setFont('helvetica', 'normal')
  
  filteredData.forEach((item) => {
    if (currentY > 270) {
      doc.addPage()
      currentY = 20
    }
    
    currentX = 10
    const rowData = [
      item.codArt,
      item.descrizione.length > 25 ? item.descrizione.substring(0, 25) + '...' : item.descrizione,
      item.categoria,
      item.um,
      `€ ${item.prezzo.toFixed(2)}`,
      item.note.length > 15 ? item.note.substring(0, 15) + '...' : item.note
    ]
    
    rowData.forEach((data, index) => {
      doc.text(data, currentX, currentY)
      currentX += colWidths[index]
    })
    
    currentY += 6
  })
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Pagina ${i} di ${pageCount}`, 105, 290, { align: 'center' })
    doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 200, 290, { align: 'right' })
  }
  
  // Save the PDF
  const fileName = type === 'all' ? 'listino-completo.pdf' : 
                  type === 'category' ? `categoria-${filterValue}.pdf` : 
                  'articolo-singolo.pdf'
  
  doc.save(fileName)
}

export const printTable = (
  data: ArticleData[],
  type: 'all' | 'category' | 'single',
  filterValue?: string
) => {
  let filteredData = data
  let title = 'LISTINO PREZZI COMPLETO'
  
  if (type === 'category' && filterValue) {
    filteredData = data.filter(item => item.categoria === filterValue)
    title = `LISTINO PREZZI - CATEGORIA: ${filterValue}`
  } else if (type === 'single' && filterValue) {
    filteredData = data.filter(item => item.id === filterValue)
    title = 'ARTICOLO SINGOLO'
  }
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .title {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .price {
          text-align: right;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">TERMOEXPERT SRLU</div>
        <div class="title">${title}</div>
        <div class="subtitle">Generato il: ${new Date().toLocaleDateString('it-IT')}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Cod. Art.</th>
            <th>Descrizione</th>
            <th>Categoria</th>
            <th>U.M.</th>
            <th>Prezzo</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${filteredData.map(item => `
            <tr>
              <td>${item.codArt}</td>
              <td>${item.descrizione}</td>
              <td>${item.categoria}</td>
              <td>${item.um}</td>
              <td class="price">€ ${item.prezzo.toFixed(2)}</td>
              <td>${item.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>TERMOEXPERT SRLU - Sistema di Gestione Listino Prezzi</p>
        <p>Totale articoli: ${filteredData.length}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
