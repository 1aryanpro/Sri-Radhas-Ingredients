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

    let searchQuery = $state(page.url.searchParams.get("search"));
    if ((() => searchQuery)() == null) searchQuery = "";

    const filteredItems = $derived.by(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return db;

        const scored = db
            .map((item) => {
                const name = item.item_name ?? "";
                const n = name.toLowerCase();

                let score = Infinity;
                const idx = n.indexOf(q);
                if (idx === 0)
                    score = 0; // starts with
                else if (idx > 0)
                    score = 1; // contains
                else score = 2; // no match

                return { item, score, idx, nameLen: n.length };
            })
            .filter((x) => x.score !== 2)
            .sort(
                (a, b) =>
                    a.score - b.score || a.idx - b.idx || a.nameLen - b.nameLen,
            );

        return scored.map((x) => x.item);
    });

    async function checkLogin() {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        auth = user != null;
    }
    checkLogin();

    async function toggleFlag(id, i, flag_id) {
        let flags = ["is_vegan", "is_gf", "is_jain"];
        let flag = flags[flag_id];

        let curr = filteredItems[i][flag];
        filteredItems[i][flag] = !curr;

        let obj = {};
        obj[flag] = !curr;

        await supabase.from("Items").update(obj).eq("id", id);
    }
</script>

<AuthModal triggerText="Admin" onSubmit={checkLogin} />
<div class="container">
    <div class="search-container">
        <label class="icon" for="search"
            ><i class="fa fa-magnifying-glass"></i></label
        >
        <input
            type="text"
            name="search"
            placeholder="Search items..."
            bind:value={searchQuery}
        />

        <div class="add">
            <ItemModal
                triggerText="New"
                submitText="Create"
                item_name={searchQuery}
                {onUpdate}
            />
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Ingredients</th>
                <th></th>
                <th></th>
            </tr>
        </thead><tbody>
            {#each filteredItems as { id, item_name, ingredients, is_vegan, is_gf, is_jain }, i}
                <tr>
                    <td>{item_name}</td>
                    <td>{ingredients}</td>
                    <td>
                        <div class="badges">
                            <span
                                onclick={() => toggleFlag(id, i, 0)}
                                class:active={is_vegan}
                                class="vegan">V</span
                            >
                            <span
                                onclick={() => toggleFlag(id, i, 1)}
                                class:active={is_gf}
                                class="gluten">G</span
                            >
                            <span
                                onclick={() => toggleFlag(id, i, 2)}
                                class:active={is_jain}
                                class="jain">J</span
                            >
                        </div>
                    </td>
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

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
    }

    span {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        width: 32px;
        height: 32px;
        border-radius: 50%;

        background: #aaa;
        color: #fff;

        font-weight: 600;
    }

    .badges {
        display: flex;
        gap: 8px; /* space between circles */
        align-items: center;
    }

    .vegan.active {
        background: saddlebrown;
    }

    .gluten.active {
        background: goldenrod;
    }

    .jain.active {
        background: darkgreen;
    }

    .container {
        width: 90vw;
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
    }

    td {
        white-space: nowrap;
        overflow: hidden;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    @media (max-width: 720px) {
        table,
        thead,
        tbody,
        tr,
        th,
        td {
            display: block;
        }

        thead {
            display: none; /* hide header on mobile */
        }

        tbody tr {
            border: 2px solid #000;
            border-radius: 16px;
            padding: 0.75rem;
            background-color: #f9f9f9;
            margin: 0.75rem 0;
        }

        tbody td {
            border: none;
            padding: 0;
            margin-bottom: 0.25rem;
        }

        tbody td:first-child {
            font-size: 1.25rem;
            overflow: unset;
            max-width: none;
            word-break: break-word;
            white-space: normal;
            line-height: 1.35;
        }

        tbody td:nth-child(3), tbody td:nth-child(4) {
            display: inline-block;
            margin-right: 20px;
        }

        /* Make ingredients wrap nicely */
        tbody td:nth-child(2) {
            max-width: none;
            word-break: break-word;
            white-space: normal;
            line-height: 1.35;
        }

        .badges {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
    }
</style>
