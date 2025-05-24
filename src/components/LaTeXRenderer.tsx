import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, FileText, Code2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LaTeXRendererProps {
  latexCode: string;
  title?: string;
  enableDownload?: boolean;
  enableCopy?: boolean;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ 
  latexCode, 
  title = "LaTeX Document",
  enableDownload = true,
  enableCopy = true
}) => {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setCopied(true);
      toast({
        title: "LaTeX Copied",
        description: "LaTeX source code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy LaTeX code",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([latexCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}.tex`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "LaTeX File Downloaded",
        description: "LaTeX file saved successfully",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Failed to download LaTeX file",
        variant: "destructive"
      });
    }
  };

  const handleOverleafOpen = () => {
    // Create a form to submit to Overleaf
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip';
    input.value = latexCode;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    toast({
      title: "Opening in Overleaf",
      description: "LaTeX document will open in a new tab",
    });
  };

  // Extract key information from LaTeX for preview
  const extractInfo = () => {
    const nameMatch = latexCode.match(/\\LARGE\s+([^}]+)}/);
    const emailMatch = latexCode.match(/href\{mailto:([^}]+)\}/);
    const phoneMatch = latexCode.match(/(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})/);
    const locationMatch = latexCode.match(/[A-Za-z\s]+,\s*[A-Z]{2}/);
    
    const sections = latexCode.split('\\section{').slice(1).map(section => {
      const titleMatch = section.match(/^([^}]+)}/);
      return titleMatch ? titleMatch[1] : '';
    }).filter(Boolean);
    
    return {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown',
      email: emailMatch ? emailMatch[1] : '',
      phone: phoneMatch ? phoneMatch[1] : '',
      location: locationMatch ? locationMatch[0] : '',
      sections
    };
  };

  const info = extractInfo();

  return (
    <Card className="w-full shadow-lg">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <div className="flex gap-2">
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={view === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('preview')}
              className="h-8 px-3"
            >
              <FileText className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant={view === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('code')}
              className="h-8 px-3"
            >
              <Code2 className="h-4 w-4 mr-1" />
              LaTeX
            </Button>
          </div>
          
          {enableCopy && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy LaTeX
                </>
              )}
            </Button>
          )}
          
          {enableDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download .tex
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleOverleafOpen}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open in Overleaf
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        {view === 'preview' ? (
          // Fast CV Preview
          <div className="bg-white dark:bg-gray-900 p-8 max-w-4xl mx-auto">
            <div className="cv-preview space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {info.name}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-gray-600 dark:text-gray-400">
                  {info.email && <span>{info.email}</span>}
                  {info.phone && <span>{info.phone}</span>}
                  {info.location && <span>{info.location}</span>}
                </div>
              </div>
              
              {/* Sections */}
              <div className="space-y-6">
                {info.sections.map((section, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {section}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-400">
                      Content from your {section.toLowerCase()} section will appear here when compiled
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📄 Ready to Generate PDF?
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                  Your LaTeX CV is ready! Use one of these options to generate a professional PDF:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleOverleafOpen}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Compile in Overleaf (Recommended)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download .tex File
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // LaTeX Code View
          <div className="bg-gray-50 dark:bg-gray-900">
            <div className="p-4 border-b bg-gray-100 dark:bg-gray-800">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                LaTeX Source Code
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy this code to any LaTeX editor or compiler
              </p>
            </div>
            <div className="p-6 overflow-auto max-h-[600px]">
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {latexCode}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaTeXRenderer; 