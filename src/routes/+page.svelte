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

    const filteredItems = $derived.by(() => {
        if (searchQuery.length < 2) return [];

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

    let clicked = $state(-1);
    let selectedID = $derived(
        clicked == -1
            ? filteredItems.length >= 1 &&
              filteredItems[0].item_name.toLowerCase() ==
                  searchQuery.toLowerCase()
                ? filteredItems[0].id
                : -1
            : clicked,
    );
    let selected = $derived(
        selectedID == -1 ? undefined : db.filter((i) => i.id == selectedID)[0],
    );
</script>

<div class="container">
    <img src="/Sri-Radhas-Logo.png" alt="" />
    {#if selectedID == -1}
        <div
            class="search-container"
            class:center-screen={searchQuery.length < 2}
        >
            <div class="input-wrap">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input
                    type="text"
                    name="search"
                    placeholder="Enter item name for ingredients"
                    bind:value={searchQuery}
                    class:active={filteredItems.length != 0}
                />
                {#if searchQuery.length >= 2}
                    <button
                        onclick={() => (searchQuery = "")}
                        onmousedown={(e) => e.preventDefault()}
                    >
                        <i class="fa fa-circle-xmark"></i>
                    </button>
                {/if}
            </div>
        </div>

        {#each filteredItems as { id, item_name, ingredients, is_vegan, is_gf, is_jain }}
            <button
                class="item"
                onclick={() => {
                    clicked = id;
                }}
            >
                <h2>{item_name}</h2>
                <div class="badges">
                    <span class:shown={is_vegan} class="vegan">V</span>
                    <span class:shown={is_gf} class="gluten">G</span>
                    <span class:shown={is_jain} class="jain">J</span>
                </div>
            </button>
        {/each}
    {:else}
        <div class="center-screen">
            <div class="card">
                <button
                    onclick={() =>
                        clicked == -1 ? (searchQuery = "") : (clicked = -1)}
                    ><i class="fa fa-xmark"></i></button
                >
                <h1>{selected.item_name}</h1>
                <div class="badges">
                    <span class:shown={selected.is_vegan} class="vegan"
                        >Vegan</span
                    >
                    <span class:shown={selected.is_gf} class="gluten"
                        >Gluten Free</span
                    >
                    <span class:shown={selected.is_jain} class="jain">Jain</span
                    >
                </div>
                <p><strong>Ingredients:</strong> {selected.ingredients}</p>
            </div>
        </div>
    {/if}
</div>

<footer>
    <div class="row">
        <a href="https://www.facebook.com/sriradhas" target="_blank"
            ><i class="fa-brands fa-square-facebook"></i></a
        >
        <a
            href="https://www.instagram.com/sriradhasveg?igsh=NTc4MTIwNjQ2YQ=="
            target="_blank"><i class="fa-brands fa-instagram"></i></a
        >
        <a
            href="https://chat.whatsapp.com/ChBbDRUUSyf3N6bX9MxVsO"
            target="_blank"><i class="fa fa-whatsapp"></i></a
        >
    </div>

    <div class="row">
        <ul>
            <li><a href="">Terms & Conditions</a></li>
            <li>
                <i class="fa fa-phone"></i>
                <a href="tel:15107717759"> +1 (510) 771-7759</a>
            </li>
            <li><i class="fa fa-envelope"></i> info@sriradhas.com</li>
            <li>
                <i class="fa fa-location-dot"></i> 680 E Caleveras Blvd, Milpitas
            </li>
        </ul>
    </div>

    <div class="row">
        Copyright © 2026 Sri Radha's Veg Cuisine - All rights reserved
    </div>
</footer>

<style>
    :global(*) {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
    }

    .center-screen {
        min-height: 50vh;
        display: flex;
        align-items: center; /* vertical center */
        justify-content: center; /* horizontal center (optional) */
    }

    img {
        width: 100%;
        max-width: 400px;
        mix-blend-mode: darken;
        border-bottom: 2px solid #2d1b00;
    }

    :global(body) {
        background-color: #ffead3;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .card {
        position: fixed;
        width: 80%;
        margin: auto;
        padding: 10px;
        border-radius: 5px;
        background-color: white;
        border: 2px solid #2d1b00;
    }

    .card button {
        display: flex;

        background-color: #2d1b00;
        color: white;

        position: absolute;
        top: -15px;
        left: -15px;

        width: 30px;
        height: 30px;
        border-radius: 100px;

        align-items: center;
        justify-content: center;
    }

    .card button:hover {
        background-color: #777;
    }

    .card .badges {
        margin-bottom: 10px;
        margin-top: 5px;
    }

    .card p {
        text-align: left;
    }

    span {
        display: none;
        align-items: center;
        justify-content: center;

        padding: 0px 8px;
        height: 25px;
        border-radius: 100px;

        background: #aaa;
        color: #fff;

        font-weight: 600;
    }

    .badges {
        margin-left: auto; /* ⬅️ pushes badges to the right */
        display: flex;
        gap: 6px;
    }

    .shown {
        display: inline-flex;
    }

    .vegan {
        background: saddlebrown;
    }

    .gluten {
        background: goldenrod;
    }

    .jain {
        background: darkgreen;
    }

    .container {
        width: 60vw;
        margin: 0 auto 10px auto;
        text-align: center;
    }

    .search-container {
        display: flex;
        align-items: center; /* vertical center */
        justify-content: center; /* horizontal center (optional) */
        width: 100%;
    }

    .input-wrap {
        position: relative;
        width: 100%;
        margin-top: 10px;
    }

    .input-wrap > i {
        position: absolute;
        top: 50%;
        color: black;
        transform: translatey(-50%);
        left: 10px;
        pointer-events: none;
    }

    .input-wrap button {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .input-wrap button:hover {
        background: none;
    }

    .input-wrap button i {
        font-size: 1.1rem;
        color: #666;
    }

    input {
        display: inline-block;
        padding: 0.5rem;
        width: 100%;
        font-size: 1.25rem;
        max-height: 40px;
        border-radius: 20px;
        border: 2px solid black;
        background-color: #ffead3;
        padding-left: 36px;
        box-sizing: border-box;
    }

    input::placeholder {
        color: gray;
    }

    input.active {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    button {
        padding: 0.5rem;
        font-size: 1rem;
        background: #ddd;
        border: none;
        cursor: pointer;
        transition: background-color 0.25s linear;
    }

    button:hover {
        background: #aaa;
    }

    .item {
        border: 2px solid #2d1b00;
        border-top: none;
        padding: 0.5rem;
        width: 100%;

        display: flex;
        gap: 8px; /* space between circles */
        align-items: center;
    }

    @media (max-width: 600px) {
        .container {
            width: 95%;
        }

        h2 {
            font-size: 1.25rem;
            margin-bottom: 0;
        }
    }

    footer {
        background: #2d1b00;
        text-align: center;
        padding: 5%;
        margin-top: auto;
    }

    footer .row {
        width: 100%;
        margin: 1% 0%;
        padding: 0.6% 0%;
        color: white;
        font-size: 0.8em;
    }

    footer .row a {
        text-decoration: none;
        color: white;
        transition: 0.5s;
        text-decoration: underline;
    }

    footer .row a:hover {
        color: grey;
    }

    footer .row ul {
        width: 100%;
    }

    footer .row ul li {
        display: inline-block;
        display: block;
        margin: 10px 0px;
        text-align: center;
        font-size: 1rem;
    }

    footer .row a i {
        font-size: 2em;
        margin: 0% 3%;
    }
</style>
