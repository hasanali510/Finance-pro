import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, subDays, subMonths, subYears, isAfter, parseISO } from 'date-fns';
import { Transaction, Category, UserSettings } from '../types';

export type ReportPeriod = 'weekly' | 'monthly' | 'yearly' | 'total';

interface GenerateReportParams {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  period: ReportPeriod;
  chartElementId?: string;
}

export const generatePDFReport = async ({
  transactions,
  categories,
  settings,
  period,
  chartElementId
}: GenerateReportParams) => {
  // 1. Filter transactions based on period
  const now = new Date();
  let startDate = new Date(0); // default to beginning of time for 'total'
  let periodLabel = 'All Time';

  if (period === 'weekly') {
    startDate = subDays(now, 7);
    periodLabel = `Last 7 Days (${format(startDate, 'MMM dd, yyyy')} - ${format(now, 'MMM dd, yyyy')})`;
  } else if (period === 'monthly') {
    startDate = subMonths(now, 1);
    periodLabel = `Last 30 Days (${format(startDate, 'MMM dd, yyyy')} - ${format(now, 'MMM dd, yyyy')})`;
  } else if (period === 'yearly') {
    startDate = subYears(now, 1);
    periodLabel = `Last 12 Months (${format(startDate, 'MMM dd, yyyy')} - ${format(now, 'MMM dd, yyyy')})`;
  }

  const filteredTransactions = transactions.filter(t => isAfter(parseISO(t.date), startDate));
  
  // Calculate summaries
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Format currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(settings.language === 'bn' ? 'bn-BD' : 'en-US', { 
      style: 'currency', 
      currency: settings.currency || 'USD' 
    }).format(val);

  // 2. Initialize PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 3. Add Header & Company Info
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text('Smart Income', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Financial Analytics Report', 14, 28);
  doc.text(`Generated on: ${format(now, 'MMM dd, yyyy hh:mm a')}`, 14, 34);
  doc.text(`Period: ${periodLabel}`, 14, 40);

  // 4. Add Summary Cards
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, 48, 55, 25, 3, 3, 'FD');
  doc.roundedRect(75, 48, 55, 25, 3, 3, 'FD');
  doc.roundedRect(136, 48, 55, 25, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Income', 20, 56);
  doc.text('Total Expense', 81, 56);
  doc.text('Net Balance', 142, 56);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(formatCurrency(totalIncome), 20, 66);
  
  doc.setTextColor(244, 63, 94); // Rose
  doc.text(formatCurrency(totalExpense), 81, 66);
  
  doc.setTextColor(netBalance >= 0 ? 16 : 244, netBalance >= 0 ? 185 : 63, netBalance >= 0 ? 129 : 94);
  doc.text(formatCurrency(netBalance), 142, 66);

  let currentY = 85;

  // 5. Add Chart Image (if element ID provided)
  if (chartElementId) {
    const chartElement = document.getElementById(chartElementId);
    if (chartElement) {
      try {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text('Expense by Category', 14, currentY);
        currentY += 5;

        const isDarkMode = document.documentElement.classList.contains('dark');
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: isDarkMode ? '#1E293B' : '#ffffff', // Slate 800 or White
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        // Calculate dimensions to fit width while maintaining aspect ratio
        const imgWidth = 120;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Center the image
        const xPos = (pageWidth - imgWidth) / 2;
        
        doc.addImage(imgData, 'PNG', xPos, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      } catch (err) {
        console.error('Failed to capture chart:', err);
      }
    }
  }

  // Check if we need a new page for the table
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  // 6. Add Transactions Table
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Transaction Details', 14, currentY);
  currentY += 5;

  const tableData = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        format(parseISO(t.date), 'MMM dd, yyyy'),
        t.type === 'income' ? 'Income' : 'Expense',
        category?.name || 'Unknown',
        t.note || '-',
        formatCurrency(t.amount)
      ];
    });

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Type', 'Category', 'Note', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        // Color amount based on type
        const type = data.row.raw[1];
        if (type === 'Income') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else {
          data.cell.styles.textColor = [244, 63, 94]; // Rose
        }
      }
    }
  });

  // 7. Save PDF
  doc.save(`Smart_Income_Report_${format(now, 'yyyy-MM-dd')}.pdf`);
};
