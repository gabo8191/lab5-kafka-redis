let selectedMovie = "";

function selectMovie(title) {
  selectedMovie = title;
  const ageInput = document.getElementById('age');
  ageInput.addEventListener('input', () => {
    const parentEmailContainer = document.getElementById('parentEmailContainer');
    parentEmailContainer.style.display = ageInput.value < 18 ? 'block' : 'none';
  });
  const modal = new bootstrap.Modal(document.getElementById('userModal'));
  modal.show();
}

document.getElementById('userForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const age = document.getElementById('age').value;
  const parentEmail = document.getElementById('parentEmail').value;

  const event = {
    username,
    age,
    parentEmail: age < 18 ? parentEmail : null,
    movie: selectedMovie,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch('/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert('Error al enviar el formulario.');
  }

  const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
  modal.hide();
});

document.addEventListener('DOMContentLoaded', function () {
  fetch('/movies')
    .then(response => response.json())
    .then(movies => {
      const moviesContainer = document.getElementById('movies-container');
      movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('col-md-4');

        movieCard.innerHTML = `
          <div class="card">
            <img src="${movie.image}" class="card-img-top" alt="${movie.title}" onclick="selectMovie('${movie.title}')">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
            </div>
          </div>
        `;

        moviesContainer.appendChild(movieCard);
      });
    })
    .catch(error => console.error('Error al cargar las películas:', error));
});
