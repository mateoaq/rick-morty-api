<script>
  export let count;
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }
  .TotalC {
    display: flex;
    background-color: #2593b8;
    color: #fff;
    height: 200px;
  }
  .container {
    margin: 0 auto;
    align-self: center;
  }
  .title-container h3 {
    font-size: 72px;
    text-align: center;
  }
  .subtitle-container h4 {
    font-size: 72px;
    text-align: center;
  }
  @media (max-width: 768px) {
    .title-container h3 {
      font-size: 48px;
    }
    .subtitle-container h4 {
      font-size: 48px;
    }
  }
  @media (max-width: 414px) {
    .title-container h3 {
      font-size: 24px;
    }
    .subtitle-container h4 {
      font-size: 24px;
    }
  }
</style>

<div class="TotalC">
  <div class="container">
    <div class="title">
      <div class="title-container">
        <h3>Personajes Totales</h3>
      </div>
    </div>
    <div class="subtitle">
      <div class="subtitle-container">
        <h4>{count}</h4>
      </div>
    </div>
  </div>
</div>
