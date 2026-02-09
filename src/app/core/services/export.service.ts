import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportCustomerPDF(customer: Customer, options?: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const appName = options?.appName || 'LegaSync Flow';
    
    const logoUrl = '/Loguito9.png'; 
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      doc.setFillColor(26, 31, 46); 
      doc.rect(0, 0, pageWidth, 55, 'F'); 
      
      const logoWidth = 55; 
      const logoHeight = 19;
      const centerX = (pageWidth / 2) - (logoWidth / 2);
      doc.addImage(img, 'PNG', centerX, 8, logoWidth, logoHeight); 

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5); 
      const subTitle = 'REPORTES DE INTELIGENCIA DE CLIENTE';
      const subTitleX = (pageWidth / 2) - (doc.getTextWidth(subTitle) / 2);
      doc.text(subTitle, subTitleX, 35); 
      
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      const dateText = `Generado el: ${new Date().toLocaleString()}`;
      const dateX = (pageWidth / 2) - (doc.getTextWidth(dateText) / 2);
      doc.text(dateText, dateX, 42);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.text('Detalles de la Cuenta', 15, 70); 
      
      const infoData = [
        ['Nombre:', customer.name, 'Empresa:', customer.company],
        ['Email:', customer.email, 'Teléfono:', customer.phone || 'N/A'],
        ['Estado:', customer.status.toUpperCase(), 'Prioridad:', customer.priority?.toUpperCase() || 'N/A'],
        ['Creado el:', new Date(customer.created_at!).toLocaleDateString(), 'Valor Proyecto:', `$${customer.deal_value || 0}`]
      ];

      autoTable(doc, {
        startY: 75,
        body: infoData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2, textColor: [60, 60, 60] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          2: { fontStyle: 'bold', cellWidth: 30 }
        }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 15;

      if (options?.financials) {
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text('Balance del Proyecto', 15, currentY);

        const fin = options.financials;
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Concepto', 'Monto (USD)']],
          body: [
            ['Ingreso Estimado (Deal Value)', `$${fin.totalValue.toLocaleString()}`],
            ['Total Gastos Operativos', `-$${fin.totalExpenses.toLocaleString()}`],
            [
              { content: 'MARGEN NETO', styles: { fontStyle: 'bold' } }, 
              { 
                content: `$${fin.netBalance.toLocaleString()}`, 
                styles: { 
                  fontStyle: 'bold', 
                  textColor: fin.netBalance >= 0 ? [34, 197, 94] : [239, 68, 68] 
                } 
              }
            ]
          ],
          theme: 'striped',
          headStyles: { fillColor: [26, 31, 46], fontSize: 9 },
          styles: { fontSize: 9 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if (options?.expenses && options.expenses.length > 0) {
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text('Desglose de Gastos', 15, currentY);
        
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Descripción', 'Fecha', 'Monto']],
          body: options.expenses.map((ex: any) => [
            ex.description,
            new Date(ex.date).toLocaleDateString(),
            `-$${ex.amount.toFixed(2)}`
          ]),
          headStyles: { fillColor: [71, 85, 105] },
          styles: { fontSize: 8 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if (options?.subscriptions && options.subscriptions.length > 0) {
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text('Abonos Recurrentes', 15, currentY);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Servicio', 'Ciclo', 'Próximo Cobro', 'Monto']],
          body: options.subscriptions.map((sub: any) => [
            sub.service_name,
            sub.interval === 'monthly' ? 'Mensual' : 'Anual',
            new Date(sub.next_billing_date).toLocaleDateString(),
            `$${sub.amount.toFixed(2)}`
          ]),
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 8 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text('Notas de Seguimiento', 15, currentY);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(customer.notes || 'Sin notas registradas.', pageWidth - 30);
      doc.text(splitNotes, 15, currentY + 8);

      currentY += (splitNotes.length * 7) + 15;

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(13);
      doc.text('Historial de Actividad', 15, currentY);

      const historyRows = (customer.activity_log || []).map(log => [
        new Date(log.date).toLocaleString(),
        log.action
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Fecha y Hora', 'Acción Realizada']],
        body: historyRows.length > 0 ? historyRows : [['-', 'No hay actividad registrada aún']],
        headStyles: { fillColor: [59, 130, 246], fontSize: 9, halign: 'center' }, 
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`${appName} - LegaSync Engine v2`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      const fileName = `Informe_${customer.name.replace(/\s+/g, '_')}_${customer.company.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    };

    img.onerror = () => {
      console.error("Error crítico: No se pudo cargar el logo corporativo.");
    };
  }
}