import { PageHeader } from '@/components/page-header';
import { SummarizerClient } from './client';

export default function SummarizerPage() {
  return (
    <>
      <PageHeader
        title="AI Meeting Summarizer"
        description="Generate concise summaries from your meeting recordings instantly."
      />
      <SummarizerClient />
    </>
  );
}
