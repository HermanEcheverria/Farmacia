import { createSignal, onMount } from "solid-js";
import { API_URL } from "../utils/api";

const [pages, setPages] = createSignal<any[]>([]);

export function usePages() {
  onMount(async () => {
    try {
      const res = await fetch(`${API_URL}/pages`);
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error("Error al cargar páginas:", err);
    }
  });
  return { pages };
}
