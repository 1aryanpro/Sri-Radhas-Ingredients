<script>
    import { supabase } from "$lib/supabase";
    import Modal from "./Modal.svelte";

    const TABLE = "Items";

    let {
        id = undefined,
        item_name = "",
        ingredients = "",
        triggerText = "Open Modal",
        submitText = "Submit Form",
        onUpdate,
    } = $props();

    async function submit(close) {
        ingredients = ingredients
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "") // Remove empty items
            .join(", ");

        if (!id) await supabase.from(TABLE).insert({ item_name, ingredients });
        else
            await supabase
                .from(TABLE)
                .update({ item_name, ingredients })
                .eq("id", id);
        close();
        onUpdate();
    }
</script>

{#snippet form(close)}
    <div class="form-group">
        <label for="item_name">Item Name:</label>
        <input
            type="text"
            id="item_name"
            name="item_name"
            bind:value={item_name}
        />

        <label for="ingredients">Ingredients:</label>
        <textarea id="ingredients" name="ingredients" bind:value={ingredients}
        ></textarea>

        <button class="submit" onclick={() => submit(close)}
            >{submitText}</button
        >
    </div>
{/snippet}

<Modal {triggerText} content={form} />

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        width: 70vw;
        max-width: 600px;
    }

    button.submit {
        font-size: 1.5rem;
    }

    label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
    }

    input[type="text"],
    textarea {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        outline: none;
        margin-bottom: 1rem;
        font-size: 1.25rem;
        resize: vertical;
        min-height: 1.75rem;
    }

    input[type="text"]:focus,
    textarea:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
    }

    @media (max-width: 720px) {
        textarea {
            font-size: 1rem;
            height: 30vh;
        }

        input[type="text"],textarea {
            width: 80vw;
        }
    }

</style>
