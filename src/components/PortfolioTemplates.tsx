
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  previewImg: string;
}

interface PortfolioTemplatesProps {
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
}

const templates: TemplateOption[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, simple design with focus on content',
    previewImg: 'https://placehold.co/300x200/e2e8f0/64748b?text=Minimalist'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and eye-catching for creative professionals',
    previewImg: 'https://placehold.co/300x200/f1f5f9/334155?text=Creative'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal and structured for corporate environments',
    previewImg: 'https://placehold.co/300x200/e5e7eb/4b5563?text=Professional'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with elegant animations',
    previewImg: 'https://placehold.co/300x200/f3f4f6/6b7280?text=Modern'
  }
];

const PortfolioTemplates: React.FC<PortfolioTemplatesProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose a template for your portfolio</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all overflow-hidden hover:border-primary/50 relative ${
              selectedTemplate === template.id ? 'border-2 border-primary' : 'border'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={template.previewImg} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfolioTemplates;
