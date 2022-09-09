const books = [];
const searchedBooks = [];
const STORAGE_KEY = 'BOOKSHELF';

const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const SEARCH_EVENT = 'search-book';


//Saved event
document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

//Render Event
document.addEventListener(RENDER_EVENT, function () {
    const completedBookshelf = document.getElementById('completeBookshelfList');
    completedBookshelf.innerHTML = '';

    const incompletedBookshelf = document.getElementById('incompleteBookshelfList');
    incompletedBookshelf.innerHTML = '';

    // console.log(books)
    for (const book of books) {
        const bookElement = makeBook(book);
        if (!book.isCompleted) {
            incompletedBookshelf.appendChild(bookElement);
        } else {
            completedBookshelf.appendChild(bookElement);
        }
    }
});

// Search event
document.addEventListener(SEARCH_EVENT, function () {
    const completedBookshelf = document.getElementById('completeBookshelfList');
    completedBookshelf.innerHTML = '';

    const incompletedBookshelf = document.getElementById('incompleteBookshelfList');
    incompletedBookshelf.innerHTML = '';

    for (const book of searchedBooks) {
        const bookElement = makeBook(book);
        if (!book.isCompleted) {
            incompletedBookshelf.appendChild(bookElement);
        } else {
            completedBookshelf.appendChild(bookElement);
        }
    }
});

//Membaca keseluruhan elemen DOM
document.addEventListener('DOMContentLoaded', function () {
    const inputForm = document.getElementById('inputBook');
    inputForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchedBook();
    });

    if (isStorageExists()) {
        loadDataFromStorage();
    }
});

// Mengecek apakah browser mendukung web storage
function isStorageExists() {
    if (typeof (Storage) === undefined) {
        alert('Browser ini tidak mendukung fitur Web Storage!');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serialData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serialData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExists()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        // document.dispatchEvent(new Event(SAVED_EVENT))
    }

}

//Menggunakan +new Date untuk mendapatkan id yang unik
function generateId() {
    return +new Date();
}

// data buku masuk
function bookInputData(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

//fungsi untuk searching buku yang tersimpan
function searchedBook() {
    const keywords = document.getElementById('searchBookTitle').value;
    searchedBooks.length = 0;

    for (const bookObject of books) {
        if (bookObject.title.includes(keywords)) {
            searchedBooks.push(bookObject);
        }
    }
    document.dispatchEvent(new Event(SEARCH_EVENT));
}


//menambah buku
function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookIsCompleted = document.querySelector('#inputBookIsComplete').checked;

    const bookId = generateId();
    const bookObject = bookInputData(bookId, bookTitle, bookAuthor, bookYear, bookIsCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    alert('Buku berhasil disimpan!')
    saveData();
}

//Menmindahkan buku dari rak Belum Selesai Dibaca
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    alert('Buku ditandai BELUM SELESAI DIBACA')
    saveData();
}

//Fungsi Hapus
function removeBookFromCompleted(bookId) {
    const bookTarget = bookIndex(bookId);

    console.log(bookTarget)
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    alert('Buku telah dihapus!')
    saveData();
}

//Fungsi menambah buku ke rak selesai dibaca
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    alert('Buku ditandai SELESAI DIBACA')
    saveData();
}

//memasukkan buku
function makeBook(bookObject) {
    const title = document.createElement('h3');
    title.innerText = bookObject.title;

    const author = document.createElement('p');
    author.innerText = `Penulis : ${bookObject.author}`;

    const year = document.createElement('p');
    year.innerText = `Tahun : ${bookObject.year}`;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.setAttribute('id', `${bookObject.id}`);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    if (bookObject.isCompleted) {
        const completedButton = document.createElement('button');
        completedButton.classList.add('green');
        completedButton.innerText = 'Belum Selesai dibaca';

        completedButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const eraseBook = document.createElement('button');
        eraseBook.classList.add('red');
        eraseBook.innerText = 'Hapus buku';

        eraseBook.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id);
        });

        buttonContainer.append(completedButton, eraseBook);
    } else {
        const incompletedButton = document.createElement('button');
        incompletedButton.classList.add('green');
        incompletedButton.innerText = 'Selesai dibaca';

        incompletedButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const eraseBook = document.createElement('button');
        eraseBook.classList.add('red');
        eraseBook.innerText = 'Hapus buku';

        eraseBook.addEventListener('click', function () {
            removeBookFromCompleted(bookObject.id)
        });

        buttonContainer.append(incompletedButton, eraseBook);
    }
    container.appendChild(title);
    container.appendChild(author);
    container.appendChild(year);
    container.append(buttonContainer);

    return container;
}

function bookIndex(id) {
    for (const index in books) {
        if (books[index].id === id) {
            return index;
        }
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}