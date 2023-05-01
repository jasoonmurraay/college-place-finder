type ErrorProps = {
  message: string;
};

const ErrorMsg = (props: ErrorProps) => {
  return <p className="bg-red-500 rounded-sm">{props.message}</p>;
};
export default ErrorMsg;
