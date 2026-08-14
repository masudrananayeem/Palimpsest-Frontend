import useLocalStorage from "./useLocalStorage";

export default function useRecentArtifacts() {
  const [recent, setRecent] = useLocalStorage("palimpsest-recent", []);

  const addRecent = (id) => {
    setRecent((current) => [id, ...current.filter((item) => item !== id)].slice(0, 8));
  };

  return { recent, addRecent, clearRecent: () => setRecent([]) };
}
