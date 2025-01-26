import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getFundingProject(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    const work = await PostService.get(id);
    return work;
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getFundingProject(resolvedParams.id);
  return {
    title: project.title,
    description: project.abstract || '',
  };
}

export default async function FundingProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const work = await getFundingProject(resolvedParams.id);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Work Data:</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(work, null, 2)}
      </pre>
    </div>
  );
}
