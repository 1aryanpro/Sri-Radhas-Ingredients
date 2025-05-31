<script>
    import AuthModal from "$lib/components/AuthModal.svelte";
    import ItemModal from "$lib/components/ItemModal.svelte";

    import { supabase } from "$lib/supabase.js";
    import { page } from "$app/state";

    import QR from "@svelte-put/qr/img/QR.svelte";

    let db = $state([]);

    let auth = $state(false);

    async function onUpdate() {
        let { data } = await supabase.from("Items").select("*");
        db = data
            .sort((a, b) => a.item_name.localeCompare(b.item_name))
            .map((i) => {
                i.print = false;
                return i;
            });
    }
    onUpdate();

    let printFilter = $state(false);

    let searchQuery = $state(page.url.searchParams.get("search"));
    if ((() => searchQuery)() == null) searchQuery = "";

    let filteredIngredients = $derived(
        db
            .filter(({ item_name }) =>
                item_name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .filter(({ print }) => (printFilter ? print : true)),
    );

    async function checkLogin() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        auth = user != null;
    }
    checkLogin();

    $inspect(filteredIngredients);
</script>

<AuthModal triggerText="Admin" onSubmit={checkLogin} />
<div class="container">
    <div class="search-container">
        <label class="icon" for="search">🔍</label>
        <input
            type="text"
            name="search"
            placeholder="Search items..."
            bind:value={searchQuery}
        />

        <div class="add">
            <ItemModal
                triggerText="Add New"
                submitText="Create"
                item_name={searchQuery}
                {onUpdate}
            />
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th><input type="checkbox" bind:checked={printFilter} />🖨️</th>
                <th>Item</th>
                <th>Ingredients</th>
                <th></th>
            </tr>
        </thead><tbody>
            {#each filteredIngredients as { id, item_name, ingredients }, i}
                <tr>
                    <td
                        ><input
                            type="checkbox"
                            bind:checked={filteredIngredients[i].print}
                        /></td
                    >
                    <td>{item_name}</td>
                    <td>{ingredients}</td>
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
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<div class="print">
    {#each filteredIngredients as { id, item_name, ingredients, print }}
        {#if print}
            <div class="label">
                <h1>{item_name}</h1>
                <QR
                    data={`ingredients.sriradhas.com/${id}`}
                    moduleFill="white"
                    backgroundFill="#ff3b30"
                    width="100"
                    height="100"
                    correction="L"
                    anchorInnerFill="white"
                    anchorOuterFill="white"
                />
            </div>
        {/if}
    {/each}
</div>

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
    }

    .print {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 1rem;
        row-gap: 1rem;
        padding: 0.5rem;
        background: #ff3b30;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-size: 18px;
    }

    .label {
        border: 4px solid white;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        height: 1.5in;
        color: white;
        padding: 0 0.1in;
    }

    .label h1 {
        width: 75%;
    }

    @media print {
        .container {
            display: none;
        }

        .print {
            display: grid;
        }
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

    input[type="checkbox"] {
        width: auto;
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
        width: 50%;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    @media (max-width: 600px) {
        table {
            font-size: 0.9rem;
        }

        td {
            padding: 0.5rem;
        }
    }
</style>
