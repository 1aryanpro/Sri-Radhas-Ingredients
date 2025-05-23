<script>
    import { supabase } from "$lib/supabase.js";
    import { page } from "$app/state";

    let db = $state([]);

    async function onUpdate() {
        let { data } = await supabase.from("Items").select("*");
        db = data.sort((a, b) => a.item_name.localeCompare(b.item_name));
    }
    onUpdate();

    let searchQuery = $state(page.url.searchParams.get("search"));
    if ((() => searchQuery)() == null) searchQuery = "";

    // Update the filtered list whenever the search query changes
    let filteredIngredients = $derived(
        db.filter(({ item_name }) =>
            item_name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
</script>

<div class="container">
    <div class="search-container">
        <label class="icon" for="search">🔍</label>
        <input
            type="text"
            name="search"
            placeholder="Search items..."
            bind:value={searchQuery}
        />
    </div>

    {#each filteredIngredients as { id, item_name, ingredients }}
        <div class="card">
            <h2>{item_name}:</h2>
            <p3>{ingredients}</p3>
        </div>
    {/each}
</div>

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
    }

    .container {
        width: 60vw;
        margin: 5vh auto 0 auto;
    }

    .search-container {
        border: 1px solid #ddd;
        display: flex;
        border-radius: 1rem;
        overflow: hidden;
    }

    .icon {
        display: flex;
        align-items: center;
        background: #ddd;
        padding: 0 0.5rem;
    }

    input {
        display: inline-block;
        padding: 0.5rem;
        width: 75%;
        font-size: 1rem;
        border: none;
    }

    :global(button) {
        padding: 0.5rem;
        font-size: 1rem;
        background: #ddd;
        border: none;
        cursor: pointer;
        transition: background-color 0.5s linear();
    }

    :global(button:hover) {
        background: #aaa;
    }

    .card {
        border: 2px solid #ddd;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }

    .card h2 {
        margin-bottom: 0.5rem;
    }

    @media(max-width: 600px) {
        .container {
            width: 95%;
        }

        .card h2 {
            font-size: 1.25rem;
            margin-bottom: 0;
        }
    }
</style>
