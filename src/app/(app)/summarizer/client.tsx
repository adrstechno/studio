'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { summarizeMeeting } from '@/ai/flows/meeting-summarization';
import { mockAudioDataUri } from '@/lib/mock-audio';
import { FileUp, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/copy-button';

export function SummarizerClient() {
  const [summary, setSummary] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileName(event.target.files[0].name);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSummary('');

    try {
      // In a real app, you would read the file from the form event.
      // For this demo, we use a mock audio data URI.
      const result = await summarizeMeeting({ audioDataUri: mockAudioDataUri });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Meeting Audio</CardTitle>
          <CardDescription>
            Select an audio file of your meeting to generate a summary.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="audio-file">Audio File</Label>
                <div className="relative">
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    className="pl-12"
                    onChange={handleFileChange}
                    aria-label="Upload audio file"
                  />
                  <FileUp className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                 {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
                 <p className="text-xs text-muted-foreground pt-2">For this demo, a sample silent audio file will be used regardless of your selection.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && (
                <LoaderCircle className="animate-spin mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Summarize Meeting'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader className="relative">
          <CardTitle>Generated Summary</CardTitle>
          <CardDescription>
            The AI-powered summary of your meeting will appear here.
          </CardDescription>
           {summary && <CopyButton text={summary} className="absolute top-4 right-4" />}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-48">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {summary && (
            <Textarea
              readOnly
              value={summary}
              className="min-h-[280px] text-base bg-secondary"
              aria-label="Meeting Summary"
            />
          )}
          {!isLoading && !summary && (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Waiting for audio file...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
