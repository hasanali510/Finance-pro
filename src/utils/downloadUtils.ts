import jsPDF from 'jspdf';

// PDF
export function downloadPDF(doc: jsPDF, filename: string) {
  const base64 = doc.output('datauristring').split(',')[1];
  // @ts-ignore
  if (window.Android && window.Android.downloadFile) {
    // @ts-ignore
    window.Android.downloadFile(base64, filename, 'application/pdf');
  } else {
    doc.save(filename);
  }
}

// CSV
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const reader = new FileReader();
  reader.onload = function () {
    const base64 = (reader.result as string).split(',')[1];
    // @ts-ignore
    if (window.Android && window.Android.downloadFile) {
      // @ts-ignore
      window.Android.downloadFile(base64, filename, 'text/csv');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  reader.readAsDataURL(blob);
}

// Image
export function downloadImage(url: string, filename: string) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function () {
        const base64 = (reader.result as string).split(',')[1];
        // @ts-ignore
        if (window.Android && window.Android.downloadFile) {
          // @ts-ignore
          window.Android.downloadFile(base64, filename, blob.type);
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      reader.readAsDataURL(blob);
    });
}
