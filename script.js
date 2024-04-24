const baseURL = "http://localhost:3000"; // Update the base URL to match your Node.js server

let currentPage = 1;
async function fetchBooks(page) {
  let url = `${baseURL}/books?page=${page}`; // Update the endpoint URL

  try {
    const response = await fetch(url);
    const books = await response.json();
    displayBooks(books);
    console.log(books);
    // Update pagination
    updatePagination(books.totalPages, page);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const addBookForm = document.getElementById("addBookForm");
  const featuredSection = document.querySelector(".featured");

  if (!addBookForm) {
    console.error("Add book form element not found.");
    return; // Exit the function if form element is not found
  }

  if (!featuredSection) {
    console.error("Featured section element not found.");
    return; // Exit the function if featured section element is not found
  }

  addBookForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const cover = document.getElementById("cover").value;
    const pages = document.getElementById("pages").value;
    const rating = document.getElementById("rating").value;

    const bookData = {
      title,
      author,
      cover,
      pages: parseInt(pages),
      rating: parseInt(rating),
    };
    const bookId = document.getElementById("addButton").dataset.bookId;
    if (bookId) {
      // Update the book
      try {
        const response = await fetch(`${baseURL}/books/${bookId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });

        if (response.ok) {
          const updatedBook = await response.json();

          // Remove the old book card from the DOM
          const oldBookCard = document.querySelector(
            `.book-card[data-book-id="${bookId}"]`
          );
          if (oldBookCard) {
            oldBookCard.remove();
          }

          console.log("Book updated successfully:", updatedBook);
          fetchBooks(currentPage);
          // Reset the form and button text
          addBookForm.reset();
          document.getElementById("addButton").textContent = "Add Book";
          delete document.getElementById("addButton").dataset.bookId;
        } else {
          const error = await response.json();
          console.error("Error updating book:", error.message);
        }
      } catch (error) {
        console.error("Error updating book:", error);
      }
    } else {
      try {
        const response = await fetch(`${baseURL}/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        });

        if (response.ok) {
          const newBook = await response.json();
          console.log("New book added:", newBook);
          fetchBooks(currentPage); // Update the book list after adding a new book
        } else {
          const error = await response.json();
          console.error("Error adding book:", error.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  // Event listeners for edit and delete buttons
  featuredSection.addEventListener("click", async function (event) {
    const target = event.target;

    if (target.classList.contains("edit-btn")) {
      const bookCard = target.closest(".book-card");
      if (!bookCard) {
        console.error("Parent book card not found.");
        return;
      }
      const bookId = bookCard.dataset.bookId;
      const title = bookCard.querySelector("h3").textContent.trim();
      const author = bookCard
        .querySelector(".details-overlay p:nth-child(1)")
        .textContent.trim()
        .replace("Author: ", "");
      const cover = bookCard.querySelector("img").src;
      const pages = parseInt(
        bookCard
          .querySelector(".details-overlay p:nth-child(2)")
          .textContent.trim()
          .replace("Pages: ", "")
      );
      const rating = parseInt(
        bookCard
          .querySelector(".details-overlay p:nth-child(3)")
          .textContent.trim()
          .replace("Rating: ", "")
      );

      // Populate form fields with book data
      document.getElementById("title").value = title;
      document.getElementById("author").value = author;
      document.getElementById("cover").value = cover;
      document.getElementById("pages").value = pages;
      document.getElementById("rating").value = rating;

      // Change button text to "Update"
      document.getElementById("addButton").textContent = "Update";
      document.getElementById("addButton").dataset.bookId = bookId; // Store book ID as a data attribute
    }

    if (target.classList.contains("delete-btn")) {
      // Find the parent book card
      const bookCard = target.closest(".book-card");
      if (!bookCard) {
        console.error("Parent book card not found.");
        return;
      }

      // Get the book ID from the data-book-id attribute of the book card
      const bookId = bookCard.dataset.bookId;

      // Ask the user to confirm the deletion
      const confirmation = confirm(
        "Are you sure you want to delete this book?"
      );
      if (confirmation) {
        try {
          // Send a DELETE request to the server
          const response = await fetch(`${baseURL}/books/${bookId}`, {
            method: "DELETE",
          });

          // Handle the server response
          if (response.ok) {
            // Successfully deleted the book
            bookCard.remove(); // Remove the book card from the DOM
            console.log("Book deleted successfully.");
          } else {
            // There was an error during deletion
            const errorData = await response.json();
            console.error("Error deleting book:", errorData.error);
          }
        } catch (error) {
          console.error("An error occurred while deleting the book:", error);
        }
      }
    }
  });
});

async function filterBooks(page, searchQuery) {
  try {
    const response = await fetch(
      `${baseURL}/books?search=${searchQuery}&page=${page}`
    );
    const filteredBooks = await response.json();
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
      filterBooks(1, searchQuery);
    } else {
      fetchBooks(1);
    }
  });

// Rest of the JavaScript code remains the same

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
    bookCard.setAttribute("data-book-id", book.id);

    const title = document.createElement("h3");
    title.textContent = splitTitle(book.title);

    const img = document.createElement("img");
    img.src = book.cover;

    const detailsOverlay = document.createElement("div");
    detailsOverlay.classList.add("details-overlay");

    const author = document.createElement("p");
    author.textContent = "Author: " + book.author;

    const pages = document.createElement("p");
    pages.textContent = "Pages: " + book.pages;

    const rating = document.createElement("p");
    rating.textContent = "Rating: " + book.rating;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const editButton = document.createElement("button");
    editButton.classList.add("edit-btn");
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Delete";

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    detailsOverlay.appendChild(author);
    detailsOverlay.appendChild(pages);
    detailsOverlay.appendChild(rating);
    detailsOverlay.appendChild(editButton);
    detailsOverlay.appendChild(deleteButton);

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
const ratingInput = document.getElementById("rating");
const ratingValueDisplay = document.getElementById("ratingValue");

ratingInput.addEventListener("input", function () {
  const rating = ratingInput.value;
  ratingValueDisplay.textContent = rating;
});

fetchBooks(currentPage);
