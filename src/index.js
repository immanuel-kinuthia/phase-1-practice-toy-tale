let addToy = false;

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector("#new-toy-btn");
  const toyFormContainer = document.querySelector(".container");
  addBtn.addEventListener("click", () => {
    // hide & seek with the form
    addToy = !addToy;
    if (addToy) {
      toyFormContainer.style.display = "block";
    } else {
      toyFormContainer.style.display = "none";
    }
  });
});


// DOM elements
const toyCollection = document.getElementById('toy-collection');
const addToyForm = document.querySelector('form'); // Assumes a form exists in index.html

// Fetch all toys from the API
function fetchToys() {
  fetch('http://localhost:3000/toys')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch toys');
      return response.json();
    })
    .then(toys => renderToys(toys))
    .catch(error => console.error('Error fetching toys:', error));
}

// Render toys as cards in the toy-collection div
function renderToys(toys) {
  toyCollection.innerHTML = ''; // Clear existing content
  toys.forEach(toy => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${toy.name}</h2>
      <img src="${toy.image}" class="toy-avatar" />
      <p>${toy.likes} Likes</p>
      <button class="like-btn" id="${toy.id}">Like ❤️</button>
    `;
    toyCollection.appendChild(card);
  });
}

// Handle form submission to add a new toy
function handleAddToy(event) {
  event.preventDefault();
  const form = event.target;
  const newToy = {
    name: form.querySelector('input[name="name"]').value,
    image: form.querySelector('input[name="image"]').value,
    likes: 0
  };

  fetch('http://localhost:3000/toys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(newToy)
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add toy');
      return response.json();
    })
    .then(toy => {
      // Add the new toy to the DOM without reloading
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h2>${toy.name}</h2>
        <img src="${toy.image}" class="toy-avatar" />
        <p>${toy.likes} Likes</p>
        <button class="like-btn" id="${toy.id}">Like ❤️</button>
      `;
      toyCollection.appendChild(card);
      form.reset(); // Clear the form
    })
    .catch(error => console.error('Error adding toy:', error));
}

// Handle like button clicks to update likes
function handleLikeClick(event) {
  if (event.target.className === 'like-btn') {
    const button = event.target;
    const id = button.id;
    const likeElement = button.previousElementSibling;
    const likeCount = parseInt(likeElement.textContent) + 1;

    // Update likes in the DOM optimistically
    likeElement.textContent = `${likeCount} Likes`;

    // Send PATCH request to update likes on the server
    fetch(`http://localhost:3000/toys/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ likes: likeCount })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update likes');
        return response.json();
      })
      .catch(error => {
        // Revert DOM update on failure
        likeElement.textContent = `${likeCount - 1} Likes`;
        console.error('Error updating likes:', error);
      });
  }
}
