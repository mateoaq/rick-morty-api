<script>
  import Card from "./Card.svelte";
  export let title;
  export let results = [];
  console.log(results);
</script>

<style>
  .Characters {
    margin: 20px 0;
  }
  .title {
    text-align: center;
    margin-top: 20px;
  }
  .title h4 {
    font-size: 48px;
  }
  .card-container {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
    justify-items: center;
  }
  @media (max-width: 768px) {
    .card-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 614px) {
    .card-container {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>

<div class="Characters">
  <div class="container">
    <div class="title">
      <h4>{title}</h4>
    </div>
    <div class="card-container">
      {#each results as result}
        {#if result == results[0] || result == results[1] || result == results[2] || result == results[3] || result == results[4]}
          <Card {...result} />
        {/if}
      {:else}
        <p>Loading..</p>
      {/each}
    </div>

  </div>
</div>
