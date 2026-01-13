'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function CopyButton({ text, className }: { text: string, className?: string }) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
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
