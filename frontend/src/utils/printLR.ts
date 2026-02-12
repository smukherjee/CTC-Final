import Handlebars from 'handlebars';
import { format } from 'date-fns';
import type { LR } from '@/types';

// Import the template (will be bundled by Vite)
import lrTemplateSource from '@/templates/lr-template.hbs?raw';

// Compile the template
const lrTemplate = Handlebars.compile(lrTemplateSource);

export function printLR(lrData: Partial<LR>) {
    // Prepare data for template
    const templateData = {
        ...lrData,
        // Format date for display
        date: lrData.date ? format(new Date(lrData.date), 'dd/MM/yyyy') : '',
        // Calculate value_rs if not already set
        value_rs: lrData.value_rs || lrData.goods_items?.reduce((sum, item) =>
            sum + item.freight_rs + (item.freight_p / 100), 0).toFixed(2) || '0.00',
        // Ensure totals are formatted
        surcharge: lrData.surcharge || 0,
        hamali_charges: lrData.hamali_charges || 0,
        st_charges: lrData.st_charges || 0,
        total: lrData.total || 0,
        // Add generated timestamp
        generated_at: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
    };

    // Generate HTML
    const html = lrTemplate(templateData);

    // Open print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print the LR');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
    };
}

export function downloadLRPDF(lrData: Partial<LR>) {
    // For future implementation with PDF generation
    // This would use libraries like jsPDF or pdfmake
    console.log('PDF download feature - coming soon!', lrData);
    alert('PDF download feature coming soon! Use Print to save as PDF from your browser.');
}
