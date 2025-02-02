const cache = require("../config/node-cache");
const tmdbAPI = require("../config/tmdb");
const axios = require("axios");
const {
  createMovie,
  createGenre,
  saveFavoriteMovie,
  getMovie,
} = require("../models/movie-model");

const searchMovie = async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }
  if (cache.has(query)) {
    console.log(`Fetch data from cache server`);
    return res.status(200).json(cache.get(query));
  }
  try {
    const response = await tmdbAPI.get("/search/movie", {
      params: { query },
    });

    if (!Array.isArray(response.data.results)) {
      return res.status(500).json({ message: "Unexpected API response" });
    }

    const movies = response.data.results.map(createMovie);
    cache.set(query, movies);
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error.message);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};

const getGenres = async (req, res) => {
  const cacheKey = "genres";

  // Cek cache
  if (cache.has(cacheKey)) {
    console.log("Fetching genres from cache...");
    return res.status(200).json(cache.get(cacheKey));
  }

  try {
    console.log("Fetching genres from TMDB API...");
    const response = await tmdbAPI.get("/genre/movie/list", {
      params: { language: "en" },
    });

    if (!Array.isArray(response.data.genres)) {
      return res.status(500).json({ message: "Unexpected API response" });
    }

    const genres = response.data.genres.map(createGenre);

    // Simpan ke cache
    cache.set(cacheKey, genres);

    res.status(200).json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error.message);
    res.status(500).json({ message: "Failed to fetch genres" });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    console.log("🔹 getTrendingMovies API dipanggil");

    // Cek apakah query ada di cache
    if (cache.has("trending")) {
      console.log(`Fetch data from cache`);
      return res.status(200).json(cache.get("trending"));
    }

    // Request ke TMDB untuk film yang sedang tren
    const response = await tmdbAPI.get("/trending/movie/day");

    if (!Array.isArray(response.data.results)) {
      return res.status(500).json({ message: "Unexpected API response" });
    }

    const movies = response.data.results.map(getMovie);
    cache.set("trending", movies); // Simpan di cache
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error.message);
    res.status(500).json({ message: "Failed to fetch trending movies" });
  }
};
//error
module.exports = { searchMovie, getGenres, getTrendingMovies };
