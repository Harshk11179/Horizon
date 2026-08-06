import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 210;
const MARGIN = 14;
const COL_WIDTH = (PAGE_WIDTH - MARGIN * 2 - 10) / 2;
const COL_B_X = MARGIN + COL_WIDTH + 10;

const INK = { r: 24, g: 32, b: 44 };
const MUTED = { r: 110, g: 122, b: 138 };
const SIDE_A = { r: 0, g: 122, b: 153 };
const SIDE_B = { r: 100, g: 60, b: 180 };

const STATUS_COLORS = {
  good:     { r: 14,  g: 138, b: 94  },
  low:      { r: 14,  g: 138, b: 94  },
  moderate: { r: 176, g: 121, b: 26  },
  high:     { r: 197, g: 48,  b: 72  },
};

const COMPARE_INDICATORS = [
  { key: 'airQuality',  label: 'Air Quality',  lowerIsBetter: true  },
  { key: 'waterStress', label: 'Water Stress', lowerIsBetter: true  },
  { key: 'greenCover',  label: 'Green Cover',  lowerIsBetter: false },
  { key: 'climateRisk', label: 'Climate Risk', lowerIsBetter: true  },
  { key: 'biodiversity',label: 'Biodiversity', lowerIsBetter: false },
];

function statusColor(status) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.moderate;
}

/**
 * generateComparisonPdf
 *
 * Produces a print-friendly A4 side-by-side comparison of two locations.
 * Layout: header band → score summary row → per-indicator rows with
 * value, bar, status chip, and a ▲ BETTER marker on the winning cell.
 */
export function generateComparisonPdf({ locationA, locationB }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // --- Header ---
  doc.setFillColor(10, 15, 28);
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('HORIZON', MARGIN, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 200, 215);
  doc.text('Location Comparison Report', MARGIN, 20);
  doc.setTextColor(140, 160, 180);
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    PAGE_WIDTH - MARGIN,
    20,
    { align: 'right' }
  );

  let y = 40;

  // --- Column headers ---
  // Side A
  doc.setFillColor(SIDE_A.r, SIDE_A.g, SIDE_A.b);
  doc.roundedRect(MARGIN, y - 6, COL_WIDTH, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(locationA.name, MARGIN + COL_WIDTH / 2, y + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 240);
  doc.text(locationA.capital, MARGIN + COL_WIDTH / 2, y + 7, { align: 'center' });

  // Side B
  doc.setFillColor(SIDE_B.r, SIDE_B.g, SIDE_B.b);
  doc.roundedRect(COL_B_X, y - 6, COL_WIDTH, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(locationB.name, COL_B_X + COL_WIDTH / 2, y + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(210, 200, 240);
  doc.text(locationB.capital, COL_B_X + COL_WIDTH / 2, y + 7, { align: 'center' });

  y += 18;

  // --- Overall score row ---
  doc.setDrawColor(230, 235, 240);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text('ENVIRONMENTAL SCORE', MARGIN, y);
  doc.text('ENVIRONMENTAL SCORE', COL_B_X, y);
  y += 5;

  const scoreAColor = locationA.environmentalScore >= 80 ? { r:14,g:138,b:94 } : locationA.environmentalScore >= 65 ? { r:0,g:122,b:153 } : { r:197,g:48,b:72 };
  const scoreBColor = locationB.environmentalScore >= 80 ? { r:14,g:138,b:94 } : locationB.environmentalScore >= 65 ? { r:0,g:122,b:153 } : { r:197,g:48,b:72 };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(scoreAColor.r, scoreAColor.g, scoreAColor.b);
  doc.text(String(locationA.environmentalScore), MARGIN, y + 8);
  doc.setTextColor(scoreBColor.r, scoreBColor.g, scoreBColor.b);
  doc.text(String(locationB.environmentalScore), COL_B_X, y + 8);

  // Monthly change
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const chA = locationA.scoreChangeMonthly;
  const chB = locationB.scoreChangeMonthly;
  doc.setTextColor(chA >= 0 ? 14 : 197, chA >= 0 ? 138 : 48, chA >= 0 ? 94 : 72);
  doc.text(`${chA >= 0 ? '▲' : '▼'} ${Math.abs(chA)} this month`, MARGIN + 18, y + 10);
  doc.setTextColor(chB >= 0 ? 14 : 197, chB >= 0 ? 138 : 48, chB >= 0 ? 94 : 72);
  doc.text(`${chB >= 0 ? '▲' : '▼'} ${Math.abs(chB)} this month`, COL_B_X + 18, y + 10);

  y += 20;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // --- Per-indicator rows ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text('INDICATOR', MARGIN, y);
  doc.text('SIDE A', MARGIN + COL_WIDTH * 0.55, y);
  doc.text('SIDE B', COL_B_X + COL_WIDTH * 0.55, y);
  y += 6;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 7;

  const BAR_MAX_W = COL_WIDTH * 0.35;

  COMPARE_INDICATORS.forEach((field) => {
    const dA = locationA.indicators[field.key];
    const dB = locationB.indicators[field.key];
    if (!dA || !dB) return;

    const aWins = field.lowerIsBetter ? dA.value < dB.value : dA.value > dB.value;
    const bWins = field.lowerIsBetter ? dB.value < dA.value : dB.value > dA.value;

    // Row label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(field.label, MARGIN, y);

    // Side A value + bar + status
    const scA = statusColor(dA.status);
    doc.setFillColor(238, 241, 245);
    doc.roundedRect(MARGIN + COL_WIDTH * 0.45, y - 3, BAR_MAX_W, 3, 1, 1, 'F');
    doc.setFillColor(scA.r, scA.g, scA.b);
    doc.roundedRect(MARGIN + COL_WIDTH * 0.45, y - 3, Math.max(3, (dA.value / 100) * BAR_MAX_W), 3, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(`${dA.value}${dA.unit ? ` ${dA.unit}` : ''}`, MARGIN + COL_WIDTH * 0.45 + BAR_MAX_W + 2, y);

    if (aWins) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(14, 138, 94);
      doc.text('▲ BETTER', MARGIN, y + 4.5);
      doc.setFont('helvetica', 'normal');
    }

    // Side B value + bar + status
    const scB = statusColor(dB.status);
    doc.setFillColor(238, 241, 245);
    doc.roundedRect(COL_B_X + COL_WIDTH * 0.45, y - 3, BAR_MAX_W, 3, 1, 1, 'F');
    doc.setFillColor(scB.r, scB.g, scB.b);
    doc.roundedRect(COL_B_X + COL_WIDTH * 0.45, y - 3, Math.max(3, (dB.value / 100) * BAR_MAX_W), 3, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(`${dB.value}${dB.unit ? ` ${dB.unit}` : ''}`, COL_B_X + COL_WIDTH * 0.45 + BAR_MAX_W + 2, y);

    if (bWins) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(14, 138, 94);
      doc.text('▲ BETTER', COL_B_X, y + 4.5);
      doc.setFont('helvetica', 'normal');
    }

    y += 14;
    doc.setDrawColor(238, 241, 245);
    doc.line(MARGIN, y - 5, PAGE_WIDTH - MARGIN, y - 5);
  });

  // --- Footer ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text('Generated by Horizon — AI-powered environmental intelligence', MARGIN, 287);

  const nameA = locationA.name.replace(/[^a-z0-9]/gi, '-');
  const nameB = locationB.name.replace(/[^a-z0-9]/gi, '-');
  doc.save(`Horizon_Comparison_${nameA}_vs_${nameB}.pdf`);
}
