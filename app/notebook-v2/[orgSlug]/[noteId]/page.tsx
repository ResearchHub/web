import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Define types for the page props
type PageProps = {
  params: Promise<{
    orgSlug: string;
    noteId: string;
  }>;
};

// This is a server component that will be rendered on the server
export default async function NotebookPage({ params }: PageProps) {
  const { orgSlug, noteId } = await params;

  // You can add validation logic here
  // For example, if the noteId or orgSlug is invalid, you can return notFound()
  if (noteId === 'not-found') {
    return notFound();
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 pl-16">
        <h1 className="text-3xl font-bold mb-6">Comprehensive Research Analysis</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Abstract</h2>
          <p className="text-gray-700 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus
            hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut
            eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non
            venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.
          </p>
          <p className="text-gray-700">
            Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere
            eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed,
            nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit
            fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
            cubilia Curae; In ac dui quis mi consectetuer lacinia.
          </p>
          <p className="text-gray-700 mb-4">
            Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet
            iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer
            eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc.
            Nunc nonummy metus.
          </p>
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6">
            Vestibulum ullamcorper mauris at ligula. Fusce fermentum. Nullam cursus lacinia erat.
            Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing.
          </blockquote>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Methodology</h2>
          <p className="text-gray-700 mb-4">
            Pellentesque posuere. Praesent turpis. Aenean posuere, tortor sed cursus feugiat, nunc
            augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero,
            sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis.
          </p>
          <h3 className="text-xl font-medium mb-3 mt-6">Data Collection</h3>
          <p className="text-gray-700 mb-4">
            Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec
            pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus
            et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus
            dolor. Maecenas vestibulum mollis diam.
          </p>
          <h3 className="text-xl font-medium mb-3">Analysis Techniques</h3>
          <p className="text-gray-700">
            Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et
            malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor
            auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec
            urna.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          <p className="text-gray-700 mb-4">
            Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Aenean viverra rhoncus pede.
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
            egestas. Ut non enim eleifend felis pretium feugiat. Vivamus quis mi. Phasellus a est.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Praesent congue erat at massa. Sed cursus turpis vitae tortor.</li>
            <li className="mb-2">Donec posuere vulputate arcu. Phasellus accumsan cursus velit.</li>
            <li className="mb-2">
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.
            </li>
            <li>Pellentesque posuere. Praesent turpis.</li>
          </ul>
          <p className="text-gray-700">
            Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante,
            dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius
            laoreet. Quisque rutrum. Aenean imperdiet.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Discussion</h2>
          <p className="text-gray-700 mb-4">
            Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero,
            sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar,
            hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut
            libero venenatis faucibus. Nullam quis ante.
          </p>
          <p className="text-gray-700">
            Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit
            amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue
            velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Conclusion</h2>
          <p className="text-gray-700 mb-4">
            In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu
            pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.
            Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae,
            eleifend ac, enim.
          </p>
          <p className="text-gray-700">
            Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla
            ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel
            augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This is a notebook page for organization:{' '}
            <span className="font-semibold">{orgSlug}</span> and note ID:{' '}
            <span className="font-semibold">{noteId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orgSlug, noteId } = await params;

  return {
    title: `Notebook - ${orgSlug} - ${noteId}`,
  };
}
