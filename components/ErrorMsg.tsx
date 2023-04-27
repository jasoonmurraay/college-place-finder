type ErrorProps = {
  message: string;
};

const ErrorMsg = (props: ErrorProps) => {
  return <p>{props.message}</p>;
};
export default ErrorMsg;
