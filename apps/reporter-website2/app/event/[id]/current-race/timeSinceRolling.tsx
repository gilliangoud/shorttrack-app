import { useState } from 'react';
import useInterval from './useInterval';

type Props = {
  date: string;
  text: string;
  className?: string;
};

const TimeSinceRolling = (props: Props) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);

  useInterval(() => {
    const time = Date.now() - Date.parse(props.date);

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
    setMilliseconds(Math.floor((time / 10) % 100));
  }, 1);

  return (
    <div className={props.className}>
      {props.text} {days > 0 ? days + ':' : null}
      {hours > 0 ? hours + ':' : null}
      {minutes}:{seconds}.{milliseconds}
    </div>
  );
};

export default TimeSinceRolling;
