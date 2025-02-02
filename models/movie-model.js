const db = require("../config/db");
const createMovie = (movieData) => {
  return {
    id: movieData.id,
    title: movieData.original_title,
    overview: movieData.overview,
    backdrop_path: movieData.backdrop_path,
  };
};

const createGenre = (genreData) => {
  return {
    id: genreData.id,
    name: genreData.name,
  };
};

// Membuat format film sesuai dengan yang diinginkan
const getMovie = (movieData) => {
  return {
    id: movieData.id,
    title: movieData.original_title,
    overview: movieData.overview,
    backdrop_path: movieData.backdrop_path,
  };
};
//error

module.exports = {
  createMovie,
  createGenre,
  getMovie,
};
