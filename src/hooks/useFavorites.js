import useLocalStorage from "./useLocalStorage";

export default function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage("palimpsest-favorites", []);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return {
    favorites,
    isFavorite: (id) => favorites.includes(id),
    toggleFavorite,
    clearFavorites: () => setFavorites([]),
  };
}
