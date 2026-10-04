const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const pagination = document.getElementById("pagination");
const themeToggle = document.getElementById("themeToggle");

// Stats Elements
const totalProductsCount = document.getElementById("totalProductsCount");
const showingCount = document.getElementById("showingCount");
const remainingCount = document.getElementById("remainingCount");

let currentPage = 1;
let totalProduct = 0;
let product_per_page = 10;
let isSearchMode = false; // Check karne ke liye ki search ho raha hai ya normal page load

const Api_URl = "https://dummyjson.com/products";
let products = [];

// Fetch Products Function (Normal Pagination)
const getProducts = async (page = 1) => {
    try {
        isSearchMode = false;
        if (loading) loading.style.display = "block";
        if (error) error.innerText = "";
        
        const skip = (page - 1) * product_per_page;
        const response = await fetch(`${Api_URl}?limit=${product_per_page}&skip=${skip}`);
        
        if (!response.ok) {
            throw new Error("API Network error");
        }
        
        const data = await response.json();
        
        displayProducts(data.products);
        products = data.products;
        
        totalProduct = data.total;
        currentPage = page;
        
        updateStats();
        createPagination();
    } catch (err) {
        if (error) error.innerText = "Failed to load products. Please check connection.";
    } finally {
        if (loading) loading.style.display = "none";
    }
};

// Global Search API Function (Saare products search karne ke liye)
const searchProducts = async (query) => {
    try {
        isSearchMode = true;
        if (loading) loading.style.display = "block";
        if (error) error.innerText = "";

        const response = await fetch(`${Api_URl}/search?q=${query}`);
        if (!response.ok) throw new Error("Search API error");

        const data = await response.json();
        
        displayProducts(data.products);
        products = data.products;
        totalProduct = data.total;

        // Search stats update
        if (totalProductsCount) totalProductsCount.innerText = totalProduct;
        if (showingCount) showingCount.innerText = data.products.length;
        if (remainingCount) remainingCount.innerText = 0;

        // Search ke waqt regular pagination chhupa dein
        if (pagination) pagination.innerHTML = "";
    } catch (err) {
        if (error) error.innerText = "Error searching products.";
    } finally {
        if (loading) loading.style.display = "none";
    }
};

// Live Stats Update Function
const updateStats = () => {
    const currentlyShowing = products.length;
    const remaining = Math.max(0, totalProduct - (currentPage * product_per_page));

    if (totalProductsCount) totalProductsCount.innerText = totalProduct;
    if (showingCount) showingCount.innerText = currentlyShowing;
    if (remainingCount) remainingCount.innerText = remaining;
};

// First Load
getProducts();

// Dynamic 3-Button Sliding Window Pagination
const createPagination = () => {
    if (!pagination || isSearchMode) return;
    pagination.innerHTML = "";
    
    let totalPages = Math.ceil(totalProduct / product_per_page);
    if (totalPages <= 1) return;

    // Back Button
    let previousBtn = document.createElement("button");
    previousBtn.innerText = "Back";
    previousBtn.disabled = (currentPage === 1);
    previousBtn.addEventListener("click", () => getProducts(currentPage - 1));
    pagination.appendChild(previousBtn);

    // Sliding Window of 3 Numbers
    let startPage = Math.max(1, currentPage - 1);
    let endPage = startPage + 2;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        let btn = document.createElement("button");
        btn.innerText = i;
        
        if (currentPage === i) {
            btn.classList.add("active-page");
            btn.disabled = true;
        }

        btn.addEventListener("click", () => getProducts(i));
        pagination.appendChild(btn);
    }

    // Next Button
    let nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.addEventListener("click", () => getProducts(currentPage + 1));
    pagination.appendChild(nextBtn);
};

// Display Products Card
const displayProducts = (data) => {
    if (!productContainer) return;
    productContainer.innerHTML = "";
    if (!data || data.length === 0) {
        productContainer.innerHTML = `<h3 style="grid-column: 1/-1; text-align: center; margin: 40px 0;">No products found</h3>`;
        return;
    }

    data.forEach((element) => {
        const card = document.createElement("div");
        card.classList.add("product");

        card.innerHTML = `
            <div class="product-img-wrapper">
                <span class="category-tag">${element.category}</span>
                <img src="${element.thumbnail}" alt="${element.title}">
            </div>
            <h2>${element.title}</h2>
            <div class="price_rating">
                <div class="price">$${element.price}</div>
                <div class="rating">⭐ ${element.rating}</div>
            </div>
        `;
        productContainer.appendChild(card);
    });
};

// Smart Search Event Listener (Page 1, 2, 3... pure store me search karega)
let searchTimeout;
if (searchInput) {
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        const searchText = searchInput.value.trim();

        // 300ms debounce taaki fast typing par load kam pade
        searchTimeout = setTimeout(() => {
            if (searchText === "") {
                getProducts(1); // Agar search empty kar dein toh wapis normal Page 1 load kar de
            } else {
                searchProducts(searchText); // Pure database mein search karega
            }
        }, 300);
    });
}

// Dark / Light Theme Logic
(function () {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('storehub-ui-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<span class="theme-icon">🌙</span><span>Theme</span>';
    }

    themeBtn.addEventListener('click', function () {
        const isDark = document.body.classList.toggle('dark-mode');
        themeBtn.innerHTML = isDark ? '<span class="theme-icon">🌙</span><span>Theme</span>' : '<span class="theme-icon">☀️</span><span>Theme</span>';
        localStorage.setItem('storehub-ui-theme', isDark ? 'dark' : 'light');
    });
})();