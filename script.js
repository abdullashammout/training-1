const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "e80d44958bmsha72209489d5614ap11e287jsn373041979dbb",
    "X-RapidAPI-Host": "books-api7.p.rapidapi.com",
  },
};

let currentPage = 1;
async function fetchBooks(page, searchQuery = "") {
  let url = `https://books-api7.p.rapidapi.com/books?p=${page}`;

  // If searchQuery is provided, construct the search URL
  if (searchQuery) {
    // Construct regular expression for partial matches
    const regex = new RegExp(searchQuery, "i"); // 'i' flag for case-insensitive search
    url += `&title=${encodeURIComponent(searchQuery)}`;

    try {
      const response = await fetch(url, options);
      const books = await response.json();

      // Filter books array based on partial title match
      const filteredBooks = books.filter((book) => regex.test(book.title));

      console.log(filteredBooks);
      displayBooks(filteredBooks); // Call function to display filtered books
    } catch (error) {
      console.error(error);
    }
  } else {
    // If no search query, fetch books without filtering
    try {
      const response = await fetch(url, options);
      const books = await response.json();

      console.log(books);
      displayBooks(books); // Call function to display books
    } catch (error) {
      console.error(error);
    }
  }
}
document
  .querySelector(".search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.querySelector('[name="search"]');
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      fetchBooks(currentPage, searchQuery);
    }
  });

function splitTitle(title) {
  const maxLength = 15; // Maximum characters allowed for title before splitting
  if (title.length > maxLength) {
    // Split title into multiple lines
    const words = title.split(" ");
    let currentLine = "";
    let lines = [];

    for (let word of words) {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += word + " ";
    }

    lines.push(currentLine.trim());
    return lines.join("\n"); // Join lines with newline character
  } else {
    return title; // Return the original title if it's within the limit
  }
}
function displayBooks(books) {
  const featuredSection = document.querySelector(".featured");
  featuredSection.innerHTML = ""; // Clear previous content

  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    const title = document.createElement("h3");
    title.textContent = splitTitle(book.title);

    const img = document.createElement("img");
    img.src = book.cover;

    const detailsOverlay = document.createElement("div");
    detailsOverlay.classList.add("details-overlay");

    const author = document.createElement("p");
    author.textContent =
      "Author:" + book.author.first_name + " " + book.author.last_name;

    const pages = document.createElement("p");
    pages.textContent = "Pages: " + book.pages;

    const rating = document.createElement("p");
    rating.textContent = "Rating: " + book.rating;

    detailsOverlay.appendChild(author);
    detailsOverlay.appendChild(pages);
    detailsOverlay.appendChild(rating);

    bookCard.appendChild(title);
    bookCard.appendChild(img);
    bookCard.appendChild(detailsOverlay);

    featuredSection.appendChild(bookCard);
  });
}

function handlePaginationClick(page) {
  currentPage = page; // Update current page
  fetchBooks(page);

  const paginationLinks = document.querySelectorAll(".pagination a");
  paginationLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to the clicked pagination link
  event.target.classList.add("active");
}

fetchBooks(currentPage);
