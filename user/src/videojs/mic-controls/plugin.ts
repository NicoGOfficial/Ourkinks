import videojs from 'video.js';

import AudioMuteToggleButton from './audio-mute-toggle-button';

const Plugin = videojs.getPlugin('plugin') as any;

interface MicControlsPluginOptions {
  muteLocalMic: any,
  unmuteLocalMic: any
}

export default class MicControlsPlugin extends Plugin {
  private muteTogglesButton: videojs.Button;

  constructor(player, options: MicControlsPluginOptions) {
    super(player, options);
    this.muteTogglesButton = new AudioMuteToggleButton(this.player, options) as any;
    this.player.controlBar.addChild(this.muteTogglesButton, {
      componentClass: 'muteToggleButton'
    });
  }

  dispose() {
    super.dispose();
  }
}
