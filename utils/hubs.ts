import { MultiSelectOption } from '@/components/ui/form/SearchableMultiSelect';
import { IHub } from '@/types/hub';
import { Topic } from '@/types/topic';

export const hubsToOptions = (hubs: IHub[]): MultiSelectOption[] =>
  hubs.map((hub) => ({ value: String(hub.id), label: hub.name }));

export const topicsToHubs = (topics: Topic[]): IHub[] =>
  topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description,
  }));

export const optionsToHubs = (options: MultiSelectOption[], existingHubs: IHub[]): IHub[] =>
  options.map(
    (opt) =>
      existingHubs.find((h) => String(h.id) === opt.value) || {
        id: opt.value,
        name: opt.label,
      }
  );
