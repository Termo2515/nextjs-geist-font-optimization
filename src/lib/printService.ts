import { PrinterConfigService } from './printerConfig'
import { ArticleData } from './pdfExport'

export class PrintService {
  static printPriceList(
    data: ArticleData[],
    type: 'all' | 'category' | 'single',
    filterValue?: string
  ) {
    const config = PrinterConfigService.getConfig()
    
    let filteredData = data
    let title = 'Listino Completo'
    
    if (type === 'category' && filterValue) {
      filteredData = data.filter(item => item.categoria === filterValue)
      title = `Categoria: ${filterValue}`
    } else if (type === 'single' && filterValue) {
      filteredData = data.filter(item => item.id === filterValue)
      title = 'Articolo Singolo'
    }
    
    // Create print-optimized HTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              size: ${config.paperSize} ${config.orientation};
              margin: ${config.margins.top}mm ${config.margins.right}mm ${config.margins.bottom}mm ${config.margins.left}mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            
            .company-name {
              font-size: 20px;
              font-weight: bold;
            }
            
            .title {
              font-size: 16px;
              margin-bottom: 10px;
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
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">TERMOEXPERT SRLU</div>
          <div class="title">${title}</div>
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
                <td>€ ${item.prezzo.toFixed(2)}</td>
                <td>${item.note}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}
