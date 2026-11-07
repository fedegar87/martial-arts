import React from 'react';
import {AbsoluteFill, Composition, interpolate, registerRoot, useCurrentFrame} from 'remotion';

const SetupCheck = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: '#151613', color: '#d5b878', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial'}}>
      <div style={{fontSize: 64, opacity: interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'})}}>Skill Practice</div>
      <div style={{fontSize: 28, color: '#ffffff', marginTop: 24}}>Ambiente video pronto</div>
    </AbsoluteFill>
  );
};

registerRoot(() => <Composition id="SetupCheck" component={SetupCheck} durationInFrames={60} fps={30} width={1280} height={720} />);
