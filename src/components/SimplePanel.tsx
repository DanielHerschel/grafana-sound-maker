import React from 'react';
import { DataFrameView, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { PanelDataErrorView } from '@grafana/runtime';
import { SoundManager } from './SoundManager';
import { Button, Modal, Switch } from '@grafana/ui';
import pluginJson from '../plugin.json';
import { config } from '@grafana/runtime';

export const pluginAssetUrl = (relPath: string) =>
  `${config.appSubUrl}/public/plugins/${pluginJson.id}/${relPath.replace(/^\/+/, '')}`;

const defaultAlertURL = new URL('../test_sound/flip_flap.mp3', import.meta.url).href;

let soundManager = new SoundManager(defaultAlertURL, {
  volume: 1.0,
  loop: true,
  startAt: 0,
});

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }: Props) => {
  const [ muted, setMuted ] = React.useState(false);
  const [ showTestWarning, setShowTestWarning ] = React.useState(false);
  
  const { enabled, soundURL, volume, loop } = options;

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

  // Main Logic
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
      <div style ={{display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'center'}}>
        <div style={{fontSize: '1em'}}>Mute this Tenant</div>
        <Switch
          label="Muted"
          value={muted}
          onChange={() => {
            // This is a read-only panel, so we can't change options directly.
            // In a real implementation, you would use a callback to update the panel options.
            console.warn('Toggle switch clicked, but panel options are read-only.');
            setMuted(!muted);
          }}
        />
      </div>
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
