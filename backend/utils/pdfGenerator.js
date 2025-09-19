const puppeteer = require('puppeteer');
const moment = require('moment');
const { formatCurrency, numberToWordsBG } = require('./helpers');

// Traducciones para PDF
const translations = {
  bg: {
    invoice: 'ФАКТУРА',
    quote: 'ОФЕРТА',
    delivery: 'ПРИДРУЖАВАЩ ДОКУМЕНТ',
    proforma: 'ФАКТУРА ПРОФОРМА',
    from: 'ИЗДАТЕЛ',
    to: 'ПОЛУЧАТЕЛ',
    date: 'Дата',
    dueDate: 'Падеж',
    number: 'Номер',
    eik: 'ЕИК',
    vat: 'ДДС №',
    description: 'Описание',
    quantity: 'Количество',
    unit: 'Мерна единица',
    unitPrice: 'Единична цена',
    amount: 'Сума',
    subtotal: 'Сума без ДДС',
    vatAmount: 'ДДС',
    total: 'Всичко за плащане',
    inWords: 'Словом',
    notes: 'Бележки',
    paymentInfo: 'Банкови данни',
    bank: 'Банка',
    iban: 'IBAN',
    bic: 'BIC',
    currency: 'лв.'
  },
  es: {
    invoice: 'FACTURA',
    quote: 'PRESUPUESTO',
    delivery: 'ALBARÁN',
    proforma: 'FACTURA PROFORMA',
    from: 'EMISOR',
    to: 'RECEPTOR',
    date: 'Fecha',
    dueDate: 'Vencimiento',
    number: 'Número',
    eik: 'CIF',
    vat: 'NIF IVA',
    description: 'Descripción',
    quantity: 'Cantidad',
    unit: 'Unidad',
    unitPrice: 'Precio Unit.',
    amount: 'Importe',
    subtotal: 'Subtotal',
    vatAmount: 'IVA',
    total: 'Total',
    inWords: 'En letras',
    notes: 'Notas',
    paymentInfo: 'Datos bancarios',
    bank: 'Banco',
    iban: 'IBAN',
    bic: 'BIC',
    currency: '€'
  },
  en: {
    invoice: 'INVOICE',
    quote: 'QUOTE',
    delivery: 'DELIVERY NOTE',
    proforma: 'PROFORMA INVOICE',
    from: 'FROM',
    to: 'TO',
    date: 'Date',
    dueDate: 'Due Date',
    number: 'Number',
    eik: 'UIC',
    vat: 'VAT №',
    description: 'Description',
    quantity: 'Qty',
    unit: 'Unit',
    unitPrice: 'Unit Price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vatAmount: 'VAT',
    total: 'Total',
    inWords: 'In words',
    notes: 'Notes',
    paymentInfo: 'Payment Info',
    bank: 'Bank',
    iban: 'IBAN',
    bic: 'BIC',
    currency: 'BGN'
  }
};

// Generar PDF del documento
exports.generatePDF = async (document) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const t = translations[document.language] || translations.bg;
    
    const html = generateHTML(document, t);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '10mm',
        bottom: '20mm',
        left: '10mm'
      }
    });

    return pdf;
  } finally {
    await browser.close();
  }
};

// Generar HTML del documento
function generateHTML(document, t) {
  const company = document.company;
  const client = document.client;
  const items = document.items || [];
  
  return `
    <!DOCTYPE html>
    <html lang="${document.language}">
    <head>
      <meta charset="UTF-8">
      <title>${t[document.documentType]} ${document.documentNumber}</title>
      <style>${getStyles()}</style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="company-info">
            ${company.logo ? `<img src="data:image/png;base64,${company.logo}" alt="Logo" class="logo">` : ''}
            <h2>${company.name}</h2>
            <p>${company.address}</p>
            <p>${company.city}</p>
            <p>${t.eik}: ${company.eik}</p>
            ${company.vatNumber ? `<p>${t.vat}: ${company.vatNumber}</p>` : ''}
          </div>
          
          <div class="document-info">
            <h1>${t[document.documentType]}</h1>
            <table>
              <tr>
                <td>${t.number}:</td>
                <td><strong>${document.documentNumber}</strong></td>
              </tr>
              <tr>
                <td>${t.date}:</td>
                <td>${moment(document.documentDate).format('DD.MM.YYYY')}</td>
              </tr>
              ${document.dueDate ? `<tr><td>${t.dueDate}:</td><td>${moment(document.dueDate).format('DD.MM.YYYY')}</td></tr>` : ''}
            </table>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h3>${t.from}</h3>
            <p><strong>${company.name}</strong></p>
            <p>${company.address}</p>
            <p>${company.city}</p>
            <p>${t.eik}: ${company.eik}</p>
            ${company.vatNumber ? `<p>${t.vat}: ${company.vatNumber}</p>` : ''}
            <p>Email: ${company.email}</p>
            ${company.phone ? `<p>Tel: ${company.phone}</p>` : ''}
          </div>
          
          <div class="party">
            <h3>${t.to}</h3>
            <p><strong>${client.name}</strong></p>
            <p>${client.address}</p>
            <p>${client.city}</p>
            <p>${t.eik}: ${client.eik}</p>
            ${client.vatNumber ? `<p>${t.vat}: ${client.vatNumber}</p>` : ''}
            ${client.email ? `<p>Email: ${client.email}</p>` : ''}
            ${client.phone ? `<p>Tel: ${client.phone}</p>` : ''}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${t.description}</th>
              <th>${t.quantity}</th>
              <th>${t.unit}</th>
              <th>${t.unitPrice}</th>
              <th>${t.amount}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.description}</td>
                <td class="text-center">${parseFloat(item.quantity).toFixed(2)}</td>
                <td class="text-center">бр.</td>
                <td class="text-right">${parseFloat(item.unitPrice).toFixed(2)} ${t.currency}</td>
                <td class="text-right">${parseFloat(item.total).toFixed(2)} ${t.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>${t.subtotal}:</td>
              <td class="text-right">${parseFloat(document.subtotal).toFixed(2)} ${t.currency}</td>
            </tr>
            <tr>
              <td>${t.vatAmount} (20%):</td>
              <td class="text-right">${parseFloat(document.vatAmount).toFixed(2)} ${t.currency}</td>
            </tr>
            <tr class="total-row">
              <td><strong>${t.total}:</strong></td>
              <td class="text-right"><strong>${parseFloat(document.total).toFixed(2)} ${t.currency}</strong></td>
            </tr>
          </table>
          
          <div class="in-words">
            <p><strong>${t.inWords}:</strong> ${numberToWordsBG(parseFloat(document.total))} ${t.currency}</p>
          </div>
        </div>

        ${document.notes ? `
          <div class="notes">
            <h4>${t.notes}</h4>
            <p>${document.notes}</p>
          </div>
        ` : ''}

        ${company.bankName ? `
          <div class="payment-info">
            <h4>${t.paymentInfo}</h4>
            <table>
              <tr><td>${t.bank}:</td><td>${company.bankName}</td></tr>
              ${company.iban ? `<tr><td>${t.iban}:</td><td>${company.iban}</td></tr>` : ''}
              ${company.bic ? `<tr><td>${t.bic}:</td><td>${company.bic}</td></tr>` : ''}
            </table>
          </div>
        ` : ''}

        <div class="footer">
          <p class="text-center">Благодарим ви за доверието! / Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
    .document { max-width: 210mm; margin: 0 auto; padding: 10mm; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
    .company-info h2 { color: #2563eb; margin-bottom: 10px; font-size: 18px; }
    .company-info p { margin-bottom: 3px; color: #666; }
    .logo { max-width: 150px; max-height: 80px; margin-bottom: 15px; }
    .document-info { text-align: right; }
    .document-info h1 { color: #2563eb; font-size: 28px; margin-bottom: 15px; }
    .document-info table { margin-left: auto; }
    .document-info table td { padding: 3px 8px; }
    .parties { display: flex; justify-content: space-between; gap: 30px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .party { flex: 1; }
    .party h3 { color: #1f2937; font-size: 14px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; }
    .party p { margin-bottom: 3px; color: #4b5563; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e5e7eb; }
    .items-table th { background: #f3f4f6; padding: 12px 8px; font-weight: 600; color: #374151; border-bottom: 2px solid #d1d5db; text-transform: uppercase; }
    .items-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
    .items-table tbody tr:nth-child(even) { background: #f9fafb; }
    .totals { margin-left: auto; width: 300px; }
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    .totals-table .total-row { background: #eff6ff; border-top: 2px solid #2563eb; }
    .totals-table .total-row td { font-size: 14px; padding: 12px; }
    .in-words { margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 6px; }
    .notes { margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; }
    .payment-info { margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 6px; }
    .payment-info table td { padding: 5px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
  `;
}