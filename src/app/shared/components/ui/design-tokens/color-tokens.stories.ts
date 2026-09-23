import { Component, OnInit } from '@angular/core'
import type { Meta, StoryObj } from '@storybook/angular'

interface ColorToken {
  name: string
  variable: string
  usage: string
  value?: string
}

interface ColorTokenGroup {
  name: string
  description: string
  tokens: ColorToken[]
}

@Component({
  selector: 'polo-color-tokens-story',
  standalone: true,
  template: `
    <main class="colorTokens">
      <header class="colorTokens__header">
        <p class="colorTokens__eyebrow">Design system</p>
        <h1>Color tokens</h1>
        <p>
          Components use semantic tokens rather than raw color values. The
          primitive palette remains available for defining new semantic roles.
        </p>
      </header>

      @for (group of groups; track group.name) {
        <section class="colorTokens__group">
          <div class="colorTokens__groupHeader">
            <h2>{{ group.name }}</h2>
            <p>{{ group.description }}</p>
          </div>
          <div class="colorTokens__grid">
            @for (token of group.tokens; track token.variable) {
              <article class="colorTokens__card">
                <div
                  class="colorTokens__swatch"
                  [style.background]="'var(' + token.variable + ')'"
                ></div>
                <div class="colorTokens__details">
                  <strong>{{ token.name }}</strong>
                  <code>{{ token.variable }}</code>
                  <span>{{ token.value }}</span>
                  <p>{{ token.usage }}</p>
                </div>
              </article>
            }
          </div>
        </section>
      }
    </main>
  `,
  styleUrl: './color-tokens.stories.sass',
})
class ColorTokensStoryComponent implements OnInit {
  groups: ColorTokenGroup[] = [
    {
      name: 'Surfaces',
      description: 'Background layers establish hierarchy and elevation.',
      tokens: [
        {
          name: 'Canvas',
          variable: '--polo-color-canvas',
          usage: 'Page and Storybook canvas backgrounds',
        },
        {
          name: 'Surface',
          variable: '--polo-color-surface',
          usage: 'Cards, dialogs and controls',
        },
        {
          name: 'Subtle surface',
          variable: '--polo-color-surface-subtle',
          usage: 'Quiet controls and secondary regions',
        },
        {
          name: 'Muted surface',
          variable: '--polo-color-surface-muted',
          usage: 'Hover states and separators',
        },
        {
          name: 'Accent surface',
          variable: '--polo-color-surface-accent',
          usage: 'Selected and highlighted content',
        },
      ],
    },
    {
      name: 'Text',
      description: 'Text roles preserve a predictable contrast hierarchy.',
      tokens: [
        {
          name: 'Strong text',
          variable: '--polo-color-text-strong',
          usage: 'Headings and high-emphasis content',
        },
        {
          name: 'Default text',
          variable: '--polo-color-text',
          usage: 'Labels and body copy',
        },
        {
          name: 'Secondary text',
          variable: '--polo-color-text-secondary',
          usage: 'Descriptions and supporting information',
        },
        {
          name: 'Muted text',
          variable: '--polo-color-text-muted',
          usage: 'Hints and low-emphasis metadata',
        },
        {
          name: 'Text on action',
          variable: '--polo-color-text-on-action',
          usage: 'Text placed on primary or destructive actions',
        },
      ],
    },
    {
      name: 'Borders and actions',
      description: 'Interactive states use a shared blue accent and focus color.',
      tokens: [
        {
          name: 'Border',
          variable: '--polo-color-border',
          usage: 'Default card and section borders',
        },
        {
          name: 'Strong border',
          variable: '--polo-color-border-strong',
          usage: 'Inputs and secondary buttons',
        },
        {
          name: 'Hover border',
          variable: '--polo-color-border-hover',
          usage: 'Hover emphasis for interactive controls',
        },
        {
          name: 'Action',
          variable: '--polo-color-action',
          usage: 'Primary actions and selected labels',
        },
        {
          name: 'Action hover',
          variable: '--polo-color-action-hover',
          usage: 'Primary action hover state',
        },
        {
          name: 'Action soft',
          variable: '--polo-color-action-soft',
          usage: 'Selected cards and informational surfaces',
        },
        {
          name: 'Focus',
          variable: '--polo-color-focus',
          usage: 'Keyboard focus rings and active borders',
        },
      ],
    },
    {
      name: 'Feedback',
      description: 'Status colors always accompany text or another visual cue.',
      tokens: [
        {
          name: 'Danger',
          variable: '--polo-color-danger',
          usage: 'Destructive actions',
        },
        {
          name: 'Danger hover',
          variable: '--polo-color-danger-hover',
          usage: 'Destructive action hover state',
        },
        {
          name: 'Danger soft',
          variable: '--polo-color-danger-soft',
          usage: 'Destructive hover backgrounds and notices',
        },
        {
          name: 'Danger border',
          variable: '--polo-color-danger-border',
          usage: 'Borders around destructive states',
        },
        {
          name: 'Success',
          variable: '--polo-color-success',
          usage: 'Successful and positive states',
        },
        {
          name: 'Success soft',
          variable: '--polo-color-success-soft',
          usage: 'Successful state backgrounds',
        },
      ],
    },
  ]

  ngOnInit() {
    this.groups.forEach((group) => {
      group.tokens.forEach((token) => {
        token.value = this.resolveColor(token.variable)
      })
    })
  }

  private resolveColor(variable: string) {
    const sample = document.createElement('span')
    sample.style.color = `var(${variable})`
    document.body.appendChild(sample)
    const value = getComputedStyle(sample).color
    sample.remove()
    return value
  }
}

const meta: Meta<ColorTokensStoryComponent> = {
  title: 'Design System/Tokens/Colors',
  component: ColorTokensStoryComponent,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<ColorTokensStoryComponent>

export const Palette: Story = {}
