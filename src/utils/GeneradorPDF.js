import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Colores
const COLORS = {
  azulOscuro: [44, 62, 80],
  verde: [39, 174, 96],
  rojo: [192, 57, 43],
  zebra: [245, 245, 245],
  blanco: [255, 255, 255],
  gris: [128, 128, 128],
};

export const generarPDF = (mes, datosInforme) => {
  const doc = new jsPDF('p', 'mm', 'letter');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margenIzq = 15;
  const margenDer = 15;
  const ancho = pageWidth - margenIzq - margenDer;
  
  let yPos = 15;

  // ========== TÍTULO ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.azulOscuro);
  const titulo = `INFORME FINANCIERO - ${mes.toUpperCase()}`;
  const titleWidth = doc.getTextWidth(titulo);
  doc.text(titulo, pageWidth / 2 - titleWidth / 2, yPos);
  yPos += 10;

  // ========== TABLA DE TOTALES ==========
  yPos += 5;
  const totalRecibido = datosInforme.reduce((sum, d) => d.balance >= 0 ? sum + d.montoPagar : sum, 0);
  const totalPendiente = datosInforme.reduce((sum, d) => d.balance < 0 ? sum + d.balance : sum, 0);
  const cuotaMensual = datosInforme.length > 0 ? datosInforme[0].montoPagar : 0;

  const totales = [
    { label: 'TOTAL RECIBIDO', valor: totalRecibido, rojo: false },
    { label: 'CUOTA', valor: cuotaMensual, rojo: false },
    { label: 'A PAGAR', valor: cuotaMensual, rojo: false },
    { label: 'PENDIENTE', valor: totalPendiente, rojo: true },
  ];

  const anchoColumnaTotal = ancho / 4;
  totales.forEach((total, idx) => {
    const xTotal = margenIzq + idx * anchoColumnaTotal;
    
    // Fondo azul
    doc.setFillColor(...COLORS.azulOscuro);
    doc.rect(xTotal, yPos, anchoColumnaTotal, 15, 'F');
    
    // Texto blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(total.label, xTotal + anchoColumnaTotal / 2, yPos + 5, { align: 'center' });
    
    // Valor
    const colorValor = total.rojo && total.valor < 0 ? [255, 100, 100] : [255, 255, 255];
    doc.setTextColor(...colorValor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`DOP$ ${Math.abs(total.valor).toFixed(2)}`, xTotal + anchoColumnaTotal / 2, yPos + 10, { align: 'center' });
  });
  
  yPos += 20;

  // ========== TABLA DETALLADA ==========
  const headers = ['Apto', 'Propietario', 'Estado', 'Recibido', 'Cuota', 'Descripción', 'A Pagar', 'Balance'];
  const columnWidths = [8, 20, 15, 16, 15, 32, 16, 16];

  // Header
  doc.setFillColor(...COLORS.azulOscuro);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  
  let xHeader = margenIzq;
  headers.forEach((header, idx) => {
    doc.rect(xHeader, yPos, columnWidths[idx], 7, 'F');
    doc.text(header, xHeader + columnWidths[idx] / 2, yPos + 4.5, { align: 'center' });
    xHeader += columnWidths[idx];
  });
  
  yPos += 7;

  // Filas
  let par = false;
  datosInforme.forEach((dato) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 15;
    }

    const fondoColor = par ? COLORS.zebra : COLORS.blanco;
    doc.setFillColor(...fondoColor);
    
    // Rectángulos de fondo
    let xRectBg = margenIzq;
    columnWidths.forEach(w => {
      doc.rect(xRectBg, yPos, w, 6, 'F');
      xRectBg += w;
    });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Contenido
    let xCell = margenIzq;

    // Apto
    doc.setTextColor(0, 0, 0);
    doc.text(String(dato.numApto), xCell + columnWidths[0] / 2, yPos + 3.5, { align: 'center' });
    xCell += columnWidths[1];

    // Propietario
    doc.text(dato.nombrePropietario.substring(0, 18), xCell + columnWidths[1] / 2, yPos + 3.5, { align: 'left' });
    xCell += columnWidths[1];

    // Estado
    const estadoText = dato.balance >= 0 ? 'AL DÍA' : 'PENDIENTE';
    const estadoColor = dato.balance >= 0 ? COLORS.verde : COLORS.rojo;
    doc.setTextColor(...estadoColor);
    doc.setFont('helvetica', 'bold');
    doc.text(estadoText, xCell + columnWidths[2] / 2, yPos + 3.5, { align: 'center' });
    xCell += columnWidths[2];

    // Recibido
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`DOP$ ${dato.totalabonado?.toFixed(2) || '0.00'}`, xCell + columnWidths[3] - 2, yPos + 3.5, { align: 'right' });
    xCell += columnWidths[3];

    // Cuota
    doc.text(`DOP$ ${dato.montoPagar?.toFixed(2) || '0.00'}`, xCell + columnWidths[4] - 2, yPos + 3.5, { align: 'right' });
    xCell += columnWidths[4];

    // Descripción
    doc.text('Cuota Mensual', xCell + 1, yPos + 3.5, { align: 'left' });
    xCell += columnWidths[5];

    // A Pagar
    doc.text(`DOP$ ${dato.montoPagar?.toFixed(2) || '0.00'}`, xCell + columnWidths[6] - 2, yPos + 3.5, { align: 'right' });
    xCell += columnWidths[6];

    // Balance
    const balanceColor = dato.balance < 0 ? COLORS.rojo : [0, 0, 0];
    doc.setTextColor(...balanceColor);
    doc.text(`DOP$ ${dato.balance?.toFixed(2) || '0.00'}`, xCell + columnWidths[7] - 2, yPos + 3.5, { align: 'right' });

    yPos += 6;
    par = !par;
  });

  // ========== NOTA ==========
  yPos += 5;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NOTA:', margenIzq, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const nota = [
    'Los balances negativos indican montos pendientes por pagar.',
    '- Recordar que dentro de monto a pagar incluye el pago de la luz, agua y mantenimiento.',
    '- La mensualidad del agua son DOP$ 1082.00 / 8 = DOP$ 135.25 por apartamento.',
    '- La mensualidad del mantenimiento son DOP$ 4918.00 / 8 = DOP$ 614.75 por apartamento.',
    '- La mensualidad de la luz son DOP$ 638.00 / 8 = DOP$ 80.00 por apartamento.',
    '- Cualquier duda contactar a administración.',
  ];

  nota.forEach((linea) => {
    doc.text(linea, margenIzq, yPos, { maxWidth: ancho });
    yPos += 3;
  });

  // ========== PIE DE PÁGINA ==========
  const fecha = new Date().toLocaleDateString('es-DO') + ' ' + new Date().toLocaleTimeString('es-DO');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${fecha} | Residencial Santos I`, margenIzq, pageHeight - 10);
  doc.text(`Página 1`, pageWidth - margenDer - 20, pageHeight - 10);

  // Guardar
  doc.save(`Informe_${mes}_${new Date().getTime()}.pdf`);
};
