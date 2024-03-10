import soma from "../../functions/soma";

const ListaUm = () => {
  const result = soma(1, 5);

  return (
    <div>
      <h1>ListaUM</h1>
      {result}
    </div>
  );
};

export default ListaUm;
