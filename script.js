const url = "https://books-api7.p.rapidapi.com/books/get/random/";
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "e80d44958bmsha72209489d5614ap11e287jsn373041979dbb",
    "X-RapidAPI-Host": "books-api7.p.rapidapi.com",
  },
};

// function to fetch random books using api
// fetching 10 books every time called
async function fetchBooks() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get("page")) || 1; // Get the page number from URL, default to 1

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => fetch(url, options))
    );

    const results = await Promise.all(
      responses.map((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
    );

    const bookCards = document.querySelectorAll(".book-card");
    var startingIndex = (page - 1) * 10 + 1;
    results.forEach((result, index) => {
      const bookCard = bookCards[index];
      var counter = startingIndex + index;
      bookCard.innerHTML = `
          <img src="${result.cover}"/>
          <h3>${counter}- ${result.title}</h3>
          <p>${result.author.first_name} ${result.author.last_name} - ${result.pages} page</p>
          <a href="${result.url}" class="btn" target="_blank">Book Now</a>
        `;
      counter++;
    });
  } catch (error) {
    console.error(error);
  }
}

// Call the function to fetch books when the page loads
window.onload = fetchBooks;
