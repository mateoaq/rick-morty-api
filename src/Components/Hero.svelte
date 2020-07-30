<style>
  * {
    margin: 0;
    padding: 0;
  }
  .Hero {
    background-color: #3d4041;
    height: 428px;
    display: flex;
  }
  .container {
    margin: 0 auto;
    align-self: center;
  }
  .title {
    text-align: center;
  }
  .title h2 {
    color: #1fcf2a;
    font-size: 144px;
    font-weight: bold;
  }
  .subtitle {
    text-align: center;
  }
  .subtitle h3 {
    color: #ffff;
    font-size: 96px;
    font-weight: 100;
  }
  @media (max-width: 768px) {
    .title h2 {
      font-size: 62px;
    }
    .subtitle h3 {
      font-size: 48px;
    }
  }
  @media (max-width: 414px) {
    .title h2 {
      font-size: 36px;
    }
    .subtitle h3 {
      font-size: 36px;
    }
  }
</style>

<div class="Hero">
  <div class="container">
    <div class="title-container">
      <div class="title">
        <h2>Rick and Morty</h2>
      </div>
    </div>
    <div class="subtitle-container">
      <div class="subtitle">
        <h3>Con Svelte</h3>
      </div>
    </div>
  </div>
</div>
