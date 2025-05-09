<script>
    import { supabase } from "$lib/supabase.js";
    import { page } from "$app/state";

    let db = $state([]);

    async function onUpdate() {
        let { data } = await supabase.from("Ingredients").select("*");
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

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Ingredients</th>
            </tr>
        </thead>
        <tbody>
            {#each filteredIngredients as { id, item_name, ingredients }}
                <tr>
                    <td>{item_name}</td>
                    <td>{ingredients}</td>
                </tr>
            {/each}
        </tbody>
    </table>
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

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        font-size: 1rem;
        text-align: left;
    }

    th,
    td {
        max-width: 50vw;
        border: 1px solid #ddd;
        padding: 0.75rem;
    }

    td:nth-child(3) {
        width: 5%;
    }

    th {
        background-color: #f4f4f4;
        font-weight: bold;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    @media (max-width: 600px) {
        table {
            font-size: 0.9rem;
        }

        th,
        td {
            padding: 0.5rem;
        }
    }
</style>
