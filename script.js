/* =========================
   1. STORE SETTINGS
========================= */

// Replace this with your own WhatsApp number.
// Use the country code, without + or spaces.
const WHATSAPP_NUMBER = "254705315596";

// The cart stores products selected by the customer.
let cart = [];


/* =========================
   2. READ PRODUCT INFORMATION
========================= */

function getProductDetails(card) {
    const name = card.querySelector("h3")?.textContent.trim();
    const description =
        card.querySelector(".description")?.textContent.trim();

    const priceText =
        card.querySelector(".price")?.textContent.trim() || "";

    // Only allow an order if a real numeric price is displayed.
    const match = priceText.replace(/,/g, "").match(/\d+(?:\.\d+)?/);

    if (!name || !match ||
        /to be confirmed|coming soon/i.test(priceText)) {
        alert("This product's price is not confirmed yet.");
        return null;
    }

    const price = Number(match[0]);

    if (!Number.isFinite(price) || price <= 0) {
        alert("Please check this product's price.");
        return null;
    }

    const image = card.querySelector("img")?.getAttribute("src") || "";

    return {
        name,
        description: description || "",
        price,
        image
    };
}


/* =========================
   3. ADD PRODUCTS TO CART
========================= */

function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
    alert(product.name + " added to your cart.");
}


//

function renderCart() {

    const cartItems = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const countElement = document.getElementById("cart-count");

    if (!cartItems || !totalElement) {
        console.warn("Add the cart HTML section to index.html.");
        return;
    }

    cartItems.replaceChildren();

    let total = 0;
    let count = 0;

    // Check whether the cart is empty
    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is currently empty.</p>";
    }

    // Display each product
    cart.forEach((item, index) => {

        total += item.price * item.quantity;
        count += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        // Product details
        const details = document.createElement("div");
        details.className = "cart-product-details";

        details.innerHTML = `
            <h4>${item.name}</h4>
            <p>Unit Price: KSh ${item.price.toLocaleString("en-KE")}</p>
            <p>Subtotal: KSh ${(item.price * item.quantity).toLocaleString("en-KE")}</p>
        `;

        // Quantity controls
        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.textContent = "−";
        decreaseButton.type = "button";
        decreaseButton.disabled = item.quantity <= 1;

        decreaseButton.addEventListener("click", () => {
            if (item.quantity > 1) {
                item.quantity--;
                renderCart();
            }
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.textContent = "+";
        increaseButton.type = "button";

        increaseButton.addEventListener("click", () => {
            item.quantity++;
            renderCart();
        });

        quantityControls.append(
            decreaseButton,
            quantity,
            increaseButton
        );

        // Remove product
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.className = "remove-cart-item";

        removeButton.addEventListener("click", () => {
            cart.splice(index, 1);
            renderCart();
        });

        row.append(
            details,
            quantityControls,
            removeButton
        );

        cartItems.appendChild(row);
    });

    // Update cart total and item count
    totalElement.textContent =
        "KSh " + total.toLocaleString("en-KE");

    if (countElement) {
        countElement.textContent = count;
    }
}


/* =========================
   5. CONNECT PRODUCT BUTTONS
========================= */

document.querySelectorAll(".product-card").forEach(card => {
    const button = card.querySelector("button");

    if (!button) return;

    // Change this text to "Add to Cart" in your HTML
    // for products that should enter the cart.
    button.addEventListener("click", () => {
        const product = getProductDetails(card);

        if (!product) return;

        addToCart(product);
    });
});


/* =========================
   6. WHATSAPP CHECKOUT
========================= */

function sendToWhatsApp(orderText) {
    if (!/^254\d{9}$/.test(WHATSAPP_NUMBER)) {
        alert("Set your real WhatsApp number in script.js first.");
        return;
    }

    const url =
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(orderText);

    window.open(url, "_blank", "noopener,noreferrer");
}
/* PRODUCT WHATSAPP ENQUIRIES */

document.querySelectorAll(".whatsapp-order").forEach(button => {

    button.addEventListener("click", function() {

        const productCard = button.closest(".product-card");

        const productName = productCard.querySelector("h3").textContent;
        const productDescription = productCard.querySelector("p").textContent;
        const productPrice = productCard.querySelector(".price").textContent;

        const message =
            "Hello Nexora Electronics!\n\n" +
            "I am interested in: " + productName + "\n" +
            productDescription + "\n" +
            productPrice + "\n\n" +
            "Please confirm availability and delivery details.";

        sendToWhatsApp(message);

    });

});

/* =========================
   7. SEND CART ORDER
========================= */

const orderForm = document.getElementById("order-form");

if (orderForm) {
    orderForm.addEventListener("submit", function(event) {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty. Add a product first.");
            return;
        }

        const customerName =
            document.getElementById("customer-name").value.trim();

        const customerPhone =
            document.getElementById("customer-phone").value.trim();

        const deliveryLocation =
            document.getElementById("delivery-location").value.trim();

        if (!customerName || !customerPhone || !deliveryLocation) {
            alert("Please complete all required fields.");
            return;
        }

        const lines = cart.map(item =>
            `${item.name} x ${item.quantity} = KSh ${
                (item.price * item.quantity).toLocaleString("en-KE")
            }`
        );

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        const message = [
            "Hello Nexora Electronics, I would like to place an order.",
            "",
            "Customer: " + customerName,
            "Phone: " + customerPhone,
            "Delivery location: " + deliveryLocation,
            "",
            "Products:",
            ...lines,
            "",
            "Product total: KSh " + total.toLocaleString("en-KE"),
            "Please confirm availability and delivery charges."
        ].join("\n");

        sendToWhatsApp(message);
    });
}


/* =========================
   8. DIRECT WHATSAPP BUTTONS
========================= */


// OPEN CHECKOUT FORM
const checkoutButton = document.getElementById("checkout-button");
const checkoutForm = document.getElementById("checkout-form");

if (checkoutButton && checkoutForm) {
    checkoutButton.addEventListener("click", function() {
        checkoutForm.style.display = "block";
        checkoutForm.scrollIntoView({
            behavior: "smooth"
        });
    });
}

// Show the initial cart.
renderCart();