type ErrorProps = {
  message: string;
};

const ErrorMsg = (props: ErrorProps) => {
  return <p className="bg-red-500 rounded-md text-white p-4">{props.message}</p>;
};
export default ErrorMsg;
