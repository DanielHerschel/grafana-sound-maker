import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';
import { VariableSelectEditor } from './components/editors/VariableSelectEditor';
import MUTE_ENABLED from 'feature_flags';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  builder
  .addBooleanSwitch({
    path: 'enabled',
    name: 'Enabled',
    description: 'Enable or disable the sound maker panel.',
    defaultValue: false,
  })
  .addTextInput({
    path: 'soundURL',
    name: 'Sound URL',
    description: 'URL of the sound to play when the check is triggered.',
    defaultValue: '',
  })
  .addSliderInput({
    path: 'volume',
    name: 'Volume',
    description: 'Volume of the sound.',
    defaultValue: 100,
    settings: {
      min: 0,
      max: 100,
      step: 1,
    },
  })
  .addBooleanSwitch({
    path: 'loop',
    name: 'Loop',
    description: 'Whether the sound should loop.',
    defaultValue: false,
  });

  // Add mute variable select option.
  if (MUTE_ENABLED){
    builder.addCustomEditor({
      id: 'muteVariableSelect',
      path: 'muteVariableSelect',
      name: 'Mute Variable Select',
      description: 'Select a dashboard variable to mute the sound for this tenant. Should be a Boolean.',
      editor: VariableSelectEditor,
    });
  }

  return builder;
});
