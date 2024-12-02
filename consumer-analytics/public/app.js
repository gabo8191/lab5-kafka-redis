const socket = io('http://localhost:3001');

// Función para actualizar la lista de las top 10 películas
function updateTop10(movies) {
  const top10List = document.getElementById('top10-list');
  top10List.innerHTML = '';  // Limpiar la lista actual

  movies.forEach(([movie, count]) => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `${movie} <span class="badge rounded-pill">${count}</span>`;
    top10List.appendChild(listItem);
  });
}

// Escuchar las actualizaciones del top 10 desde el servidor
socket.on('top10', (top10Movies) => {
  updateTop10(top10Movies);
});
