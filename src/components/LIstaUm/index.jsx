import soma from "../../functions/soma";
import multi from "../../taskUm/multi";

const ListaUm = () => {
  const result = soma(1, 5);

  const mult = multi(10, 5);

  return (
    <div>
      <h1>ListaUM</h1>
      {result}
      {mult}
    </div>
  );
};

export default ListaUm;
