import { FC } from 'react';
import Icon from './Icon';

/**
 * Component to showcase the newly added icons
 */
export const IconExamples: FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-medium mb-4">Analytics Icons</h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Icon name="upChart1" size={32} />
            <span className="mt-2 text-sm">upChart1</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="upChart2" size={32} />
            <span className="mt-2 text-sm">upChart2</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="gauge" size={32} />
            <span className="mt-2 text-sm">gauge</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Solid Icons</h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Icon name="solidHand" size={32} />
            <span className="mt-2 text-sm">solidHand</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="solidNotebook" size={32} />
            <span className="mt-2 text-sm">solidNotebook</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="solidCoin" size={32} />
            <span className="mt-2 text-sm">solidCoin</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="solidBook" size={32} />
            <span className="mt-2 text-sm">solidBook</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Bold RSC Icons</h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Icon name="rscBold1" size={32} />
            <span className="mt-2 text-sm">rscBold1</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="rscBold2" size={32} />
            <span className="mt-2 text-sm">rscBold2</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="rscBold1" size={32} color="#3971FF" />
            <span className="mt-2 text-sm">Blue rscBold1</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="rscBold2" size={32} color="#F2A900" />
            <span className="mt-2 text-sm">Gold rscBold2</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Interactive Icons</h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Icon name="settings" size={32} />
            <span className="mt-2 text-sm">settings</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="comment" size={32} />
            <span className="mt-2 text-sm">comment</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="upvote" size={32} />
            <span className="mt-2 text-sm">upvote</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="report" size={32} />
            <span className="mt-2 text-sm">report</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="lightening" size={32} />
            <span className="mt-2 text-sm">lightening</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="solid" size={32} />
            <span className="mt-2 text-sm">solid</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Colorized Icons Example</h2>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <Icon name="settings" size={32} color="#3971FF" />
            <span className="mt-2 text-sm">Blue Settings</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="upvote" size={32} color="#F2A900" />
            <span className="mt-2 text-sm">Gold Upvote</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="lightening" size={32} color="#E3A44A" />
            <span className="mt-2 text-sm">Gold Lightening</span>
          </div>
          <div className="flex flex-col items-center">
            <Icon name="solidBook" size={32} color="#3971FF" />
            <span className="mt-2 text-sm">Blue solidBook</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconExamples;
