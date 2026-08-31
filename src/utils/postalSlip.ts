import jsPDF from 'jspdf';

export interface PostalSlipData {
  orderNumber: string;
  deliveryAddress: {
    fullName: string;
    houseOrFlat: string;
    street: string;
    area?: string;
    city: string;
    state: string;
    pinCode: string;
    mobile: string;
  };
}

export function downloadPostalSlipPDF(data: PostalSlipData) {
  const { orderNumber, deliveryAddress: addr } = data;

  try {
    // 19cm x 9.5cm in mm is 190mm x 95mm (Landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [190, 95],
    });

    // White background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 190, 95, 'F');

    // Outer border box (1.5mm padding)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.6);
    pdf.rect(5, 5, 180, 85);

    // Font: Courier (Monospace)
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    // Header
    pdf.text('BY INDIA POST PARCEL(CONTRACTUAL)', 9, 12);
    pdf.text('CONTRACT NO.41120154-TENALI EXAMS PUBLISHERS', 9, 17);
    pdf.text(`CUSTOMER ID:${orderNumber}`, 9, 22);

    // Header Divider
    pdf.setLineWidth(0.3);
    pdf.line(9, 25, 181, 25);

    // "To" Section (Indented)
    pdf.setFontSize(13);
    pdf.text('To', 35, 32);

    pdf.setFontSize(11);
    pdf.text(addr.fullName || '', 35, 38);

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(10);
    let y = 43;

    const addressLine1 = `${addr.houseOrFlat || ''}, ${addr.street || ''}`;
    pdf.text(addressLine1, 35, y);
    y += 5;

    if (addr.area) {
      pdf.text(addr.area, 35, y);
      y += 5;
    }

    const cityStateZip = `${addr.city || ''}, ${addr.state || ''} - ${addr.pinCode || ''}`;
    pdf.text(cityStateZip, 35, y);
    y += 6;

    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10.5);
    pdf.text(`CELL: ${addr.mobile || ''}`, 35, y);

    // Footer Divider
    pdf.setLineWidth(0.3);
    pdf.line(9, 69, 181, 69);

    // "From" Section
    pdf.setFontSize(9);
    pdf.text('From:', 9, 73);
    pdf.text('TENALI EXAMS PUBLISHERS', 9, 77);
    pdf.text('D.NO.19-308', 9, 81);
    pdf.text('NAMBURU-522508, GUNTUR-DIST | CELL: 7396977544', 9, 85);

    pdf.save(`Postal_Slip_${orderNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export function printPostalSlipWindow(data: PostalSlipData) {
  const { orderNumber, deliveryAddress: addr } = data;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Postal Slip - ${orderNumber}</title>
        <style>
          @page {
            size: 190mm 95mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            width: 190mm;
            height: 95mm;
            padding: 6mm 8mm;
            background: #ffffff;
            color: #000000;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
          }
          .label-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1.5px solid #000000;
            padding: 5mm 7mm;
          }
          .header {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.4;
            letter-spacing: -0.2px;
          }
          .to-section {
            padding-left: 20mm;
            font-size: 12px;
            line-height: 1.5;
          }
          .to-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .to-name {
            font-weight: bold;
            font-size: 13px;
          }
          .from-section {
            font-size: 10.5px;
            font-weight: bold;
            line-height: 1.35;
          }
          @media print {
            body {
              width: 190mm;
              height: 95mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            BY INDIA POST PARCEL(CONTRACTUAL)<br/>
            CONTRACT NO.41120154-TENALI EXAMS PUBLISHERS<br/>
            CUSTOMER ID:${orderNumber}
          </div>

          <div class="to-section">
            <div class="to-title">To</div>
            <div class="to-name">${addr.fullName}</div>
            <div>${addr.houseOrFlat}, ${addr.street}</div>
            ${addr.area ? `<div>${addr.area}</div>` : ''}
            <div>${addr.city}, ${addr.state} - ${addr.pinCode}</div>
            <div style="margin-top: 4px; font-weight: bold;">CELL: ${addr.mobile}</div>
          </div>

          <div class="from-section">
            From:<br/>
            TENALI EXAMS PUBLISHERS<br/>
            D.NO.19-308<br/>
            NAMBURU-522508<br/>
            GUNTUR-DIST<br/>
            CELL 7396977544
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
