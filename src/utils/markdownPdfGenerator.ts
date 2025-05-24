import { jsPDF } from 'jspdf';

export interface MarkdownPDFOptions {
  title: string;
  filename?: string;
  author?: string;
  subject?: string;
}

export class MarkdownPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; bottom: number; left: number; right: number };
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margins = { top: 20, bottom: 20, left: 20, right: 20 };
    this.currentY = this.margins.top;
    this.lineHeight = 6;
  }

  private addHeader(title: string, subtitle?: string) {
    // Add gradient-like header background
    this.doc.setFillColor(37, 99, 235);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // Add accent stripe
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(0, 42, this.pageWidth, 3, 'F');
    
    // Add title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.pageWidth / 2, 20, { align: "center" });
    
    // Add subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(subtitle, this.pageWidth / 2, 32, { align: "center" });
    }
    
    // Add creation date
    const currentDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.doc.setFontSize(10);
    this.doc.text(`Generated on: ${currentDate}`, this.pageWidth / 2, 38, { align: "center" });
    
    this.currentY = 55;
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add footer background
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');
      
      // Add page numbers
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth / 2, this.pageHeight - 10, { align: "center" });
      
      // Add app branding
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(37, 99, 235);
      this.doc.text("PortfolioAI", this.pageWidth / 2, this.pageHeight - 5, { align: "center" });
    }
  }

  private checkPageBreak(requiredSpace: number = 15) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom - 20) {
      this.doc.addPage();
      this.currentY = this.margins.top;
      return true;
    }
    return false;
  }

  private parseMarkdown(content: string) {
    const lines = content.split('\n');
    const elements: Array<{
      type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'li' | 'strong' | 'em' | 'blockquote';
      content: string;
      level?: number;
    }> = [];

    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Headers
      if (trimmed.startsWith('# ')) {
        inList = false;
        elements.push({ type: 'h1', content: trimmed.substring(2) });
      } else if (trimmed.startsWith('## ')) {
        inList = false;
        elements.push({ type: 'h2', content: trimmed.substring(3) });
      } else if (trimmed.startsWith('### ')) {
        inList = false;
        elements.push({ type: 'h3', content: trimmed.substring(4) });
      }
      // Unordered list
      else if (trimmed.match(/^[-*+]\s/)) {
        if (!inList || listType !== 'ul') {
          inList = true;
          listType = 'ul';
        }
        elements.push({ type: 'li', content: trimmed.substring(2) });
      }
      // Ordered list
      else if (trimmed.match(/^\d+\.\s/)) {
        if (!inList || listType !== 'ol') {
          inList = true;
          listType = 'ol';
        }
        elements.push({ type: 'li', content: trimmed.replace(/^\d+\.\s/, '') });
      }
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        inList = false;
        elements.push({ type: 'blockquote', content: trimmed.substring(2) });
      }
      // Regular paragraph
      else {
        inList = false;
        elements.push({ type: 'p', content: trimmed });
      }
    });

    return elements;
  }

  private processInlineFormatting(text: string): Array<{ text: string; bold: boolean; italic: boolean }> {
    const parts: Array<{ text: string; bold: boolean; italic: boolean }> = [];
    
    // Handle bold and italic with proper regex
    const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|([^*]+)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        // Bold text (**text**)
        parts.push({ text: match[2], bold: true, italic: false });
      } else if (match[3]) {
        // Italic text (*text*)
        parts.push({ text: match[4], bold: false, italic: true });
      } else if (match[5]) {
        // Regular text
        parts.push({ text: match[5], bold: false, italic: false });
      }
    }
    
    return parts.length > 0 ? parts : [{ text, bold: false, italic: false }];
  }

  private addFormattedText(text: string, x: number, fontSize: number = 12, color: [number, number, number] = [60, 60, 60]) {
    const parts = this.processInlineFormatting(text);
    let currentX = x;
    
    parts.forEach((part, partIndex) => {
      if (!part.text.trim()) return;
      
      this.doc.setFontSize(fontSize);
      this.doc.setTextColor(color[0], color[1], color[2]);
      
      if (part.bold && part.italic) {
        this.doc.setFont("helvetica", "bolditalic");
      } else if (part.bold) {
        this.doc.setFont("helvetica", "bold");
      } else if (part.italic) {
        this.doc.setFont("helvetica", "italic");
      } else {
        this.doc.setFont("helvetica", "normal");
      }
      
      const maxWidth = this.pageWidth - this.margins.left - this.margins.right - (currentX - this.margins.left);
      const wrappedText = this.doc.splitTextToSize(part.text, maxWidth);
      
      wrappedText.forEach((line: string, lineIndex: number) => {
        this.checkPageBreak();
        this.doc.text(line, currentX, this.currentY);
        
        // Only move to next line if this is not the last line of the last part
        if (lineIndex < wrappedText.length - 1 || partIndex < parts.length - 1) {
          this.currentY += this.lineHeight;
        }
      });
      
      // Reset currentX for the next part
      if (partIndex < parts.length - 1) {
        currentX = this.margins.left;
      }
    });
  }

  private renderElement(element: { type: string; content: string; level?: number }) {
    this.checkPageBreak();
    
    switch (element.type) {
      case 'h1':
        this.currentY += 10;
        this.checkPageBreak(20);
        this.doc.setFillColor(37, 99, 235);
        this.doc.rect(this.margins.left, this.currentY - 8, this.pageWidth - this.margins.left - this.margins.right, 12, 'F');
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(18);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(element.content, this.margins.left + 5, this.currentY);
        this.currentY += 20;
        break;
        
      case 'h2':
        this.currentY += 8;
        this.checkPageBreak(18);
        this.doc.setTextColor(37, 99, 235);
        this.doc.setFontSize(16);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(element.content, this.margins.left, this.currentY);
        this.currentY += 5;
        // Add underline
        this.doc.setDrawColor(37, 99, 235);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
        this.currentY += 12;
        break;
        
      case 'h3':
        this.currentY += 6;
        this.checkPageBreak(15);
        this.doc.setTextColor(37, 99, 235);
        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(element.content, this.margins.left, this.currentY);
        this.currentY += 12;
        break;
        
      case 'p':
        this.checkPageBreak(10);
        this.doc.setTextColor(60, 60, 60);
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "normal");
        
        // Calculate text height for proper spacing
        const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
        const wrappedLines = this.doc.splitTextToSize(element.content, maxWidth);
        const textHeight = wrappedLines.length * this.lineHeight;
        
        this.addFormattedText(element.content, this.margins.left);
        this.currentY += Math.max(this.lineHeight, textHeight / wrappedLines.length) + 4;
        break;
        
      case 'li':
        this.checkPageBreak(8);
        // Add bullet point
        this.doc.setFillColor(59, 130, 246);
        this.doc.circle(this.margins.left + 8, this.currentY - 1, 1.5, 'F');
        
        // Calculate text height for bullet points
        const bulletMaxWidth = this.pageWidth - this.margins.left - this.margins.right - 15;
        const bulletLines = this.doc.splitTextToSize(element.content, bulletMaxWidth);
        
        // Add text
        this.doc.setTextColor(60, 60, 60);
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "normal");
        this.addFormattedText(element.content, this.margins.left + 15);
        this.currentY += Math.max(this.lineHeight, bulletLines.length * this.lineHeight) + 3;
        break;
        
      case 'blockquote':
        this.currentY += 5;
        this.checkPageBreak(20);
        
        // Calculate quote height
        const quoteMaxWidth = this.pageWidth - this.margins.left - this.margins.right - 10;
        const quoteLines = this.doc.splitTextToSize(element.content, quoteMaxWidth);
        const quoteHeight = quoteLines.length * this.lineHeight + 10;
        
        // Add quote background
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.margins.left, this.currentY - 5, this.pageWidth - this.margins.left - this.margins.right, quoteHeight, 'F');
        
        // Add quote border
        this.doc.setDrawColor(37, 99, 235);
        this.doc.setLineWidth(2);
        this.doc.line(this.margins.left, this.currentY - 5, this.margins.left, this.currentY + quoteHeight - 5);
        
        this.doc.setTextColor(60, 60, 60);
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "italic");
        this.addFormattedText(element.content, this.margins.left + 10);
        this.currentY += quoteHeight + 3;
        break;
    }
  }

  public generateFromMarkdown(markdown: string, options: MarkdownPDFOptions) {
    const elements = this.parseMarkdown(markdown);
    
    this.addHeader(options.title, options.subject);
    
    elements.forEach(element => {
      this.renderElement(element);
    });
    
    this.addFooter();
    this.doc.save(options.filename || 'document.pdf');
  }
}

// Helper function
export const generateMarkdownPDF = (markdown: string, options: MarkdownPDFOptions) => {
  const generator = new MarkdownPDFGenerator();
  generator.generateFromMarkdown(markdown, options);
};

export default MarkdownPDFGenerator; 