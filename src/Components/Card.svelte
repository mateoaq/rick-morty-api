<script>
  export let image;
  export let name;
  export let location;
  export let status;
  export let species;
</script>

<style>
  .Card {
    text-align: center;
  }
  figure {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
  }
  .box {
    position: relative;
    overflow: hidden;
  }
  .capa {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    transform: scale(0);
    transition: 0.3s ease;
  }
  .box:hover .capa {
    transform: scale(1);
  }
  ul {
    list-style: none;
    text-align: initial;
  }
  li {
    user-select: none;
  }
</style>

<div class="Card">
  <div class="card-container">
    <figure>
      <div class="box">
        <img src={image} alt={name} />
        <div class="capa">
          <ul>
            <li>
              <h2>Location: {location.name}</h2>
            </li>
            <li>
              <h2>Status: {status}</h2>
            </li>
            <li>
              <h2>Species: {species}</h2>
            </li>
          </ul>
        </div>
      </div>
    </figure>
    <div class="container-info">
      <span>{name}</span>
    </div>
  </div>
</div>
