type CardProps = {
  header: string;
  subheader: string;
};

const Card = (props: CardProps) => {
  return (
    <div className="border rounded-md shadow-md overflow-hidden h-full">
      <div className="p-4">
        <h3 className="text-lg font-medium">{props.header}</h3>
        <p className="text-gray-500">{props.subheader}</p>
      </div>
    </div>
  );
};

export default Card;
