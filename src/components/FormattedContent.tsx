import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedContentProps {
  content: string;
  className?: string;
  showBullets?: boolean;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ 
  content, 
  className = "", 
  showBullets = true 
}) => {
  if (!content) return null;

  // Clean up any stray asterisks and formatting issues
  const cleanContent = (text: string): string => {
    return text
      // Remove standalone asterisks that aren't part of formatting
      .replace(/(?<!\*)\*(?!\*|\w)/g, '•')
      // Fix unmatched bold markers
      .replace(/\*\*([^*]*)\*(?!\*)/g, '**$1**')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Function to process bold text markers (**text**) with better edge case handling
  const processBoldText = (text: string): (string | JSX.Element)[] => {
    const cleanedText = cleanContent(text);
    if (!cleanedText.includes('**')) return [cleanedText];
    
    // Use a more robust regex that handles edge cases
    const boldRegex = /\*\*([^*]+?)\*\*/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(cleanedText)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        const beforeText = cleanedText.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }
      
      // Add bold text
      const boldText = match[1].trim();
      if (boldText) {
        parts.push(
          <strong 
            key={`bold-${match.index}`}
            className="font-semibold text-foreground bg-primary/10 px-1 py-0.5 rounded"
          >
            {boldText}
          </strong>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < cleanedText.length) {
      const remainingText = cleanedText.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }
    
    return parts.length > 0 ? parts : [cleanedText];
  };

  // Process italic text (*text*) with improved logic
  const processItalicText = (parts: (string | JSX.Element)[]): (string | JSX.Element)[] => {
    return parts.flatMap((part, partIndex) => {
      if (typeof part !== 'string') return [part];
      
      // Skip if this part contains bold markers or is empty
      if (!part.includes('*') || part.includes('**') || !part.trim()) {
        return [part];
      }
      
      // Use a more precise regex for single asterisks
      const italicRegex = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g;
      const italicParts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = italicRegex.exec(part)) !== null) {
        // Add text before italic
        if (match.index > lastIndex) {
          const beforeText = part.substring(lastIndex, match.index);
          if (beforeText) {
            italicParts.push(beforeText);
          }
        }
        
        // Add italic text
        const italicText = match[1].trim();
        if (italicText) {
          italicParts.push(
            <em 
              key={`${partIndex}-italic-${match.index}`}
              className="italic text-muted-foreground"
            >
              {italicText}
            </em>
          );
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < part.length) {
        const remainingText = part.substring(lastIndex);
        if (remainingText) {
          italicParts.push(remainingText);
        }
      }
      
      return italicParts.length > 0 ? italicParts : [part];
    });
  };

  // Process complete text formatting
  const processTextFormatting = (text: string) => {
    let parts = processBoldText(text);
    parts = processItalicText(parts);
    return parts;
  };

  // Format content into structured elements
  const formatContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const elements: JSX.Element[] = [];
    let currentSection: JSX.Element[] = [];
    let currentSectionTitle = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle numbered section headers (1. Title:, 2. Title:, etc.)
      const sectionMatch = trimmedLine.match(/^(\d+\.\s*)(.*?):?\s*$/);
      if (sectionMatch) {
        // Save previous section if exists
        if (currentSection.length > 0) {
          elements.push(
            <div key={`section-${elements.length}`} className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 py-1">
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-bold">
                  {currentSectionTitle.match(/^\d+/)?.[0] || '•'}
                </span>
                {currentSectionTitle.replace(/^\d+\.\s*/, '')}
              </h3>
              <div className="pl-4 space-y-2">
                {currentSection}
              </div>
            </div>
          );
        }
        
        // Start new section
        currentSectionTitle = sectionMatch[2];
        currentSection = [];
        return;
      }

      // Handle bullet points (*, -, •) with better detection
      const bulletMatch = trimmedLine.match(/^[\*\-•]\s+(.+)$/);
      if (bulletMatch && showBullets) {
        const bulletContent = bulletMatch[1];
        const formattedContent = processTextFormatting(bulletContent);
        
        currentSection.push(
          <div key={`bullet-${index}`} className="flex items-start gap-3 my-2">
            <div className="min-w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 mt-2 flex-shrink-0"></div>
            <p className="text-muted-foreground leading-relaxed">
              {formattedContent}
            </p>
          </div>
        );
        return;
      }

      // Handle sub-bullets (indented bullets) with better detection
      const subBulletMatch = trimmedLine.match(/^\s{2,}[\*\-•]\s+(.+)$/);
      if (subBulletMatch && showBullets) {
        const subBulletContent = subBulletMatch[1];
        const formattedContent = processTextFormatting(subBulletContent);
        
        currentSection.push(
          <div key={`sub-bullet-${index}`} className="flex items-start gap-3 my-1 ml-6">
            <div className="min-w-1.5 h-1.5 rounded-full bg-primary/60 mt-2.5 flex-shrink-0"></div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {formattedContent}
            </p>
          </div>
        );
        return;
      }

      // Handle regular paragraphs
      if (trimmedLine) {
        const formattedContent = processTextFormatting(trimmedLine);
        currentSection.push(
          <p key={`para-${index}`} className="text-muted-foreground leading-relaxed mb-2">
            {formattedContent}
          </p>
        );
      }
    });

    // Add final section
    if (currentSection.length > 0) {
      if (currentSectionTitle) {
        elements.push(
          <div key={`section-${elements.length}`} className="mb-6">
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 py-1">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-bold">
                {currentSectionTitle.match(/^\d+/)?.[0] || '•'}
              </span>
              {currentSectionTitle.replace(/^\d+\.\s*/, '')}
            </h3>
            <div className="pl-4 space-y-2">
              {currentSection}
            </div>
          </div>
        );
      } else {
        elements.push(...currentSection);
      }
    }

    return elements.length > 0 ? elements : [
      <div key="simple" className="space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="text-muted-foreground leading-relaxed">
            {processTextFormatting(line)}
          </p>
        ))}
      </div>
    ];
  };

  return (
    <div className={cn("formatted-content", className)}>
      <div className="prose dark:prose-invert max-w-none">
        {formatContent(content)}
      </div>
    </div>
  );
};

export default FormattedContent; 