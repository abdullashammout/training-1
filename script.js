const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "e80d44958bmsha72209489d5614ap11e287jsn373041979dbb",
    "X-RapidAPI-Host": "books-api7.p.rapidapi.com",
  },
};

let currentPage = 1;
async function fetchBooks(page) {
  let url = `https://books-api7.p.rapidapi.com/books?p=${page}`;

  try {
    const response = await fetch(url, options);
    const books = await response.json();
    console.log(response);
    console.log(books);
    displayBooks(books);

    // Update pagination
    updatePagination(8, page); // Update pagination links
    const paginationLinks = document.querySelectorAll(".pagination a");
    paginationLinks.forEach((link) => {
      if (parseInt(link.textContent) === page) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function filterBooks(page, searchQuery) {
  try {
    let allBooks = [];

    // Fetch all pages of books
    for (let page = 1; ; page++) {
      const response = await fetch(
        `https://books-api7.p.rapidapi.com/books?p=${page}`,
        options
      );
      const books = await response.json();

      if (books.length === 0) {
        // No more books to fetch
        break;
      }

      allBooks = allBooks.concat(books);
    }

    // Filter books based on searchQuery
    const filteredBooks = allBooks.filter((book) => {
      return book.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    console.log(filteredBooks);
    displayBooks(filteredBooks);
  } catch (error) {
    console.error(error);
  }
}

document
  .querySelector(".search-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.querySelector('[name="search"]');
    const searchQuery = searchInput.value.trim().toLowerCase();
    if (searchQuery) {
      filterBooks(currentPage, searchQuery);
    } else {
      fetchBooks(currentPage);
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

function updatePagination(totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pagination ul");
  paginationContainer.innerHTML = ""; // Clear existing pagination links

  // Previous Button
  const previousPageLink = document.createElement("a");
  previousPageLink.href = "#";
  previousPageLink.textContent = "<";
  previousPageLink.onclick = function (event) {
    event.preventDefault(); // Prevent default link behavior
    if (currentPage > 1) {
      handlePaginationClick(currentPage - 1);
    }
  };
  const previousListItem = document.createElement("li");
  previousListItem.appendChild(previousPageLink);
  if (currentPage === 1) {
    previousPageLink.classList.add("disabled"); // Disable previous button on first page
  }
  paginationContainer.appendChild(previousListItem);

  // Page Numbers
  const startPage = Math.max(1, currentPage - 2); // Start page number
  const endPage = Math.min(totalPages, startPage + 4); // End page number
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.textContent = i;
    pageLink.onclick = function (event) {
      event.preventDefault(); // Prevent default link behavior
      handlePaginationClick(i);
    };

    const listItem = document.createElement("li");
    if (i === currentPage) {
      listItem.classList.add("active"); // Add active class to current page
    }
    listItem.appendChild(pageLink);
    paginationContainer.appendChild(listItem);
  }

  // Next Button
  const nextPageLink = document.createElement("a");
  nextPageLink.href = "#";
  nextPageLink.textContent = ">";
  nextPageLink.onclick = function (event) {
    event.preventDefault(); // Prevent default link behavior
    if (currentPage < totalPages) {
      handlePaginationClick(currentPage + 1);
    }
  };
  const nextListItem = document.createElement("li");
  nextListItem.appendChild(nextPageLink);
  if (currentPage === totalPages) {
    nextPageLink.classList.add("disabled"); // Disable next button on last page
  }
  paginationContainer.appendChild(nextListItem);
}

function handlePaginationClick(page) {
  // Remove active class from previously active pagination link
  const activeLink = document.querySelector(".pagination a.active");
  if (activeLink) {
    activeLink.classList.remove("active");
  }

  // Update current page
  currentPage = page;
  fetchBooks(page);

  // Add active class to the clicked pagination link
  event.target.classList.add("active");
}

fetchBooks(currentPage);
