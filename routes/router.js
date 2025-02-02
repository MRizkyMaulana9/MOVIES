const express = require("express");
const userController = require("../controllers/userController");
const movieController = require("../controllers/movie-controller");
const movie_lokalController = require("../controllers/movie_lokalController");
const router = express.Router();
const { auth, adminAuth } = require("../middlewares/auth");
const upload = require("../config/multer");

router.post("/register", userController.userRegistration);
router.post("/user/login", userController.userLogin);
router.get("/alluser", auth, adminAuth, userController.getAllUsers);
router.get("/user/:id", auth, userController.getUserProfile);
router.put("/updatedata/:id", auth, userController.updateUser);
router.delete("/deletedata", auth, userController.deleteUser);
router.get("/movies", movieController.searchMovie); //API
router.get("/genres", movieController.getGenres); //API
router.get("/trending-movies", auth, movieController.getTrendingMovies); //API
router.post(
  "/localmovies",
  auth,
  adminAuth,
  upload.single("backdrop"),
  movie_lokalController.addMovie
);
router.put(
  "/updatemovie/:id",
  auth,
  adminAuth,
  movie_lokalController.updateMovie
);
router.delete(
  "/deletemovie",
  auth,
  adminAuth,
  movie_lokalController.deleteMovie
);
router.get("/allmovies", auth, movie_lokalController.getAllmovie);
router.get("/searchlocalmovie", auth, movie_lokalController.searchMovieLokal);
router.post(
  "/addlocalFavorite",
  auth,
  movie_lokalController.addFavoriteLokalMovies
);
router.get("/localgenres", auth, movie_lokalController.getmovielokalgenre);
router.get("/favorite-movies", auth, movie_lokalController.getFavoriteMovies);
router.delete(
  "/favorites/:movieId",
  auth,
  movie_lokalController.removeFavoritelokalMovie
);
router.post("/reviews", auth, movie_lokalController.addReview);
router.get("/reviews", auth, movie_lokalController.getMovieReviews);
module.exports = router;
