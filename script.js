let products = [];
let cart = [];
let currentCategory = "all";
let cartCount = 0;

const cartBtn = document.getElementById("cart-btn");
const checkoutOverlay = document.getElementById("checkout-overlay");
const closeBtn = document.getElementById("close-btn");

async function loadProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) {
            throw new Error("Error fetching the data...");
        }
        products = await response.json();
        renderFeaturedProducts();
        renderProducts();

    } catch (error) {
        console.log("Error loading products:", error);
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById("featured-products");
    const featured = products.slice(14, 16);

    if (featured.length === 0) return;

    container.innerHTML = `
<div class="bg-white p-4 rounded-[12px] shadow-sm mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${featured
            .map((product, index) => `
                <div class="featured-product relative bg-white px-2 py-1 rounded-[12px] shadow-lg">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div class="product-badge dark">
                        ${index === 0 ? "Hot Pick" : "Most Loved"}
                    </div>
                    <div class="product-info">
                        <h4 class="product-info">
                            ${product.title.substring(0, 30)}...
                        </h4>
                        <button class="featured-add-btn" id="featured-btn-${product.id}">
                            $${product.price}
                        </button>
                    </div>
                </div>
            `).join("")}
    </div>
</div>
`;
attachAddToCartEvents();
}

function renderProducts() {
    const container = document.getElementById("products-grid");
    const filteredProducts = currentCategory === 'all' ? products : products.filter((p) => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        container.innerHTML = `<div class="loading"><p>No products found</p></div>`
        return;
    }
    container.innerHTML = filteredProducts.map((product) =>
        `<div class="product-card">
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-info">
        <h4 class="product-info">${product.title.substring(0, 40)}...</h4>
        <p class="text-gray-500">$${product.price}</p>
        <button class="add-btn-main" id="addtocart-btn-${product.id}">
        Add to cart
        </button>
        </div>
        </div>`).join("");

    attachAddToCartEvents();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    cartCount += 1;
    document.getElementById("cart-badge").textContent = cartCount;
}

function attachAddToCartEvents() {
    const buttons = document.querySelectorAll(".featured-add-btn, .add-btn-main");

    buttons.forEach(btn => {
        btn.onclick = null;
        btn.onclick = () => {
            let productId;

            if (btn.id.startsWith("featured-btn-")) {
                productId = parseInt(btn.id.split("-")[2]);
            } else if (btn.id.startsWith("addtocart-btn-")) {
                productId = parseInt(btn.id.split("-")[2]);
            }
            addToCart(productId);
        };
    });
}

function renderCart() {
    const checkoutContent = document.getElementById("checkout-content");
    const checkoutFooter = document.getElementById("checkout-footer");
    const totalAmountEl = document.getElementById("total-amount");

    if (cart.length === 0) {
        checkoutContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart text-[3rem] text-gray-300 mb-4"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        checkoutFooter.classList.add("hidden");
        checkoutFooter.style.display = "none";
        return;
    }
    checkoutFooter.classList.remove("hidden");
    checkoutFooter.style.display = "flex";

    let total = 0;
    checkoutContent.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title.substring(0, 30)}...</div>
                <div class="cart-item-price">$${item.price}</div>
                <div class="quantity-controls">
                    <button class="minus-btn" data-id="${item.id}">-</button>
                    <span class="px-[0.5rem] py-[0]">${item.quantity}</span>
                    <button class="add-btn" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>
        </div>
        `;
    }).join("");
    totalAmountEl.textContent = `Total: $${total.toFixed(2)}`;
    attachCartEvents();
}

function attachCartEvents() {
    const addBtns = document.querySelectorAll(".add-btn");
    const minusBtns = document.querySelectorAll(".minus-btn");
    const removeBtns = document.querySelectorAll(".remove-btn");

    addBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) item.quantity++;
            cartCount++;
            document.getElementById("cart-badge").textContent = cartCount;
            renderCart();
        });
    });

    minusBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item && item.quantity > 1) {
                item.quantity--;
                cartCount--;
                document.getElementById("cart-badge").textContent = cartCount;
                renderCart();
            }
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const itemIndex = cart.findIndex(i => i.id === id);
            if (itemIndex !== -1) {
                cartCount -= cart[itemIndex].quantity;
                cart.splice(itemIndex, 1);
                document.getElementById("cart-badge").textContent = cartCount;
                renderCart();
            }
        });
    });

}

cartBtn.addEventListener("click", () => {
    renderCart();
    checkoutOverlay.classList.remove("hidden");
    checkoutOverlay.style.display = "flex";
})

closeBtn.addEventListener("click", () => {
    checkoutOverlay.classList.add("hidden");
    checkoutOverlay.style.display = "none";
});

loadProducts();
