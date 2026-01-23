'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function CopyButton({ text, className }: { text: string, className?: string }) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const onCopy = async () => {
    if (!mounted || !navigator?.clipboard) {
      // Fallback for older browsers or SSR
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setHasCopied(true);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCopy}
      className={cn('h-7 w-7', className)}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
