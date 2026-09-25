import { Provider } from '@angular/core'
import { ApisService } from 'src/app/core/services/apis.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StorageService } from 'src/app/shared/services/storage.service'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { PanzoomService } from '../../services/panzoom.service'
import { StoryEditorService } from '../../services/story-editor.service'
import { StoryReferencesService } from '../../services/story-references.service'

const refs = {
  stat_courage: { name: 'Courage', type: 'stat' },
  stat_reputation: { name: 'Reputation', type: 'stat' },
  condition_key: { name: 'Has the observatory key', type: 'condition' },
  condition_guard: { name: 'Guard is distracted', type: 'condition' },
  property_alias: { name: 'Player alias', type: 'property' },
}

export const nodeStoryProviders: Provider[] = [
  BoardAnchorRegistryService,
  {
    provide: PanzoomService,
    useValue: {
      focusElements: false,
      resumeDrag: () => undefined,
    },
  },
  {
    provide: StoryReferencesService,
    useValue: {
      getAll: () => refs,
      getByType: (type: string) =>
        Object.entries(refs)
          .filter(([, storyRef]) => storyRef.type === type)
          .map(([id, storyRef]) => ({ id, ...storyRef })),
      getName: (id: keyof typeof refs) => refs[id]?.name ?? '',
      create: (name: string, type: string) => ({
        id: `${type}_storybook`,
        name,
        type,
      }),
    },
  },
  {
    provide: StoryEditorService,
    useValue: {
      getEventsOfAnswer: () => [
        {
          id: 'event_answer',
          action: 'alterStat',
          type: 'stat',
          target: 'stat_courage',
          amount: '2',
        },
      ],
      getRequirementsOfAnswer: () => [
        { target: 'stat_courage', type: 'stat', amount: 3 },
      ],
      createNodeAnswer: () => undefined,
      createNodeCondition: () => undefined,
      addConditionRule: () => undefined,
      removeConditionRule: () => undefined,
      moveCondition: () => undefined,
      removeAnswer: () => undefined,
      removeCondition: () => undefined,
      updateNodeText: () => undefined,
      updateNodeProperty: () => undefined,
      updateNodePlaceholder: () => undefined,
      updateNodeDescription: () => undefined,
      updateNodeButtonText: () => undefined,
      updateNodeLinks: () => undefined,
      updateNodeShareOptions: () => undefined,
      updateConditionValues: () => undefined,
      saveNodeEvents: () => undefined,
      saveAnswerEvents: () => undefined,
      saveAnswerRequirements: () => undefined,
      addImageToNode: () => undefined,
      removeImageFromNode: () => undefined,
    },
  },
  {
    provide: DatabaseService,
    useValue: {
      user: () => ({ profile: { subscription_status: 'active' } }),
      supabase: {
        auth: {
          getUser: async () => ({ data: { user: { id: 'storybook-user' } } }),
        },
      },
    },
  },
  {
    provide: ActiveStoryService,
    useValue: {
      storyId: () => 'storybook-story',
      storyConfiguration: () => ({ sharing: true }),
      entireTree: () => ({ refs, categories: [], nodes: [] }),
    },
  },
  {
    provide: ApisService,
    useValue: { getOptimizedImage: async () => undefined },
  },
  {
    provide: StorageService,
    useValue: {
      uploadImage: async () => undefined,
      removeImage: async () => true,
    },
  },
]
