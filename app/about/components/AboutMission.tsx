import Image from 'next/image';

export const AboutMission = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-medium text-gray-900 mb-6">A GitHub For Science</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              ResearchHub's mission is to accelerate the pace of scientific research. Our goal is to
              make a modern mobile and web application where people can collaborate on scientific
              research in a more efficient way, similar to what GitHub has done for software
              engineering.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mt-4">
              Researchers should be able to publish articles (preprint or postprint) and discuss the
              findings in a completely open and accessible forum dedicated solely to the relevant
              article.
            </p>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/static/about/about-1.png"
              alt="ResearchHub Platform"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
          <div className="relative h-[400px] order-2 lg:order-1">
            <Image
              src="/static/about/about-hubs.png"
              alt="ResearchHub Hubs"
              fill
              className="object-contain"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-medium text-gray-900 mb-6">
              "Hubs" as an Alternative to Journals
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Within the ResearchHub platform, research papers are stored and grouped in 'Hubs' by
              area of research. Individual Hubs will essentially act as live journals within focused
              areas, with highly upvoted posts (i.e. the paper and its associated summary and
              discussion) moving to the top of each Hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
