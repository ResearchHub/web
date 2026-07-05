import fs from 'fs';
import path from 'path';
import { ProposalDemoClient } from './ProposalDemoClient';
import { PROPOSAL_DEMO_HTML_PATH } from '@/components/Editor/lib/data/proposalDemoContent';

export default function ProposalDemoPage() {
  const html = fs.readFileSync(path.join(process.cwd(), PROPOSAL_DEMO_HTML_PATH), 'utf-8');

  return <ProposalDemoClient html={html} />;
}
