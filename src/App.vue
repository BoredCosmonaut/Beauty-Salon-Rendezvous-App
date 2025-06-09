<template>
  <div class="main">
      <nav class="nav">
        <RouterLink :to="`/`" class="navText">Home</RouterLink>
        <img src="@/assets/logo (2).png" alt="" class="logo">
        <RouterLink :to="`/submit`" class="navText">
          Başvuru Yapın!
        </RouterLink>
      </nav>
  </div>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body{
  background-color: #E4CDDD;
  padding: 0;
  margin: 0;
}

.main {
  display: flex;
  flex-direction: column;
  width: auto;
  height: auto;
}

.nav {
  width: 100%;
  height: 50px;
  background-color: #7B1D26;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10PX;
  padding-bottom: 10px;
}

.navText {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.logo{
  width: 80px;
  height: 80px;
}
</style>
