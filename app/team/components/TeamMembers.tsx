import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

const teamMembers = [
  {
    name: 'Brian Armstrong',
    title: 'Chief Executive Officer',
    image: '/team/brian.jpeg',
    linkedin: 'https://www.linkedin.com/in/barmstrong/',
  },
  {
    name: 'Patrick Joyce',
    title: 'Chief Operating Officer',
    image: '/team/joyce.jpeg',
    linkedin: 'https://www.linkedin.com/in/patrick-joyce-396b953b/',
  },
  {
    name: 'Kobe Attias',
    title: 'Founding Engineer',
    image: '/team/kobe.png',
    linkedin: 'https://www.linkedin.com/in/kobe-attias-5a9a9421/',
  },
];

export const TeamMembers = () => {
  return (
    <div className="py-16">
      <p className="text-xl text-gray-800 text-center mb-12">
        We are a small team of builders and thinkers working towards making science better for
        everyone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teamMembers.map((member) => (
          <div key={member.name} className="text-center">
            <div className="relative w-[245px] h-[250px] mx-auto">
              <Image src={member.image} alt={member.name} fill className="object-cover rounded" />
            </div>
            <Link
              href={member.linkedin}
              target="_blank"
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
            >
              <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
              {member.name}
            </Link>
            <div className="text-gray-600 mt-1">{member.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
