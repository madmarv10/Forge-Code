import * as React from 'react'
import chalk from 'chalk'
import type { CommandResultDisplay } from '../../commands.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { useAppState, useSetAppState } from '../../state/AppState.js'
import { getMainLoopModel, getDefaultMainLoopModelSetting, renderDefaultModelSetting } from '../../utils/model/model.js'

function renderModelLabel(model: string | null): string {
  const rendered = renderDefaultModelSetting(model ?? getDefaultMainLoopModelSetting())
  return model === null ? `${rendered} (default)` : rendered
}

function SetOpenRouterModelAndClose({
  args,
  onDone,
}: {
  args: string
  onDone: (result?: string, options?: { display?: CommandResultDisplay }) => void
}): React.ReactNode {
  const setAppState = useSetAppState()
  const model = args === 'default' ? null : args

  React.useEffect(() => {
    // Forge Code: set the OpenRouter model directly, bypassing Anthropic's
    // validateModel() (which does a test API call against the Anthropic list).
    // OpenRouter model names like "openai/gpt-4o-mini" aren't on that list.
    setAppState(prev => ({
      ...prev,
      mainLoopModel: model,
      mainLoopModelForSession: null,
    }))
    const label = renderModelLabel(model)
    if (model === null) {
      onDone(`Reset model to default (${chalk.bold(label)})`)
    } else {
      onDone(`Set OpenRouter model to ${chalk.bold(label)}`)
    }
  }, [model, onDone, setAppState])

  return null
}

function ShowModelAndClose({
  onDone,
}: {
  onDone: (result?: string) => void
}): React.ReactNode {
  const mainLoopModel = useAppState(s => s.mainLoopModel)
  const mainLoopModelForSession = useAppState(s => s.mainLoopModelForSession)
  if (mainLoopModelForSession) {
    onDone(
      `Current model: ${chalk.bold(renderModelLabel(mainLoopModelForSession))} (session override from plan mode)\nBase model: ${renderModelLabel(mainLoopModel)}`,
    )
  } else {
    onDone(`Current model: ${renderModelLabel(mainLoopModel)}`)
  }
  return null
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  args = args?.trim() || ''
  if (!args) {
    return <ShowModelAndClose onDone={onDone} />
  }
  if (args === 'help' || args === '?') {
    onDone(
      'Usage: /openrouter <model> — switch to any OpenRouter model (e.g. /openrouter openai/gpt-4o-mini, /openrouter anthropic/claude-3.5-sonnet). Use /openrouter default to reset. Use /openrouter with no args to see the current model.',
      { display: 'system' },
    )
    return
  }
  return <SetOpenRouterModelAndClose args={args} onDone={onDone} />
}