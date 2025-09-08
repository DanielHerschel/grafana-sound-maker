import React from 'react';
import { DataFrameView, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { PanelDataErrorView } from '@grafana/runtime';
import { SoundManager } from './SoundManager';
import { Button, Modal, Switch } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import MUTE_ENABLED from 'feature_flags';

const defaultAlertURL = new URL('../sounds/flip_flap.mp3', import.meta.url).href;

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, fieldConfig, id }: Props) => {
  // State and variable declarations
  const [ mutedFromSwitch, setMutedFromSwitch ] = React.useState(false);
  const [ showTestWarning, setShowTestWarning ] = React.useState(false);
  
  const { enabled, soundURL, volume, loop, muteVariableSelect } = options;
  const soundManager = SoundManager.instance;
  
  // Mute if title contains the selected variable value
  let muteFromDashVariable = false;
  if (MUTE_ENABLED) {
    if (muteVariableSelect && muteVariableSelect !== '') {
      const templateSrv = getTemplateSrv(); // Get the template service
      const variableValue = templateSrv.replace(`$${muteVariableSelect}`) // Extract variable value
      
      muteFromDashVariable = !!variableValue // Cast value to boolean
    }
  }

  // Setup SoundManager
  const clampedVolume = volume / 100;
  if (soundURL !== '') {
    soundManager.setSound(soundURL);
  } else {
    soundManager.setSound(defaultAlertURL);
  }
  soundManager.setVolume(clampedVolume);
  soundManager.setLoop(loop);


  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  // Play Sound Logic
  const muted = muteFromDashVariable || mutedFromSwitch;
  if (enabled && !muted) {
    data.series.forEach((series) => {
      const view = new DataFrameView(series);
      if (view.length > 0) {
        soundManager.play();
      } else {
        soundManager.stop();
      }
    });
  } else {
    soundManager.stop();
  }
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '5em' }}>
      { !muteVariableSelect && MUTE_ENABLED && <div style ={{display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'center'}}>
        <div style={{fontSize: '1em'}}>Mute this Tenant</div>
        <Switch
          label="Muted"
          value={mutedFromSwitch}
          onChange={() => {
            setMutedFromSwitch(!mutedFromSwitch);
          }}
        />
      </div> }
      <Button 
        onClick={
          async () => {
            if (!enabled) {
              setShowTestWarning(true);
            }

            if (!soundManager.isPlaying) {
              soundManager.play();
              setTimeout(() => {soundManager.stop();}, 5000); 
            }
          }
        }
      >
        Test Sound
      </Button>
      <Modal title="Warning" isOpen={showTestWarning} onDismiss={() => setShowTestWarning(false)} >
        Playing sound although the sound is disabled in panel options.
      </Modal>
    </div>
  );
};
