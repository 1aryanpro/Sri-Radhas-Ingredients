<script lang="ts">
    let isOpen = $state(false);
    const open = () => (isOpen = true);
    const close = () => (isOpen = false);

    let { triggerText = "Open Modal", content } = $props();

    function keydown(e: KeyboardEvent) {
        e.stopPropagation();
        if (e.key === "Escape") {
            close();
        }
    }
</script>

<button onclick={open}>{triggerText}</button>

{#if isOpen}
    <div class="modal">
        <div
            class="backdrop"
            onclick={close}
            onkeydown={keydown}
            aria-label="Modal Backdrop"
            role="button"
            tabindex="0"
        ></div>

        <div class="content-wrapper">
            {@render content(close)}
        </div>
    </div>
{/if}

<style>
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

    @media (max-width: 720px) {
        .content-wrapper {
            width: 100%;
        }
    }
</style>
