import { DateTime } from "luxon"

const Datetime = (props: { children: string }) => {
  const time = DateTime.fromISO(props.children).toUTC()

  return (
    <time title={time.toRFC2822()} dateTime={time.toISO()}>
      {time.toISODate()}
    </time>
  )
}

export default Datetime