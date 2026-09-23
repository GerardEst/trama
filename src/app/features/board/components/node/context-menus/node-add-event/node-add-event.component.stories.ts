import type { Meta, StoryObj } from '@storybook/angular'
import {
  applicationConfig,
  componentWrapperDecorator,
} from '@storybook/angular'
import { fn } from '@storybook/test'
import { refType } from 'src/app/core/interfaces/interfaces'
import {
  StoryReferencesService,
  StoryRefOption,
} from '../../../../services/story-references.service'
import { NodeAddEventComponent } from './node-add-event.component'

const references: StoryRefOption[] = [
  { id: 'stat_health', name: 'Health', type: 'stat' },
  { id: 'stat_courage', name: 'Courage', type: 'stat' },
  { id: 'stat_reputation', name: 'Reputation', type: 'stat' },
  {
    id: 'condition_tower_key',
    name: 'Key to the old tower',
    type: 'condition',
  },
  {
    id: 'condition_archivist',
    name: 'Met the archivist',
    type: 'condition',
  },
  { id: 'property_name', name: 'Character name', type: 'property' },
  { id: 'property_role', name: 'Character role', type: 'property' },
]

const storyReferences = {
  getByType(type: refType) {
    return references.filter((reference) => reference.type === type)
  },
  getName(refId: string) {
    return references.find((reference) => reference.id === refId)?.name ?? ''
  },
  create(name: string, type: refType) {
    const duplicate = references.find(
      (reference) => reference.type === type && reference.name === name
    )
    if (duplicate) return undefined

    const createdReference: StoryRefOption = {
      id: `${type}_storybook_${references.length + 1}`,
      name,
      type,
    }
    references.push(createdReference)
    return createdReference
  },
}

const meta: Meta<NodeAddEventComponent> = {
  title: 'Board/Node/Add event',
  component: NodeAddEventComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: StoryReferencesService,
          useValue: storyReferences,
        },
      ],
    }),
    componentWrapperDecorator(
      (story) => `
        <div style="min-height: 48rem; padding: 3rem; background: #f4f6f9; box-sizing: border-box;">
          <div style="position: relative; width: min(32rem, calc(100vw - 6rem));">
            ${story}
          </div>
        </div>
      `
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['stat', 'condition', 'property'],
    },
    amount: { control: 'text' },
    target: { control: 'text' },
    property: { control: 'text' },
    canBeDeleted: { control: 'boolean' },
    eventId: { table: { disable: true } },
    onSaveEvent: { control: false },
    onDeleteEvent: { control: false },
    onClose: { control: false },
  },
  args: {
    onSaveEvent: fn(),
    onDeleteEvent: fn(),
    onClose: fn(),
  },
}

export default meta
type Story = StoryObj<NodeAddEventComponent>

export const NewEvent: Story = {
  args: {
    type: 'stat',
    target: '',
    amount: undefined,
    canBeDeleted: false,
  },
}

export const ConfiguredStat: Story = {
  args: {
    type: 'stat',
    target: 'stat_health',
    amount: '5',
    canBeDeleted: false,
  },
}

export const ActiveCondition: Story = {
  args: {
    type: 'condition',
    target: 'condition_tower_key',
    amount: 1,
    canBeDeleted: true,
  },
}

export const PropertyValue: Story = {
  args: {
    type: 'property',
    target: 'property_role',
    property: 'Royal cartographer',
    canBeDeleted: true,
  },
}
