import ReactTimeAgo from 'react-time-ago';

export function TimeSince({
  date,
  text,
  timeStyle = 'round-minute',
}: {
  date: number | Date;
  text: string;
  timeStyle?:
    | 'round-minute'
    | 'round-second'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'exact';
}): JSX.Element {
  return (
    <p>
      {text} <ReactTimeAgo date={date} locale="en-US" timeStyle={timeStyle} />
    </p>
  );
}
