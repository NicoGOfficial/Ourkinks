import dynamic from 'next/dynamic';

let Picker;
if (typeof window !== 'undefined') {
  Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
}

type IProps = {
  onEmojiClick: Function;
}

export function Emotions({
  onEmojiClick
}: IProps) {
  const emojiClick = (event, emoji) => {
    // eslint-disable-next-line react/destructuring-assignment
    onEmojiClick(emoji.emoji);
  };

  if (typeof window === 'undefined') return null;

  return (
    <Picker
      onEmojiClick={emojiClick}
      disableAutoFocus
      disableSearchBar
      disableSkinTonePicker
    />
  );
}

export default Emotions;
