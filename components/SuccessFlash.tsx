import { useRouter } from "next/router";

type redirectInfo = {
  link: string | null;
  name: string | null;
};

type successProps = {
  message: string;
  redirect: redirectInfo | null;
};

const SuccessFlash = (props: successProps) => {
  return (
    <div className="bg-green-400 text-white w-full flex flex-col items-center justify-center py-3">
      <p>{props.message}</p>
      {props.redirect && props.redirect.link && props.redirect.name && (
        <a href={props.redirect.link} className="underline">
          Go to {props.redirect.name}
        </a>
      )}
    </div>
  );
};

export default SuccessFlash;
