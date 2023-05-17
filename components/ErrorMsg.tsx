type ErrorProps = {
  message: string;
};

const ErrorMsg = (props: ErrorProps) => {
  return (
    <div className="bg-red-500 text-white p-4 w-full flex items-center justify-center text-center">
      <p className="">{props.message}</p>
    </div>
  );
};
export default ErrorMsg;
