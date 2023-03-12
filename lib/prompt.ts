export function generatePrompt(
  ingredients: Array<string>,
  type: string,
  size: string,
) {
  return `Gerar uma receita tentando utilizar apenas os seguintes ingredientes: ${ingredients}. A receita será feita para ${size} pessoa(s) e o seu foco será ${
    type === "tasty"
      ? "ser mais saborosa e não necessariamente ser saudável"
      : "ser mais saudável e não necessariamente ser saborosa"
  }. Listar os ingredientes neceessários e o modo de preparo, com menos de 1000 caracteres. Por fim, desejar um bom apetite no final.`;
}
