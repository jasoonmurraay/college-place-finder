import { useRouter } from "next/router";

type successProps = {
  message: string;
  redirect: {
    link: string | null;
    name: string | null;
  };
};

const SuccessFlash = (props: successProps) => {
  const router = useRouter();
  const redirectHandler = (path: string | null) => {
    if (path) {
      router.push(path);
    }
  };
  return (
    <div>
      <p>{props.message}</p>
      {props.redirect.link && props.redirect.name && (
        <p onClick={() => redirectHandler(props.redirect.link)}>
          Go to {props.redirect.name}
        </p>
      )}
    </div>
  );
};

export default SuccessFlash;
