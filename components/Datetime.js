import { DateTime } from "luxon";

const Datetime = props => {
  let time = DateTime.fromISO(props.children);

  return (
    <time title={time.toISO()} datetime={time.toISO()}>
      {time.toISODate()}
    </time>
  );
};

export default Datetime;
