<style>
  .Prefooter {
    height: 200px;
    background-color: #2593b8;
  }
  .wrapper {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 10px;
    grid-template-areas: ". a b c .";
  }
  .item1,
  .item2,
  .item3 {
    align-self: center;
    justify-self: center;
    width: 100px;
    height: 100px;
  }
  .item1 {
    grid-area: a;
  }
  .item2 {
    grid-area: b;
  }
  .item3 {
    grid-area: c;
  }
  i {
    width: 100px;
    height: 100px;
    text-align: center;
    font-size: 100px;
  }
  .fa-linkedin {
    color: black;
  }
  .fa-linkedin:hover {
    color: #0077b5;
  }
  .fa-github-square {
    color: black;
  }
  .fa-github-square:hover {
    color: white;
  }
  .fa-whatsapp-square {
    color: black;
  }
  .fa-whatsapp-square:hover {
    color: #05cd51;
  }
  @media (max-width: 414px) {
    .Prefooter {
      height: 318px;
    }
    .wrapper {
      grid-template-areas:
        "a"
        "b"
        "c";
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: repeat(3, 1fr);
    }
  }
</style>

<div class="Prefooter">
  <div class="wrapper">
    <div class="item1">
      <a
        href="https://www.linkedin.com/in/mateo-aquino-3466291aa/"
        target="__blank">
        <i class="fab fa-linkedin" />
      </a>
    </div>
    <div class="item2">
      <a href="https://github.com/mateoaq" target="__blank">
        <i class="fab fa-github-square" />
      </a>
    </div>
    <div class="item3">
      <a
        href="https://api.whatsapp.com/send?phone=5493794375990&text=Me%20interesa%20que%20trabajemos%20juntos%20en%20un%20desarrollo!"
        target="__blank">
        <i class="fab fa-whatsapp-square" />
      </a>
    </div>
  </div>
</div>
