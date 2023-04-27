type CardProps = {
  header: string;
  subheader: string;
  imgUrl: string | null;
};

const Card = (props: CardProps) => {
  return (
    <div className="border rounded-md shadow-md overflow-hidden h-full">
      {props.imgUrl && (
        <img className="w-32 h-32 object-cover" src={props.imgUrl} alt="" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-medium">{props.header}</h3>
        <p className="text-gray-500">{props.subheader}</p>
      </div>
    </div>
  );
};

export default Card;
