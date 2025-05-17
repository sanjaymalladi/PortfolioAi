
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <textarea
        className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-interview-blue/50 resize-none"
        placeholder="Type your answer here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        rows={3}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="bg-interview-blue hover:bg-interview-blue/90 text-white self-end"
      >
        <Send size={18} />
      </Button>
    </form>
  );
};

export default ChatInput;
