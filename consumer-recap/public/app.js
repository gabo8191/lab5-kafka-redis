// Obtener el formulario y el contenedor de recap
const form = document.getElementById('username-form');
const recapDiv = document.getElementById('recap');
const movieList = document.getElementById('movie-list');

// Función para obtener el recap desde el backend
async function getRecap(username) {
  try {
    const response = await fetch(`/recap?username=${username}`);
    const data = await response.json();

    if (data.recap.length === 0) {
      movieList.innerHTML = '<li class="list-group-item">No hay películas vistas.</li>';
    } else {
      movieList.innerHTML = data.recap.map(({ movie, timestamp }) => {
        return `<li class="list-group-item">Película: ${movie} <br> Visto en: ${new Date(timestamp).toLocaleString()}</li>`;
      }).join('');
    }

    recapDiv.classList.remove('d-none');
  } catch (error) {
    console.error('Error al obtener el recap:', error);
    movieList.innerHTML = '<li class="list-group-item">Error al obtener los datos.</li>';
  }
}

// Manejar el envío del formulario
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;

  if (username) {
    getRecap(username);
  } else {
    alert('Por favor, ingresa un nombre de usuario.');
  }
});
