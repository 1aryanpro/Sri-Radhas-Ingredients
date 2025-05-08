<script>
    import AuthModal from "$lib/components/AuthModal.svelte";
    import ItemModal from "$lib/components/ItemModal.svelte";
    import { supabase } from "$lib/supabase.js";
    import { page } from "$app/state";

    import QR from "@svelte-put/qr/img/QR.svelte";

    let db = $state([]);

    let auth = $state(false);

    async function onUpdate() {
        let { data } = await supabase.from("Ingredients").select("*");
        db = data.sort((a, b) => a.item_name.localeCompare(b.item_name));
    }
    onUpdate();

    let searchQuery = $state(page.url.searchParams.get("search"));
    if (searchQuery == null) searchQuery = "";

    // Update the filtered list whenever the search query changes
    let filteredIngredients = $derived(
        db.filter(({ item_name }) =>
            item_name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function checkLogin() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        auth = user != null;
    }
    checkLogin();
</script>

<AuthModal triggerText="Auth" onSubmit={checkLogin} />

<div class="container">
    <div class="search-container">
        <label class="icon" for="search">🔍</label>
        <input
            type="text"
            name="search"
            placeholder="Search items..."
            bind:value={searchQuery}
        />

        {#if auth}
            <div class="add">
                <ItemModal
                    triggerText="Add New"
                    submitText="Create"
                    item_name={searchQuery}
                    {onUpdate}
                />
            </div>
        {/if}
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Ingredients</th>
                {#if auth}
                    <th></th>
                    <th></th>
                {/if}
            </tr>
        </thead>
        <tbody>
            {#each filteredIngredients as { id, item_name, ingredients }}
                <tr>
                    <td>{item_name}</td>
                    <td>{ingredients}</td>
                    {#if auth}
                        <td>
                            <ItemModal
                                triggerText="Edit"
                                submitText="Save Changes"
                                {id}
                                {item_name}
                                {ingredients}
                                {onUpdate}
                            />
                        </td>
                        <td>
                            <QR
                                data={`ingredients.sriradhas.com/${id}`}
                                moduleFill="black"
                                backgroundFill="white"
                                width="100"
                                height="100"
                                correction='L'
                            />
                        </td>
                    {/if}
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

    .add {
        margin-left: auto;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
