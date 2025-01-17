import 'regenerator-runtime/runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { getJSON,sendJSON } from './helper.js';
import { async } from 'regenerator-runtime';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: '',
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

 return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    cookingTime: recipe.cooking_time,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    image: recipe.image_url,
   sourceUrl: recipe.source_url,
    ...(recipe.key && {key:recipe.key})
  };
}

export const loadRecipe = async function (id) {
  try {

    const data = await getJSON(`${API_URL}${id}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await getJSON(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key:rec.key})
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.log(err);

    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings
  });

  state.recipe.servings = newServings;
};

const presistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
  // Add  bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if ((recipe.id = state.recipe.id)) state.recipe.bookmarked = true;

  presistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);

  state.bookmarks.splice(index, 1);

  // Mark current recipe as  not bookmark
  if ((id = state.recipe.id)) state.recipe.bookmarked = false;

  presistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks()

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {

        const ingArr = ing[1].split(',').map(el => el.trim());

        const [quantity, unit, description] = ingArr;

        if (ingArr.length !== 3)
          throw Error('Wrong ingredients format , Please try again');

        return { quantity: quantity ? +quantity : null, unit, description };
      });
    
     const recipe = {
        title: newRecipe.title,
        publisher: newRecipe.publisher,
        cooking_time: +newRecipe.cookingTime,
        servings: +newRecipe.servings,
        ingredients: newRecipe.ingredients,
        image_url: newRecipe.image,
        source_url: newRecipe.sourceUrl,
        ingredients,
    };
    
    const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe)
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe)
    
    
  } catch (err) {
    throw err;
  }

  
};
