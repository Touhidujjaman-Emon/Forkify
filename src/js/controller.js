const recipeContainer = document.querySelector('.recipe');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const showRecipe = async function () {
  try {
    const res = await fetch('https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886');
    const data = await res.json()
    if (!res.ok) throw new Error(`${data.message}(${res.status})`)
    let { recipe } = data.data;
    recipe = {
      id: recipe.id,
      publisher: recipe.publisher,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      title: recipe.title,
      image: recipe.image_url,
      cookingTime: recipe.cooking_time,
      sourceUrl:recipe.source_url,
    }
    console.log(recipe);
  } catch (err) {
    // alert(err);
    }
}

showRecipe()
