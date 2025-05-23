<script>
    import { supabase } from "$lib/supabase";
    import { onMount } from "svelte";
    import Modal from "./Modal.svelte";

    const TABLE = "Items";

    let email = $state(""),
        password = $state("");

    let {
        triggerText = "Authenticate",
        submitText = "Log In",
        onSubmit,
    } = $props();

    let isOpen = $state(true);

    onMount(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user != null) isOpen = false;
    });

    async function submit() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const { error } = await supabase.auth.signInWithPassword({
            email: emailPattern.test(email) ? email : email + "@sriradhas.com",
            password,
        });

        if (error != null) isOpen = false;

        onSubmit();
    }
</script>

{#snippet form()}
    <div class="form-group">
        <label for="username">Username</label>
        <input type="text" name="username" bind:value={email} />

        <label for="password">Password</label>
        <input type="password" name="password" bind:value={password} />

        <button class="submit" onclick={submit}>{submitText}</button>
    </div>
{/snippet}

{#if isOpen}
    <div class="modal">
        <div
            class="backdrop"
            aria-label="Modal Backdrop"
            role="button"
            tabindex="0"
        ></div>

        <div class="content-wrapper">
            {@render form()}
        </div>
    </div>
{/if}

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        width: 70vw;
        max-width: 400px;
    }

    button {
        font-size: 1.5rem;
    }

    button.submit,
    hr {
        margin-bottom: 0.75rem;
    }

    label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
    }

    input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        outline: none;
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }

    input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
    }

    div.modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;

        display: flex;
        justify-content: center;
        align-items: center;
    }
    div.backdrop {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
    }
    div.content-wrapper {
        z-index: 10;
        border-radius: 0.3rem;
        background-color: white;
        overflow: hidden;
        padding: 1rem;
    }
</style>
