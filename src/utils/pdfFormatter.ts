import { jsPDF } from 'jspdf';

export interface PDFSection {
  title: string;
  content: string;
  number?: number;
}

export class PDFFormatter {
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
    this.doc.setFillColor(37, 99, 235); // Primary blue
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

  private addSectionHeader(title: string, number?: number) {
    this.checkPageBreak(20);
    
    // Add section number badge
    if (number) {
      this.doc.setFillColor(59, 130, 246);
      this.doc.circle(this.margins.left + 8, this.currentY + 2, 6, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(number.toString(), this.margins.left + 8, this.currentY + 5, { align: "center" });
    }
    
    // Add section title
    this.doc.setTextColor(37, 99, 235);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    const titleX = number ? this.margins.left + 18 : this.margins.left;
    this.doc.text(title, titleX, this.currentY + 5);
    this.currentY += 10;
    
    // Add divider line
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
    this.currentY += 8;
  }

  private formatText(text: string): { text: string; isBold: boolean }[] {
    const parts: { text: string; isBold: boolean }[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), isBold: false });
      }
      // Add bold text
      parts.push({ text: match[1], isBold: true });
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isBold: false });
    }
    
    return parts.length > 0 ? parts : [{ text, isBold: false }];
  }

  private addFormattedText(text: string, x: number, isBullet: boolean = false) {
    const parts = this.formatText(text);
    let currentX = x;
    
    parts.forEach(part => {
      if (part.text.trim() === '') return;
      
      this.doc.setFont("helvetica", part.isBold ? "bold" : "normal");
      this.doc.setTextColor(part.isBold ? 37 : 60, part.isBold ? 99 : 60, part.isBold ? 235 : 60);
      
      const textWidth = isBullet ? 170 : 170;
      const wrappedText = this.doc.splitTextToSize(part.text, textWidth);
      
      wrappedText.forEach((line: string, index: number) => {
        this.checkPageBreak();
        this.doc.text(line, currentX, this.currentY);
        if (index < wrappedText.length - 1) {
          this.currentY += this.lineHeight;
        }
      });
      
      // Estimate width for next part (simplified)
      currentX += this.doc.getTextWidth(part.text);
    });
  }

  private addBulletPoint(text: string, isSubBullet: boolean = false) {
    this.checkPageBreak();
    
    const bulletX = this.margins.left + (isSubBullet ? 20 : 10);
    const textX = bulletX + 8;
    
    // Add bullet
    this.doc.setFillColor(isSubBullet ? 100 : 59, isSubBullet ? 100 : 130, isSubBullet ? 100 : 246);
    const bulletSize = isSubBullet ? 1 : 1.5;
    this.doc.circle(bulletX, this.currentY - 1, bulletSize, 'F');
    
    // Add text
    this.doc.setFontSize(isSubBullet ? 11 : 12);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(60, 60, 60);
    
    this.addFormattedText(text, textX, true);
    this.currentY += this.lineHeight + 1;
  }

  private addParagraph(text: string) {
    this.checkPageBreak();
    
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(60, 60, 60);
    
    this.addFormattedText(text, this.margins.left);
    this.currentY += this.lineHeight + 2;
  }

  private parseSectionContent(content: string) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Handle bullet points
      const bulletMatch = trimmedLine.match(/^[\*\-•]\s*(.+)$/);
      if (bulletMatch) {
        this.addBulletPoint(bulletMatch[1]);
        return;
      }
      
      // Handle sub-bullets (indented)
      const subBulletMatch = trimmedLine.match(/^\s+[\*\-•]\s*(.+)$/);
      if (subBulletMatch) {
        this.addBulletPoint(subBulletMatch[1], true);
        return;
      }
      
      // Handle regular paragraphs
      if (trimmedLine) {
        this.addParagraph(trimmedLine);
      }
    });
    
    this.currentY += 5; // Add space after section
  }

  public generatePDF(title: string, content: string, filename: string = 'document.pdf') {
    // Parse content into sections
    const sections = this.parseContentIntoSections(content);
    
    this.addHeader(title);
    
    sections.forEach((section, index) => {
      this.addSectionHeader(section.title, section.number || index + 1);
      this.parseSectionContent(section.content);
    });
    
    this.addFooter();
    this.doc.save(filename);
  }

  private parseContentIntoSections(content: string): PDFSection[] {
    const sections: PDFSection[] = [];
    
    // Split content by numbered sections
    const sectionRegex = /(\d+\.\s+[^:]+):([\s\S]*?)(?=\d+\.\s+[^:]+:|$)/g;
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const title = match[1].trim().replace(/^\d+\.\s*/, '');
      const sectionContent = match[2].trim();
      const number = parseInt(match[1].match(/^\d+/)?.[0] || '0');
      
      sections.push({
        title,
        content: sectionContent,
        number
      });
    }
    
    // If no sections found, create a single section
    if (sections.length === 0) {
      sections.push({
        title: 'Content',
        content: content
      });
    }
    
    return sections;
  }
}

// Helper function for easy use
export const generateFormattedPDF = (title: string, content: string, filename: string = 'document.pdf') => {
  const formatter = new PDFFormatter();
  formatter.generatePDF(title, content, filename);
};

export default PDFFormatter; 