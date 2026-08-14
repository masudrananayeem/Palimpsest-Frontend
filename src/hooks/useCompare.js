import useLocalStorage from "./useLocalStorage";

export default function useCompare() {
  const [compare, setCompare] = useLocalStorage("palimpsest-compare", []);
  const toggleCompare = (id) => {
    setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  };
  return { compare, toggleCompare, clearCompare: () => setCompare([]), isCompared: (id) => compare.includes(id) };
}
