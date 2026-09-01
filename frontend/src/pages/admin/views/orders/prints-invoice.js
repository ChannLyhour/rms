/**
 * prints-invoice.js
 * High-fidelity Thermal POS Receipt Invoice Printer Engine
 * Exactly replicates the Restaurant / Supermarket receipt invoice layout
 */

/**
 * Build Full HTML Document for 80mm Thermal Receipt matching the reference image
 */
export function buildReceiptHTML(order = {}, options = {}) {
  const store = {
    name: options.storeName || 'YOUR RESTAURANT',
    motto: options.motto || 'GOOD FOOD. GREAT MEMORIES.',
    addressLine1: options.addressLine1 || 'Your Restaurant Address',
    addressLine2: options.addressLine2 || 'Phnom Penh, Cambodia 12000',
    phone: options.phone || 'Ph: +855 23 888 999',
    gstin: options.gstin || 'VAT / TIN: 29ABCDE1234F1Z5',
  }

  const orderNumber = order.order_number || `SKB/25-05/${String(order.id || '0142').padStart(4, '0')}`
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '17 Jun 2026'
  const orderTime = order.created_at
    ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '20:45'

  const orderType = order.order_type === 'takeaway'
    ? 'Takeaway'
    : order.order_type === 'qr_scan'
    ? 'QR Scan'
    : 'Dine In'

  const tableNum = order.table_session?.table?.table_number || order.table_session?.table_id || 'T-08'
  const tokenNum = `A${String(order.id ? (order.id % 99) + 1 : 42).padStart(2, '0')}`

  const items = order.items && order.items.length > 0 ? order.items : [
    { product: { name: 'Grilled Salmon' }, quantity: 1, unit_price: 149.00 },
    { product: { name: 'Caesar Salad' }, quantity: 1, unit_price: 249.00 },
    { product: { name: 'Truffle Fries' }, quantity: 2, unit_price: 49.00 },
    { product: { name: 'Sparkling Water' }, quantity: 2, unit_price: 89.00 },
  ]

  const calculatedSubTotal = items.reduce(
    (acc, it) => acc + Number(it.unit_price || it.price || 0) * (it.quantity || 1),
    0
  )
  const subTotalNum = order.subtotal ? Number(order.subtotal) : (order.total_amount ? Number(order.total_amount) : calculatedSubTotal)
  const taxRate = 0.025 // 2.5%
  const cgst = (subTotalNum * taxRate)
  const sgst = (subTotalNum * taxRate)
  const grandTotal = (order.total_amount ? Number(order.total_amount) : (subTotalNum + cgst + sgst)).toFixed(2)

  const paymentStatus = (order.payment_status === 'paid' || order.status === 'completed' || order.status === 'paid') ? 'PAID' : 'UNPAID'
  const paymentMode = order.payment_method || (paymentStatus === 'PAID' ? 'ABA KHQR / CASH' : 'CASH')
  const customerName = options.customerName || (order.customer_name || 'Dine In Guest')

  const itemsHTML = items
    .map((item, idx) => {
      const name = item.item_product_name || item.product?.name || item.name || `Item ${idx + 1}`
      const qty = item.quantity || 1
      const unit = Number(item.unit_price || item.price || 0).toFixed(2)
      const total = (Number(unit) * qty).toFixed(2)

      return `
        <div class="item-row">
          <div class="col-item">${idx + 1}. ${name}</div>
          <div class="col-qty">${qty}</div>
          <div class="col-unit">$${unit}</div>
          <div class="col-total">$${total}</div>
        </div>
      `
    })
    .join('<div class="item-divider"></div>')

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receipt - ${orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            margin: 0;
            padding: 12px;
            background: #f8fafc;
            display: flex;
            justify-content: center;
            font-family: 'Courier New', Courier, monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
            color: #000;
          }

          /* Outer Receipt Card with thin border */
          .receipt-box {
            width: 80mm;
            max-width: 80mm;
            background: #fff;
            border: 1px solid #111;
            padding: 18px 14px 22px 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }

          /* Logo */
          .logo-container {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
          }
          .logo-box {
            width: 52px;
            height: 52px;
            border: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-svg {
            width: 32px;
            height: 32px;
          }

          /* Title & Motto */
          .restaurant-name {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 2px;
            text-align: center;
            margin: 4px 0 6px 0;
            text-transform: uppercase;
          }
          .motto-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .motto-line {
            flex: 1;
            height: 1px;
            background: #000;
          }
          .motto-text {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            white-space: nowrap;
          }

          /* Address */
          .address-section {
            text-align: center;
            font-size: 11px;
            line-height: 1.35;
            margin-bottom: 8px;
          }
          .gstin-text {
            font-size: 11.5px;
            font-weight: 800;
            text-align: center;
            margin-top: 4px;
            letter-spacing: 0.5px;
          }

          /* Dashed Lines */
          .dashed-divider {
            border-top: 1px dashed #555;
            margin: 10px 0;
            width: 100%;
          }
          .item-divider {
            border-top: 1px dashed #888;
            margin: 5px 0;
            width: 100%;
          }

          /* Meta Table */
          .meta-grid {
            font-size: 11.5px;
            font-weight: 600;
            line-height: 1.45;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
          }
          .meta-label-group {
            display: flex;
            gap: 8px;
          }
          .meta-label {
            width: 95px;
          }
          .meta-colon {
            width: 10px;
          }
          .meta-val {
            text-align: right;
            font-weight: 700;
          }

          /* Item Table */
          .item-table-head {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #000;
            padding-bottom: 4px;
            margin-bottom: 6px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 11.5px;
            font-weight: 700;
            padding: 2px 0;
          }
          .col-item {
            flex: 1;
            padding-right: 4px;
            word-break: break-word;
          }
          .col-qty {
            width: 32px;
            text-align: center;
          }
          .col-unit {
            width: 62px;
            text-align: right;
          }
          .col-total {
            width: 66px;
            text-align: right;
          }

          /* Totals Section */
          .summary-section {
            font-size: 11.5px;
            font-weight: 700;
            line-height: 1.45;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin: 2.5px 0;
          }

          /* Grand Total Double Line */
          .grand-total-box {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 6px 0;
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }
          .grand-total-label {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .grand-total-val {
            font-size: 18px;
            font-weight: 900;
          }

          /* Customer & Payment */
          .customer-row {
            display: flex;
            justify-content: space-between;
            font-size: 11.5px;
            font-weight: 700;
          }
          .payment-status-row {
            display: flex;
            justify-content: space-between;
            font-size: 11.5px;
            font-weight: 700;
            margin: 2px 0;
          }

          /* Footer Greetings */
          .footer-section {
            text-align: center;
            margin-top: 10px;
          }
          .footer-main-text {
            font-size: 11.5px;
            font-weight: 900;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .star-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 6px auto;
            width: 70%;
          }
          .star-line {
            flex: 1;
            height: 1px;
            background: #000;
          }
          .thank-you-bottom {
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 2px;
            margin-top: 6px;
          }
          .visit-again-italic {
            font-size: 12px;
            font-style: italic;
            font-family: Georgia, 'Times New Roman', serif;
            margin-top: 2px;
          }

          @media print {
            body {
              background: #fff !important;
              padding: 0 !important;
            }
            .receipt-box {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <!-- ── Top Logo ── -->
          <div class="logo-container">
            <div class="logo-box">
              <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
                <path d="M6 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
                <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4" />
                <line x1="12" y1="18" x2="12" y2="22" />
              </svg>
            </div>
          </div>

          <!-- ── Restaurant Name ── -->
          <div class="restaurant-name">${store.name}</div>

          <!-- ── Motto with lines ── -->
          <div class="motto-row">
            <div class="motto-line"></div>
            <span class="motto-text">${store.motto}</span>
            <div class="motto-line"></div>
          </div>

          <!-- ── Address & Phone ── -->
          <div class="address-section">
            <div>${store.addressLine1}</div>
            <div>${store.addressLine2}</div>
            <div>${store.phone}</div>
            <div class="gstin-text">${store.gstin}</div>
          </div>

          <!-- ── Dashed Divider ── -->
          <div class="dashed-divider"></div>

          <!-- ── Bill Metadata ── -->
          <div class="meta-grid">
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Bill No.</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${orderNumber}</span>
            </div>
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Date</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${orderDate}</span>
            </div>
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Time</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${orderTime}</span>
            </div>
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Order Type</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${orderType}</span>
            </div>
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Table No.</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${tableNum}</span>
            </div>
            <div class="meta-row">
              <div class="meta-label-group">
                <span class="meta-label">Token No.</span>
                <span class="meta-colon">:</span>
              </div>
              <span class="meta-val">${tokenNum}</span>
            </div>
          </div>

          <!-- ── Dashed Divider ── -->
          <div class="dashed-divider"></div>

          <!-- ── Items Table Header ── -->
          <div class="item-table-head">
            <span class="col-item">ITEM</span>
            <span class="col-qty">QTY</span>
            <span class="col-unit">UNIT</span>
            <span class="col-total">TOTAL</span>
          </div>

          <!-- ── Items List ── -->
          <div class="items-list">
            ${itemsHTML}
          </div>

          <!-- ── Dashed Divider ── -->
          <div class="dashed-divider"></div>

          <!-- ── Subtotal & Taxes ── -->
          <div class="summary-section">
            <div class="summary-row">
              <span>SUBTOTAL</span>
              <span>$${subTotalNum.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>CGST (2.5%)</span>
              <span>$${cgst.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>SGST (2.5%)</span>
              <span>$${sgst.toFixed(2)}</span>
            </div>
          </div>

          <!-- ── Grand Total (Double Solid Line) ── -->
          <div class="grand-total-box">
            <span class="grand-total-label">GRAND TOTAL</span>
            <span class="grand-total-val">$${grandTotal}</span>
          </div>

          <!-- ── Dashed Divider ── -->
          <div class="dashed-divider"></div>

          <!-- ── Customer Name ── -->
          <div class="customer-row">
            <div class="meta-label-group">
              <span style="width: 105px;">Customer Name</span>
              <span style="width: 10px;">:</span>
            </div>
            <span>${customerName}</span>
          </div>

          <!-- ── Dashed Divider ── -->
          <div class="dashed-divider"></div>

          <!-- ── Payment Info ── -->
          <div class="payment-status-row">
            <span>Payment Status</span>
            <span>${paymentStatus}</span>
          </div>
          <div class="item-divider"></div>
          <div class="payment-status-row">
            <span>Payment Mode</span>
            <span>${paymentMode}</span>
          </div>

          <!-- ── Footer ── -->
          <div class="footer-section">
            <div class="footer-main-text">THANK YOU, VISIT AGAIN!</div>
            <div class="star-divider">
              <div class="star-line"></div>
              <span>★</span>
              <div class="star-line"></div>
            </div>
            <div class="thank-you-bottom">THANK YOU</div>
            <div class="visit-again-italic">Visit Again!</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `
}

/**
 * Trigger Native Browser Thermal Print Window for an Order
 */
export function printInvoice(order = {}, options = {}) {
  const htmlContent = buildReceiptHTML(order, options)

  const printWindow = window.open('', '_blank', 'width=380,height=700,top=50,left=120')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  } else {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(htmlContent)
    doc.close()
    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 2000)
    }, 300)
  }
}

export default printInvoice
