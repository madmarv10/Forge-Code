import type { Command } from '../../commands.js'
import { getMainLoopModel, renderModelName } from '../../utils/model/model.js'

export default {
  type: 'local-jsx',
  name: 'openrouter',
  aliases: ['or'],
  get description() {
    return `Switch the OpenRouter model (e.g. /openrouter openai/gpt-4o-mini). Currently ${renderModelName(getMainLoopModel())}.`
  },
  argumentHint: '[model]',
  disableModelInvocation: true,
  load: () => import('./openrouter.js'),
} satisfies Command