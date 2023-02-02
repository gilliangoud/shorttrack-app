import { useState } from 'react';
import useInterval from './useInterval';

type Props = {
  text: string;
  className?: string;
};

const RollingTime = (props: Props) => {
  const [time, setTime] = useState('');

  useInterval(() => {
    setTime(new Date().toLocaleString());
  }, 1000);

  return (
    <p className={props.className}>
      {time}
    </p>
  );
};

export default RollingTime;
