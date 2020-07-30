<script>
  import { onMount } from "svelte";
  import Header from "./Components/Header.svelte";
  import Hero from "./Components/Hero.svelte";
  import TotalC from "./Components/TotalC.svelte";
  import Characters from "./Components/Characters.svelte";
  import Prefooter from "./Components/Prefooter.svelte";
  import Footer from "./Components/Footer.svelte";

  let data = {};
  let counts = "";
  let results = "";
  const API = "https://rickandmortyapi.com/api/character";

  onMount(async () => {
    const response = await fetch(API);
    data = await response.json();
    counts = data.info.count;
    results = data.results;
    console.log(results[5]);
  });
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }
</style>

<main>
  <Header />
  <Hero />
  <TotalC count={counts} />
  <Characters title={'5 Principales'} {results} />
  <Prefooter />
  <Footer />

</main>
