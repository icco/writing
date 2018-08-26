import Error from 'next/error'

export default ({ message }) => (
  <Error statusCode=403 />
);
