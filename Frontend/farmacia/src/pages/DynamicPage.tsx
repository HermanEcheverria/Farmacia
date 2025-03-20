import { useParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import { API_URL } from "../utils/api";

export default function DynamicPage() {
  const params = useParams(); // extrae el slug
  const [pageData, setPageData] = createSignal<any>(null);
  const [error, setError] = createSignal("");

  onMount(async () => {
    try {
      const res = await fetch(`${API_URL}/pages/${params.slug}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Página no encontrada o deshabilitada");
      const data = await res.json();
      setPageData(data);
    } catch (err: any) {
      setError(err.message);
    }
  });

  return (
    <div class="container mx-auto py-8 px-4">
      <Show when={!error()} fallback={<p class="text-red-600 text-center">{error()}</p>}>
        {pageData() && (
          <>
            <h1 class="text-3xl font-bold mb-4">{pageData().title}</h1>
            {/* Asumimos que el content viene en HTML, si es Markdown, podrías convertirlo */}
            <div innerHTML={pageData().content} class="prose max-w-none"></div>
          </>
        )}
      </Show>
    </div>
  );
}
