'use client'

export const FooterLinks: React.FC = () => (
  <div className="p-4 border-t text-sm text-gray-500">
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <a href="#" className="hover:text-gray-900">About</a>
      <a href="#" className="hover:text-gray-900">Terms</a>
      <a href="#" className="hover:text-gray-900">Privacy</a>
      <a href="#" className="hover:text-gray-900">Help</a>
      <a href="#" className="hover:text-gray-900">Contact</a>
    </div>
    <p className="mt-4">© 2024 ResearchHub. All rights reserved.</p>
  </div>
);
