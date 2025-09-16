'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MultiSelectOption,
  SearchableMultiSelect,
} from '@/components/ui/form/SearchableMultiSelect';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, Filter } from 'lucide-react';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { Topic } from '@/types/topic';
import { Field, Input, Label, Switch } from '@headlessui/react';
import { ReviewStars } from '../Comment/lib/ReviewExtension';
import { HubService } from '@/services/hub.service';
import { IHub } from '@/types/hub';

interface FundingSelectorProps {
  selectedHubs: IHub[];
  onHubsChange: (hubs: IHub[]) => void;
  selectedVotes: number;
  onVotesChange: (votes: number) => void;
  selectedScore: number;
  onScoreChange: (score: number) => void;
  selectedVerifiedAuthorsOnly: boolean;
  onVerifiedAuthorsOnlyChange: (verifiedOnly: boolean) => void;
  selectedTaxDeductible: boolean;
  onTaxDeductibleChange: (taxDeductible: boolean) => void;
  selectedPreviouslyFunded: boolean;
  onPreviouslyFundedChange: (previouslyFunded: boolean) => void;
  error?: string | null;
}

export function FundingSelector({
  selectedHubs,
  onHubsChange,
  selectedVotes,
  onVotesChange,
  selectedScore,
  onScoreChange,
  selectedVerifiedAuthorsOnly,
  onVerifiedAuthorsOnlyChange,
  selectedTaxDeductible,
  onTaxDeductibleChange,
  selectedPreviouslyFunded,
  onPreviouslyFundedChange,
  error,
}: FundingSelectorProps) {
  const [allHubs, setAllHubs] = useState<Topic[]>([]);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // fetch all hubs at mount
  useEffect(() => {
    (async () => {
      const hubs = await HubService.getHubs({ excludeJournals: false });
      setAllHubs(hubs);
    })();
  }, []);

  // utility conversions
  const hubsToOptions = (hubs: IHub[]): MultiSelectOption[] =>
    hubs.map((hub) => ({ value: String(hub.id), label: hub.name }));

  const topicsToHubs = (topics: Topic[]): IHub[] =>
    topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
    }));

  const optionsToHubs = (options: MultiSelectOption[]): IHub[] =>
    options.map(
      (opt) =>
        selectedHubs.find((h) => String(h.id) === opt.value) || {
          id: opt.value,
          name: opt.label,
        }
    );

  const allHubOptions = hubsToOptions(topicsToHubs(allHubs));

  const handleTopicSearch = useCallback(async (query: string): Promise<MultiSelectOption[]> => {
    try {
      const topics = await HubService.suggestTopics(query);
      return topics.map((topic) => ({
        value: topic.id.toString(),
        label: topic.name,
      }));
    } catch (error) {
      console.error('Error searching topics:', error);
      return [];
    }
  }, []);

  const handleTopicsChange = (options: MultiSelectOption[]) => {
    onHubsChange(optionsToHubs(options));
  };

  const CustomSelectedItems = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedHubs.map((hub) => (
        <Badge
          key={hub.id}
          variant="default"
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-sm cursor-pointer hover:bg-gray-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onHubsChange(selectedHubs.filter((h) => h.id !== hub.id));
          }}
        >
          {hub.color && (
            <div className="h-2 w-2 rounded-sm mr-1" style={{ backgroundColor: hub.color }} />
          )}
          <span>{hub.name}</span>
        </Badge>
      ))}
    </div>
  );

  const filtersUsed =
    selectedHubs.length +
    (selectedVotes > 0 ? 1 : 0) +
    (selectedScore > 0 ? 1 : 0) +
    (selectedVerifiedAuthorsOnly ? 1 : 0) +
    (selectedTaxDeductible ? 1 : 0) +
    (selectedPreviouslyFunded ? 1 : 0);
  const trigger = (
    <button
      className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm w-full"
      type="button"
    >
      <Filter className="h-4 w-4 text-gray-500" />
      <span className="text-gray-700">Filters</span>
      {filtersUsed > 0 && (
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full px-1.5">
          {filtersUsed}
        </span>
      )}
      <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
    </button>
  );

  return (
    <BaseMenu
      trigger={trigger}
      align="start"
      sideOffset={5}
      className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-md min-w-[8rem] w-[var(--trigger-width)] !w-[300px] max-w-[90vw]"
    >
      <div className="p-2 w-full" ref={menuContentRef}>
        <div className="pb-2 border-b border-gray-200">
          <p>Topics</p>
          <SearchableMultiSelect
            value={hubsToOptions(selectedHubs)}
            onChange={handleTopicsChange}
            onAsyncSearch={handleTopicSearch}
            options={allHubOptions}
            placeholder="Search for topics..."
            minSearchLength={0}
            error={error || undefined}
            className="w-full border-0 SearchableMultiSelect-input"
            debounceMs={500}
          />
        </div>
        <Field className="pt-2 pb-2 border-b border-gray-200">
          <Label>Minimum Upvotes: {selectedVotes}</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedVotes}
            onChange={(e) => onVotesChange(Number(e.target.value))}
            className="w-full h-2"
          />
        </Field>
        <Field className="pt-2 pb-2 border-b border-gray-200 flex items-center justify-between">
          <Label>Minimum Score</Label>
          <ReviewStars
            rating={selectedScore}
            onRatingChange={onScoreChange}
            isClearable={true}
            label=""
          />
        </Field>
        <Field className="pt-2 pb-2 border-b border-gray-200 flex items-center justify-between">
          <Label>Verified Authors Only</Label>
          <Switch
            checked={selectedVerifiedAuthorsOnly}
            onChange={onVerifiedAuthorsOnlyChange}
            className={`group inline-flex h-6 w-11 items-center rounded-full transition ${selectedVerifiedAuthorsOnly ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`size-4 translate-x-1 rounded-full bg-white transition ${selectedVerifiedAuthorsOnly ? 'translate-x-6' : ''}`}
            />
          </Switch>
        </Field>
        <Field className="pt-2 pb-2 border-b border-gray-200 flex items-center justify-between">
          <Label>Tax-Deductible</Label>
          <Switch
            checked={selectedTaxDeductible}
            onChange={onTaxDeductibleChange}
            className={`group inline-flex h-6 w-11 items-center rounded-full transition ${selectedTaxDeductible ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`size-4 translate-x-1 rounded-full bg-white transition ${selectedTaxDeductible ? 'translate-x-6' : ''}`}
            />
          </Switch>
        </Field>
        <Field className="pt-2 flex items-center justify-between">
          <Label>Previously Funded</Label>
          <Switch
            checked={selectedPreviouslyFunded}
            onChange={onPreviouslyFundedChange}
            className={`group inline-flex h-6 w-11 items-center rounded-full transition ${selectedPreviouslyFunded ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`size-4 translate-x-1 rounded-full bg-white transition ${selectedPreviouslyFunded ? 'translate-x-6' : ''}`}
            />
          </Switch>
        </Field>
      </div>
    </BaseMenu>
  );
}
